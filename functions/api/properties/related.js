/**
 * /api/properties/related
 * GET - Get related properties by type or city (public)
 * 
 * Query params:
 *   exclude  - property ID to exclude (required)
 *   type     - property type to match
 *   city     - city to match
 *   limit    - max results (default 4, max 12)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(request.url);
    const excludeId = url.searchParams.get("exclude");
    const type = url.searchParams.get("type");
    const city = url.searchParams.get("city");
    const limit = Math.min(12, Math.max(1, parseInt(url.searchParams.get("limit") || "4")));

    if (!excludeId) {
      return errorResponse("Parameter 'exclude' (property ID) wajib diisi", 400, request);
    }

    // Build query: match by type OR city, exclude current property
    // Priority: same type first, then same city, then random
    let whereClause = "WHERE p.id != ? AND p.is_sold = 0 AND p.status = 'active'";
    const params = [excludeId];

    if (type && city) {
      whereClause += " AND (p.property_type = ? OR p.city = ?)";
      params.push(type, city);
    } else if (type) {
      whereClause += " AND p.property_type = ?";
      params.push(type);
    } else if (city) {
      whereClause += " AND p.city = ?";
      params.push(city);
    }

    // Fetch related properties with primary image
    const properties = await env.DB.prepare(
      `SELECT p.*,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count
       FROM properties p
       ${whereClause}
       ORDER BY 
         CASE WHEN p.property_type = ? THEN 0 ELSE 1 END,
         p.is_premium DESC,
         p.is_featured DESC,
         RANDOM()
       LIMIT ?`
    ).bind(...params, type || "", limit).all();

    // Format response
    const formattedProperties = (properties.results || []).map(p => ({
      id: p.id,
      listing_code: p.listing_code,
      title: p.title,
      slug: p.slug,
      purpose: p.purpose,
      property_type: p.property_type,
      price: p.price_offer,
      old_price: p.old_price,
      location: `${p.district || ""}, ${p.city}, ${p.province}`.replace(/^,\s*/, ""),
      city: p.city,
      district: p.district,
      province: p.province,
      land_area: p.land_area,
      building_area: p.building_area,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      floors: p.floors,
      image: p.primary_image,
      image_count: p.image_count,
      is_premium: !!p.is_premium,
      is_featured: !!p.is_featured,
      is_hot: !!p.is_hot,
      is_sold: !!p.is_sold,
      is_choice: !!p.is_choice,
      legal_status: p.legal_status,
      ownership_status: p.ownership_status,
    }));

    return jsonResponse({
      success: true,
      data: formattedProperties,
    }, 200, request);

  } catch (error) {
    console.error("Related properties error:", error);
    return errorResponse("Gagal mengambil properti terkait", 500, request);
  }
}
