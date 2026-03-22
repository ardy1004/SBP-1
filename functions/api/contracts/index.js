/**
 * /api/contracts
 * POST - Create new contract (admin only)
 * GET  - List all contracts (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// POST /api/contracts - Buat kontrak baru
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();

    if (!body.owner_name || !body.contract_type) {
      return errorResponse("Nama owner dan tipe kontrak wajib diisi", 400, request);
    }

    const id = crypto.randomUUID();
    const contractNumber = `SBP-${body.listing_code || Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    // Hitung expiry date berdasarkan durasi
    let expiryDate = null;
    if (body.contract_duration) {
      const months = parseInt(body.contract_duration) || 6;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + months);
      expiryDate = expiry.toISOString().split("T")[0];
    }

    await env.DB.prepare(`
      INSERT INTO contracts (
        id, contract_number, listing_code, property_id, property_title,
        owner_name, owner_ktp, owner_whatsapp,
        contract_type, contract_duration, fee_percent,
        signed_date, expiry_date, status,
        owner_signature, agent_signature, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, contractNumber, body.listing_code || null, body.property_id || null, body.property_title || null,
      body.owner_name, body.owner_ktp || null, body.owner_whatsapp || null,
      body.contract_type, body.contract_duration || null, body.fee_percent || 3,
      now.split("T")[0], expiryDate, "active",
      body.owner_signature || null, body.agent_signature || null, body.notes || null,
      now, now
    ).run();

    // Log activity
    await env.DB.prepare(
      "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      admin.id, "Create", "contract", id,
      `Kontrak baru: ${contractNumber} - ${body.owner_name}`,
      request.headers.get("CF-Connecting-IP") || "unknown"
    ).run();

    return jsonResponse({
      success: true,
      id,
      contract_number: contractNumber,
      message: "Kontrak berhasil dibuat",
    }, 201, request);

  } catch (error) {
    console.error("Contract create error:", error);
    return errorResponse("Gagal membuat kontrak", 500, request);
  }
}

// GET /api/contracts - List kontrak (admin only)
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (type) {
      whereClause += " AND contract_type = ?";
      params.push(type);
    }

    const contracts = await env.DB.prepare(
      `SELECT * FROM contracts ${whereClause} ORDER BY created_at DESC`
    ).bind(...params).all();

    return jsonResponse({
      success: true,
      data: contracts.results || [],
    }, 200, request);

  } catch (error) {
    console.error("Contracts list error:", error);
    return errorResponse("Gagal mengambil data kontrak", 500, request);
  }
}
