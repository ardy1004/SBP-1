/**
 * GET /api/import/history
 * Get import history list
 * 
 * Headers: Authorization: Bearer {token}
 * Query: page, limit
 * Response: { success, data: [], pagination: {} }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Verifikasi admin - skip untuk development
    let admin = null;
    try {
      admin = await requireAuth(request, env);
    } catch (authErr) {
      console.log("[HISTORY] Auth check failed, continuing for dev");
    }

    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized", 401, request);
    }

    // Parse query params
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Query import_logs
    const result = await env.DB.prepare(`
      SELECT * FROM import_logs 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    // Get total count
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM import_logs"
    ).first();

    return jsonResponse({
      success: true,
      data: result.results || [],
      pagination: {
        page,
        limit,
        total: countResult?.total || 0,
        total_pages: Math.ceil((countResult?.total || 0) / limit)
      }
    }, 200, request);

  } catch (error) {
    console.error("History fetch error:", error);
    return errorResponse("Gagal mengambil history import", 500, request);
  }
}
