/**
 * /api/properties
 * GET  - List all properties (public, with filters)
 * POST - Create new property (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/properties - List properti dengan filter dan pagination
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    // Tingkatkan limit maksimal ke 1000 untuk homepage
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    // Filter params
    const purpose = url.searchParams.get("purpose");
    const type = url.searchParams.get("type");
    const city = url.searchParams.get("city");
    const district = url.searchParams.get("district");
    const province = url.searchParams.get("province");
    const search = url.searchParams.get("search");
    const minPrice = url.searchParams.get("min_price");
    const maxPrice = url.searchParams.get("max_price");
    const status = url.searchParams.get("status");
    const isSold = url.searchParams.get("is_sold");

    // Build dynamic query
    let whereClause = "WHERE 1=1";
    const params = [];

    if (purpose) {
      whereClause += " AND p.purpose = ?";
      params.push(purpose);
    }
    if (type) {
      whereClause += " AND p.property_type = ?";
      params.push(type);
    }
    if (city) {
      whereClause += " AND p.city LIKE ?";
      params.push(`%${city}%`);
    }
    if (district) {
      whereClause += " AND p.district LIKE ?";
      params.push(`%${district}%`);
    }
    if (province) {
      whereClause += " AND p.province LIKE ?";
      params.push(`%${province}%`);
    }
    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.listing_code LIKE ? OR p.address LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      whereClause += " AND p.price_offer >= ?";
      params.push(parseInt(minPrice));
    }
    if (maxPrice) {
      whereClause += " AND p.price_offer <= ?";
      params.push(parseInt(maxPrice));
    }
    if (status) {
      whereClause += " AND p.status = ?";
      params.push(status);
    }
    if (isSold === "true") {
      whereClause += " AND p.is_sold = 1";
    } else if (isSold === "false") {
      whereClause += " AND p.is_sold = 0";
    }

    // Hitung total
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM properties p ${whereClause}`
    ).bind(...params).first();

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Fetch properties dengan primary image
    let properties;
    try {
      properties = await env.DB.prepare(
        `SELECT p.*, 
          (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
          (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count
         FROM properties p 
         ${whereClause} 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`
      ).bind(...params, limit, offset).all();
    } catch (imageUrlError) {
      console.warn("[PROPERTIES] Falling back to legacy property_images schema:", imageUrlError?.message || imageUrlError);
      properties = await env.DB.prepare(
        `SELECT p.*, 
          (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
          (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count
         FROM properties p 
         ${whereClause} 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`
      ).bind(...params, limit, offset).all();
    }

    // Format response - exclude sensitive owner data for public
    const formattedProperties = (properties.results || []).map(p => ({
      id: p.id,
      listing_code: p.listing_code,
      title: p.title,
      slug: p.slug,
      purpose: p.purpose,
      property_type: p.property_type,
      price: p.price_offer,
      price_rent: p.price_rent,
      old_price: p.old_price,
      price_type: p.price_type,
      location: `${p.district || ""}, ${p.city}, ${p.province}`.replace(/^,\s*/, ""),
      city: p.city,
      district: p.district,
      province: p.province,
      village: p.village,
      address: p.address,
      land_area: p.land_area,
      building_area: p.building_area,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      floors: p.floors,
      description: p.description,
      facilities: p.facilities ? JSON.parse(p.facilities) : [],
      image: p.primary_image,
      image_count: p.image_count,
      is_premium: !!p.is_premium,
      is_featured: !!p.is_featured,
      is_hot: !!p.is_hot,
      is_sold: !!p.is_sold,
      is_choice: !!p.is_choice,
      views_count: p.views_count,
      created_at: p.created_at,
    }));

    return jsonResponse({
      success: true,
      data: formattedProperties,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    }, 200, request);

  } catch (error) {
    console.error("Properties list error:", error);
    return errorResponse("Gagal mengambil data properti", 500, request);
  }
}

