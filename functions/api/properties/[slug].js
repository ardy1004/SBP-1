/**
 * /api/properties/[slug]
 * GET - Get single property by slug (public)
 * PUT - Update property (admin only)
 * DELETE - Delete property (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/properties/:slug - Ambil detail properti
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { slug } = params;

    // Query by slug OR id (UUID) — admin edit uses id, public uses slug
    let property = await env.DB.prepare(
      `SELECT p.* FROM properties p WHERE p.slug = ? OR p.id = ?`
    ).bind(slug, slug).first();

    // Jika tidak ditemukan, cek slug_redirects untuk 301 redirect
    if (!property && env.DB) {
      const redirect = await env.DB.prepare(
        `SELECT new_slug FROM slug_redirects WHERE old_slug = ?`
      ).bind(slug).first();
      
      if (redirect && redirect.new_slug) {
        // Return 301 redirect ke slug baru
        const newUrl = new URL(request.url);
        newUrl.pathname = `/api/properties/${redirect.new_slug}`;
        
        return new Response(null, {
          status: 301,
          headers: {
            "Location": newUrl.toString(),
            "Cache-Control": "public, max-age=31536000" // Cache 1 tahun
          }
        });
      }
    }

    if (!property) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // Increment views
    await env.DB.prepare(
      "UPDATE properties SET views_count = views_count + 1 WHERE id = ?"
    ).bind(property.id).run();

    // Ambil semua gambar
    let images;
    try {
      images = await env.DB.prepare(
        "SELECT id, image_url, image_webp_url, is_primary, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC"
      ).bind(property.id).all();
    } catch (imageSchemaError) {
      console.warn("[PROPERTY DETAIL] Falling back to legacy property_images schema:", imageSchemaError?.message || imageSchemaError);
      images = await env.DB.prepare(
        "SELECT id, url as image_url, NULL as image_webp_url, is_primary, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC"
      ).bind(property.id).all();
    }

    // Format response dengan data lengkap
    const formatted = {
      id: property.id,
      listing_code: property.listing_code,
      title: property.title,
      slug: property.slug,
      purpose: property.purpose,
      property_type: property.property_type,
      price: property.price_offer,
      price_rent: property.price_rent,
      old_price: property.old_price,
      price_type: property.price_type,
      province: property.province,
      city: property.city,
      district: property.district,
      village: property.village,
      address: property.address,
      location: `${property.district || ""}, ${property.city}, ${property.province}`.replace(/^,\s*/, ""),
      google_maps_url: property.google_maps_url,
      latitude: property.latitude,
      longitude: property.longitude,
      land_area: property.land_area,
      building_area: property.building_area,
      front_width: property.front_width,
      floors: property.floors,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      legal_status: property.legal_status,
      ownership_status: property.ownership_status,
      bank_name: property.bank_name,
      outstanding_amount: property.outstanding_amount,
      environmental_status: property.environmental_status,
      distance_to_river: property.distance_to_river,
      distance_to_grave: property.distance_to_grave,
      distance_to_powerline: property.distance_to_powerline,
      road_width: property.road_width,
      description: property.description,
      facilities: property.facilities ? JSON.parse(property.facilities) : [],
      selling_reason: property.selling_reason,
      images: (images.results || []).map(img => ({
        id: img.id,
        url: img.image_url || img.image_webp_url,
        is_primary: !!img.is_primary,
        sort_order: img.sort_order,
      })),
      is_premium: !!property.is_premium,
      is_featured: !!property.is_featured,
      is_hot: !!property.is_hot,
      is_sold: !!property.is_sold,
      is_choice: !!property.is_choice,
      views_count: property.views_count + 1,
      created_at: property.created_at,
      updated_at: property.updated_at,
    };

    return jsonResponse({ success: true, data: formatted }, 200, request);

  } catch (error) {
    console.error("Property detail error:", error);
    return errorResponse("Gagal mengambil data properti", 500, request);
  }
}

// PUT /api/properties/:id - Update properti
export async function onRequestPut(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Verifikasi admin - skip untuk development jika token tidak valid
    let admin = null;
    try {
      admin = await requireAuth(request, env);
    } catch (authErr) {
      console.log("[PUT] Auth check failed, continuing without auth for dev");
    }
    
    // Di production, wajib auth. Di development, boleh tanpa auth
    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized", 401, request);
    }

    // Parameter name is 'slug' but we use it as 'id' for update
    const id = params.slug || params.id;
    const body = await request.json();

    // Cek properti exists
    const existing = await env.DB.prepare("SELECT id FROM properties WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // Build dynamic update - hanya field yang dikirim
    const allowedFields = [
      "title", "slug", "purpose", "property_type", "price_offer", "price_rent",
      "old_price", "price_type", "province", "city", "district", "village",
      "address", "google_maps_url", "latitude", "longitude",
      "land_area", "building_area", "front_width", "floors", "bedrooms", "bathrooms",
      "legal_status", "ownership_status", "bank_name", "outstanding_amount",
      "environmental_status", "road_width", "description", "facilities",
      "selling_reason", "owner_name", "owner_whatsapp_1", "owner_whatsapp_2",
      "is_premium", "is_featured", "is_hot", "is_sold", "is_choice", "status"
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        if (field === "facilities" && Array.isArray(body[field])) {
          values.push(JSON.stringify(body[field]));
        } else if (["is_premium", "is_featured", "is_hot", "is_sold", "is_choice"].includes(field)) {
          values.push(body[field] ? 1 : 0);
        } else {
          values.push(body[field]);
        }
      }
    }

    if (setClauses.length === 0) {
      return errorResponse("Tidak ada field yang diupdate", 400, request);
    }

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await env.DB.prepare(
      `UPDATE properties SET ${setClauses.join(", ")} WHERE id = ?`
    ).bind(...values).run();

    // Log activity (hanya jika admin ada)
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        admin.id, "Update", "property", id,
        `Properti diupdate: ${body.title || id}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({ success: true, message: "Properti berhasil diupdate" }, 200, request);

  } catch (error) {
    console.error("Property update error:", error);
    return errorResponse("Gagal mengupdate properti", 500, request);
  }
}

// DELETE /api/properties/:id - Hapus properti
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Verifikasi admin - skip untuk development jika token tidak valid
    let admin = null;
    try {
      admin = await requireAuth(request, env);
    } catch (authErr) {
      console.log("[DELETE] Auth check failed, continuing without auth for dev");
    }
    
    // Di production, wajib auth. Di development, boleh tanpa auth
    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized", 401, request);
    }

    // Parameter name is 'slug' but we use it as 'id' for delete
    const id = params.slug || params.id;

    // Cek properti exists
    const existing = await env.DB.prepare("SELECT id, title FROM properties WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // Hapus gambar dulu (foreign key)
    await env.DB.prepare("DELETE FROM property_images WHERE property_id = ?").bind(id).run();

    // Hapus properti
    await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();

    // Log activity (hanya jika admin ada)
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        admin.id, "Delete", "property", id,
        `Properti dihapus: ${existing.title}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({ success: true, message: "Properti berhasil dihapus" }, 200, request);

  } catch (error) {
    console.error("Property delete error:", error);
    return errorResponse("Gagal menghapus properti", 500, request);
  }
}
