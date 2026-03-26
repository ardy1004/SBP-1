/**
 * POST /api/import/confirm
 * Konfirmasi dan eksekusi import data ke D1
 * 
 * Headers: Authorization: Bearer {token}
 * Body: { validation_data: base64-encoded validation result }
 * Response: { success, import_id, total_rows, success_count, failed_count }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// Generate listing code
function generateListingCode(type) {
  const prefixes = {
    Rumah: "RMH", Kost: "KST", Tanah: "TNH", Villa: "VIL",
    Ruko: "RUK", Apartment: "APT", Hotel: "HTL", Gudang: "GDG",
  };
  const prefix = prefixes[type] || "PRP";
  const num = Math.floor(Math.random() * 999).toString().padStart(3, "0");
  return `${prefix}-${num}`;
}

// Generate slug dari title
function generateSlug(title, listingCode) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${baseSlug}-${listingCode}`.toLowerCase();
}

// Insert single property ke database
async function insertProperty(env, data, admin) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // Generate listing_code jika kosong
  const listingCode = data.listing_code || generateListingCode(data.property_type);
  
  // Generate slug jika kosong
  const slug = data.slug || generateSlug(data.title, listingCode);
  
  // Convert boolean fields
  const isPremium = (data.is_premium || "").toUpperCase() === "TRUE" ? 1 : 0;
  const isFeatured = (data.is_featured || "").toUpperCase() === "TRUE" ? 1 : 0;
  const isHot = (data.is_hot || "").toUpperCase() === "TRUE" || data.old_price ? 1 : 0;
  const isChoice = (data.is_choice || "").toUpperCase() === "TRUE" ? 1 : 0;

  // Insert property
  try {
    await env.DB.prepare(`
      INSERT INTO properties (
        id, listing_code, title, slug, purpose, property_type,
        price_offer, price_rent, price_type, old_price,
        province, city, district, village, address,
        latitude, longitude, land_area, building_area, front_width,
        floors, bedrooms, bathrooms, legal_status, ownership_status,
        bank_name, outstanding_amount, distance_to_river, distance_to_grave,
        distance_to_powerline, road_width, description, facilities,
        selling_reason, owner_name, owner_whatsapp_1, owner_whatsapp_2,
        google_maps_url, video_url, is_premium, is_featured, is_hot, is_choice,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, listingCode, data.title, slug, data.purpose, data.property_type,
      parseInt(data.price_offer) || 0, parseInt(data.price_rent) || 0, data.price_type || null, parseInt(data.old_price) || null,
      data.province, data.city, data.district, data.village || null, data.address,
      parseFloat(data.latitude) || null, parseFloat(data.longitude) || null,
      parseInt(data.land_area) || 0, parseInt(data.building_area) || 0, parseInt(data.front_width) || null,
      parseInt(data.floors) || 1, parseInt(data.bedrooms) || 0, parseInt(data.bathrooms) || 0,
      data.legal_status || null, data.ownership_status || "On Hand",
      data.bank_name || null, parseInt(data.outstanding_amount) || null,
      parseInt(data.distance_to_river) || null, parseInt(data.distance_to_grave) || null,
      parseInt(data.distance_to_powerline) || null, parseInt(data.road_width) || null,
      data.description || null, data.facilities || null,
      data.selling_reason || null, data.owner_name || null,
      data.owner_whatsapp_1 || null, data.owner_whatsapp_2 || null,
      data.google_maps_url || null, data.video_url || null,
      isPremium, isFeatured, isHot, isChoice,
      "active", now, now
    ).run();
  } catch (insertError) {
    const message = insertError?.message || String(insertError);
    if (!message.includes("video_url")) throw insertError;

    await env.DB.prepare(`
      INSERT INTO properties (
        id, listing_code, title, slug, purpose, property_type,
        price_offer, price_rent, price_type, old_price,
        province, city, district, village, address,
        latitude, longitude, land_area, building_area, front_width,
        floors, bedrooms, bathrooms, legal_status, ownership_status,
        bank_name, outstanding_amount, distance_to_river, distance_to_grave,
        distance_to_powerline, road_width, description, facilities,
        selling_reason, owner_name, owner_whatsapp_1, owner_whatsapp_2,
        google_maps_url, is_premium, is_featured, is_hot, is_choice,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, listingCode, data.title, slug, data.purpose, data.property_type,
      parseInt(data.price_offer) || 0, parseInt(data.price_rent) || 0, data.price_type || null, parseInt(data.old_price) || null,
      data.province, data.city, data.district, data.village || null, data.address,
      parseFloat(data.latitude) || null, parseFloat(data.longitude) || null,
      parseInt(data.land_area) || 0, parseInt(data.building_area) || 0, parseInt(data.front_width) || null,
      parseInt(data.floors) || 1, parseInt(data.bedrooms) || 0, parseInt(data.bathrooms) || 0,
      data.legal_status || null, data.ownership_status || "On Hand",
      data.bank_name || null, parseInt(data.outstanding_amount) || null,
      parseInt(data.distance_to_river) || null, parseInt(data.distance_to_grave) || null,
      parseInt(data.distance_to_powerline) || null, parseInt(data.road_width) || null,
      data.description || null, data.facilities || null,
      data.selling_reason || null, data.owner_name || null,
      data.owner_whatsapp_1 || null, data.owner_whatsapp_2 || null,
      data.google_maps_url || null, isPremium, isFeatured, isHot, isChoice,
      "active", now, now
    ).run();
  }

  // Insert images jika ada (image_url1 sampai image_url10)
  const imageUrls = [];
  for (let i = 1; i <= 10; i++) {
    const url = data[`image_url${i}`];
    if (url && url.trim() !== "") {
      imageUrls.push(url.trim());
    }
  }
  
  if (imageUrls.length > 0) {
    for (let i = 0; i < imageUrls.length; i++) {
      const imageId = crypto.randomUUID();
      try {
        await env.DB.prepare(
          "INSERT INTO property_images (id, property_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)"
        ).bind(imageId, id, imageUrls[i], i === 0 ? 1 : 0, i).run();
      } catch (imageInsertError) {
        await env.DB.prepare(
          "INSERT INTO property_images (id, property_id, url, filename, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          imageId,
          id,
          imageUrls[i],
          imageUrls[i].split("/").pop() || `image-${imageId}`,
          i === 0 ? 1 : 0,
          i
        ).run();
      }
    }
  }

  return id;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Verifikasi admin - skip untuk development
    let admin = null;
    try {
      admin = await requireAuth(request, env);
    } catch (authErr) {
      console.log("[CONFIRM] Auth check failed, continuing for dev");
    }

    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized", 401, request);
    }

    // Parse request body
    const body = await request.json();
    const { validation_data } = body;

    if (!validation_data) {
      return errorResponse("validation_data diperlukan", 400, request);
    }

    // Decode validation data
    // Gunakan decodeURIComponent untuk handle karakter non-Latin1
    let validationResult;
    try {
      validationResult = JSON.parse(decodeURIComponent(atob(validation_data)));
    } catch (e) {
      console.error("Decode error:", e.message);
      return errorResponse("validation_data tidak valid", 400, request);
    }

    const { validRows, filename, totalRows, errors } = validationResult;

    if (!validRows || validRows.length === 0) {
      return errorResponse("Tidak ada data valid untuk diimport", 400, request);
    }

    // Create import_logs entry
    const importId = crypto.randomUUID();
    const rollbackUntil = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 jam
    
    await env.DB.prepare(`
      INSERT INTO import_logs (id, filename, total_rows, success_count, failed_count, status, rollback_available_until, created_by)
      VALUES (?, ?, ?, 0, ?, 'processing', ?, ?)
    `).bind(
      importId, filename, totalRows, errors ? new Set(errors.map(e => e.row)).size : 0,
      rollbackUntil, admin?.id || null
    ).run();

    // Import data dalam batches
    const BATCH_SIZE = 50;
    const importedIds = [];
    const importErrors = [];
    let successCount = 0;

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      
      for (const row of batch) {
        try {
          const propertyId = await insertProperty(env, row, admin);
          importedIds.push(propertyId);
          successCount++;
        } catch (err) {
          console.error("Insert error:", err);
          importErrors.push({
            row: i + batch.indexOf(row) + 1,
            data: row,
            error: err.message
          });
        }
      }
      
      // Delay antar batch untuk menghindari rate limit
      if (i + BATCH_SIZE < validRows.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Update import_logs dengan hasil
    const failedCount = importErrors.length + (errors ? new Set(errors.map(e => e.row)).size : 0);
    
    await env.DB.prepare(`
      UPDATE import_logs 
      SET success_count = ?, failed_count = ?, status = 'completed', 
          error_log = ?, imported_ids = ?
      WHERE id = ?
    `).bind(
      successCount,
      failedCount,
      JSON.stringify([...(errors || []), ...importErrors]),
      JSON.stringify(importedIds),
      importId
    ).run();

    // Log activity
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        admin.id, "Import CSV", "bulk_import", importId,
        `Import ${successCount} properti dari ${filename}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({
      success: true,
      import_id: importId,
      total_rows: totalRows,
      success_count: successCount,
      failed_count: failedCount,
      imported_ids: importedIds
    }, 200, request);

  } catch (error) {
    console.error("Confirm import error:", error);
    return errorResponse("Gagal mengimport data", 500, request);
  }
}