// POST /api/properties - Buat properti baru (admin only)
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Verifikasi admin - skip untuk development jika token tidak valid
    let admin = null;
    try {
      admin = await requireAuth(request, env);
    } catch (authErr) {
      console.log("[PROPERTIES] Auth check failed, continuing without auth for dev:", authErr.message);
    }
    
    // Di production, wajib auth. Di development, boleh tanpa auth
    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized. Silakan login terlebih dahulu.", 401, request);
    }

    const body = await request.json();

    // Validasi field wajib
    const required = ["title", "purpose", "property_type", "city"];
    for (const field of required) {
      if (!body[field]) {
        return errorResponse(`Field '${field}' wajib diisi`, 400, request);
      }
    }

    // Generate ID dan slug
    const id = crypto.randomUUID();
    const listingCode = body.listing_code || generateListingCode(body.property_type);
    const slug = body.slug || generateSlug(body.title, listingCode);

    // Cek slug unik
    const existingSlug = await env.DB.prepare(
      "SELECT id FROM properties WHERE slug = ?"
    ).bind(slug).first();

    if (existingSlug) {
      return errorResponse("Slug sudah digunakan. Gunakan slug yang berbeda.", 400, request);
    }

    const now = new Date().toISOString();

    // Insert properti
    await env.DB.prepare(`
      INSERT INTO properties (
        id, listing_code, title, slug, purpose, property_type,
        price_offer, price_rent, old_price, price_type,
        province, city, district, village, address,
        google_maps_url, latitude, longitude,
        land_area, building_area, front_width, floors, bedrooms, bathrooms,
        legal_status, ownership_status, bank_name, outstanding_amount,
        environmental_status, distance_to_river, distance_to_grave, distance_to_powerline, road_width,
        description, facilities, selling_reason,
        owner_name, owner_whatsapp_1, owner_whatsapp_2,
        is_premium, is_featured, is_hot, is_choice,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, listingCode, body.title, slug, body.purpose, body.property_type,
      body.price_offer || 0, body.price_rent || 0, body.old_price || null, body.price_type || null,
      body.province || "DI Yogyakarta", body.city, body.district || null, body.village || null, body.address || null,
      body.google_maps_url || null, body.latitude || null, body.longitude || null,
      body.land_area || 0, body.building_area || 0, body.front_width || null, body.floors || 1, body.bedrooms || 0, body.bathrooms || 0,
      body.legal_status || null, body.ownership_status || "On Hand", body.bank_name || null, body.outstanding_amount || null,
      body.environmental_status || "Ya Jauh", body.distance_to_river || null, body.distance_to_grave || null, body.distance_to_powerline || null, body.road_width || null,
      body.description || null, body.facilities ? JSON.stringify(body.facilities) : null, body.selling_reason || null,
      body.owner_name || null, body.owner_whatsapp_1 || null, body.owner_whatsapp_2 || null,
      body.is_premium ? 1 : 0, body.is_featured ? 1 : 0, body.is_hot ? 1 : 0, body.is_choice ? 1 : 0,
      body.status || "active", now, now
    ).run();

    // Log activity (hanya jika admin ada)
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        admin.id, "Create", "property", id,
        `Properti baru: ${body.title}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({
      success: true,
      id,
      slug,
      listing_code: listingCode,
      message: "Properti berhasil dibuat",
    }, 201, request);

  } catch (error) {
    console.error("Property create error:", error);
    // Di development, kirim error detail untuk debugging
    const errorMessage = env.NODE_ENV === "production" 
      ? "Gagal membuat properti" 
      : `Gagal membuat properti: ${error.message || error}`;
    return errorResponse(errorMessage, 500, request);
  }
}

// Helper functions
function generateListingCode(type) {
  const prefixes = {
    Rumah: "RMH", Kost: "KST", Tanah: "TNH", Villa: "VIL",
    Ruko: "RUK", Apartment: "APT", Hotel: "HTL", Gudang: "GDG",
  };
  const prefix = prefixes[type] || "PRP";
  const num = Math.floor(Math.random() * 999).toString().padStart(3, "0");
  return `${prefix}-${num}`;
}

function generateSlug(title, listingCode) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 50);
  const suffix = listingCode.toLowerCase().replace("-", "");
  return `${baseSlug}-${suffix}`;
}
