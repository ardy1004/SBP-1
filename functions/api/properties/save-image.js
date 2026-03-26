/**
 * POST /api/properties/save-image
 * Simpan URL gambar ke property_images table
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const { property_id, image_url, is_primary, sort_order } = body;

    if (!property_id || !image_url) {
      return errorResponse("property_id dan image_url wajib diisi", 400, request);
    }

    // Generate ID untuk image
    const id = crypto.randomUUID();

    // Simpan ke property_images table
    try {
      await env.DB.prepare(
        "INSERT INTO property_images (id, property_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)"
      ).bind(
        id,
        property_id,
        image_url,
        is_primary ? 1 : 0,
        sort_order || 0
      ).run();
    } catch (imageInsertError) {
      console.warn("[SAVE IMAGE] Falling back to legacy property_images schema:", imageInsertError?.message || imageInsertError);
      await env.DB.prepare(
        "INSERT INTO property_images (id, property_id, url, filename, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        id,
        property_id,
        image_url,
        image_url.split("/").pop() || `image-${id}`,
        is_primary ? 1 : 0,
        sort_order || 0
      ).run();
    }

    return jsonResponse({
      success: true,
      id,
      message: "Gambar berhasil disimpan",
    }, 201, request);

  } catch (error) {
    console.error("Save image error:", error);
    return errorResponse("Gagal menyimpan gambar", 500, request);
  }
}
