/**
 * POST /api/import/upload-validate
 * Upload CSV dan validasi semua baris
 * 
 * Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
 * Body: FormData with 'file' (CSV file)
 * Response: { success, validation_id, total_rows, valid_rows, invalid_rows, preview, errors }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// Required fields yang wajib diisi
const REQUIRED_FIELDS = [
  "listing_code",
  "title",
  "slug",
  "purpose",
  "property_type",
  "province",
  "city",
  "district",
  "address"
];

// Allowed values untuk validasi
const ALLOWED_PURPOSES = ["Dijual", "Disewa", "Dijual & Disewa"];
const ALLOWED_PROPERTY_TYPES = [
  "Rumah", "Tanah", "Kost", "Hotel", "Homestay", 
  "Villa", "Apartment", "Gudang", "Komersial Lainnya"
];
const ALLOWED_PRICE_TYPES = ["Nego", "Nett", ""];
const ALLOWED_LEGAL_STATUSES = [
  "SHM & IMB/PBG Lengkap", "SHGB & IMB/PBG Lengkap",
  "SHM Pekarangan Tanpa IMB/PBG", "SHM Sawah/Tegalan",
  "SHGB Tanpa IMB/PBG", "Girik/Letter C/PPJB/dll", "Izin Usaha", ""
];
const ALLOWED_OWNERSHIP_STATUS = ["On Hand", "On Bank", ""];

// Parse CSV line dengan handle quotes
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Validasi satu baris data
function validateRow(row, headers, rowIndex, existingCodes, existingSlugs) {
  const errors = [];
  const data = {};
  
  // Map headers ke values
  headers.forEach((header, index) => {
    data[header] = row[index] || "";
  });
  
  // Validasi required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || data[field].trim() === "") {
      errors.push({
        row: rowIndex,
        field,
        value: data[field],
        error: `${field} wajib diisi`
      });
    }
  }
  
  // Validasi listing_code unik
  if (data.listing_code) {
    if (existingCodes.has(data.listing_code.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: "listing_code",
        value: data.listing_code,
        error: "listing_code sudah ada di database"
      });
    }
  }
  
  // Validasi slug unik
  if (data.slug) {
    if (existingSlugs.has(data.slug.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: "slug",
        value: data.slug,
        error: "slug sudah ada di database"
      });
    }
  }
  
  // Validasi purpose
  if (data.purpose && !ALLOWED_PURPOSES.includes(data.purpose)) {
    errors.push({
      row: rowIndex,
      field: "purpose",
      value: data.purpose,
      error: `purpose harus: ${ALLOWED_PURPOSES.join(", ")}`
    });
  }
  
  // Validasi property_type
  if (data.property_type && !ALLOWED_PROPERTY_TYPES.includes(data.property_type)) {
    errors.push({
      row: rowIndex,
      field: "property_type",
      value: data.property_type,
      error: `property_type harus: ${ALLOWED_PROPERTY_TYPES.join(", ")}`
    });
  }
  
  // Validasi price_offer jika purpose mengandung "Dijual"
  if (data.purpose && data.purpose.includes("Dijual")) {
    if (data.price_offer && isNaN(parseInt(data.price_offer))) {
      errors.push({
        row: rowIndex,
        field: "price_offer",
        value: data.price_offer,
        error: "price_offer harus angka"
      });
    }
  }
  
  // Validasi price_rent jika purpose mengandung "Disewa"
  if (data.purpose && data.purpose.includes("Disewa")) {
    if (data.price_rent && isNaN(parseInt(data.price_rent))) {
      errors.push({
        row: rowIndex,
        field: "price_rent",
        value: data.price_rent,
        error: "price_rent harus angka"
      });
    }
  }
  
  // Validasi numeric fields
  const numericFields = [
    "old_price", "latitude", "longitude", "land_area", "building_area",
    "front_width", "floors", "bedrooms", "bathrooms", "outstanding_amount",
    "distance_to_river", "distance_to_grave", "distance_to_powerline", "road_width"
  ];
  
  for (const field of numericFields) {
    if (data[field] && data[field] !== "" && isNaN(parseFloat(data[field]))) {
      errors.push({
        row: rowIndex,
        field,
        value: data[field],
        error: `${field} harus angka`
      });
    }
  }
  
  // Validasi latitude range
  if (data.latitude && data.latitude !== "") {
    const lat = parseFloat(data.latitude);
    if (lat < -90 || lat > 90) {
      errors.push({
        row: rowIndex,
        field: "latitude",
        value: data.latitude,
        error: "latitude harus antara -90 dan 90"
      });
    }
  }
  
  // Validasi longitude range
  if (data.longitude && data.longitude !== "") {
    const lng = parseFloat(data.longitude);
    if (lng < -180 || lng > 180) {
      errors.push({
        row: rowIndex,
        field: "longitude",
        value: data.longitude,
        error: "longitude harus antara -180 dan 180"
      });
    }
  }
  
  // Validasi boolean fields
  const booleanFields = ["is_premium", "is_featured", "is_hot", "is_choice"];
  for (const field of booleanFields) {
    if (data[field] && !["TRUE", "FALSE", ""].includes(data[field.toUpperCase()]) && !["true", "false", ""].includes(data[field.toLowerCase()])) {
      errors.push({
        row: rowIndex,
        field,
        value: data[field],
        error: `${field} harus TRUE atau FALSE`
      });
    }
  }
  
  // Validasi legal_status
  if (data.legal_status && !ALLOWED_LEGAL_STATUSES.includes(data.legal_status)) {
    errors.push({
      row: rowIndex,
      field: "legal_status",
      value: data.legal_status,
      error: `legal_status tidak valid`
    });
  }
  
  // Validasi ownership_status
  if (data.ownership_status && !ALLOWED_OWNERSHIP_STATUS.includes(data.ownership_status)) {
    errors.push({
      row: rowIndex,
      field: "ownership_status",
      value: data.ownership_status,
      error: `ownership_status harus: On Hand atau On Bank`
    });
  }
  
  // Validasi bank_name jika ownership = On Bank
  if (data.ownership_status === "On Bank" && !data.bank_name) {
    errors.push({
      row: rowIndex,
      field: "bank_name",
      value: data.bank_name,
      error: "bank_name wajib diisi jika ownership_status = On Bank"
    });
  }
  
  return { errors, data };
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
      console.log("[UPLOAD] Auth check failed, continuing for dev");
    }

    if (!admin && env.NODE_ENV === "production") {
      return errorResponse("Unauthorized", 401, request);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("File CSV wajib diupload", 400, request);
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File terlalu besar. Max 5MB.", 400, request);
    }

    // Validasi tipe file
    if (!file.name.endsWith(".csv")) {
      return errorResponse("Format file tidak valid. Hanya CSV yang diterima.", 400, request);
    }

    // Baca file content
    const content = await file.text();
    
    // Parse CSV
    const lines = content.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length < 2) {
      return errorResponse("File CSV kosong atau tidak ada data.", 400, request);
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    
    // Get existing listing_codes dan slugs untuk cek duplikat
    const existingProperties = await env.DB.prepare(
      "SELECT listing_code, slug FROM properties"
    ).all();
    
    const existingCodes = new Set(
      (existingProperties.results || []).map(p => p.listing_code.toLowerCase())
    );
    const existingSlugs = new Set(
      (existingProperties.results || []).map(p => p.slug.toLowerCase())
    );

    // Validasi semua baris
    const allErrors = [];
    const validRows = [];
    const preview = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const { errors, data } = validateRow(row, headers, i + 1, existingCodes, existingSlugs);
      
      if (errors.length > 0) {
        allErrors.push(...errors);
      } else {
        validRows.push(data);
        
        // Tambahkan ke existing untuk cek duplikat dalam file yang sama
        if (data.listing_code) {
          existingCodes.add(data.listing_code.toLowerCase());
        }
        if (data.slug) {
          existingSlugs.add(data.slug.toLowerCase());
        }
        
        // Simpan 10 baris pertama untuk preview
        if (preview.length < 10) {
          preview.push({
            listing_code: data.listing_code,
            title: data.title,
            property_type: data.property_type,
            price: data.price_offer || data.price_rent || "-",
            location: `${data.district}, ${data.city}`
          });
        }
      }
    }

    // Generate validation ID
    const validationId = crypto.randomUUID();
    
    // Simpan validation result ke KV atau temporary storage
    // Untuk sekarang, kita encode dalam validation_id
    const validationResult = {
      id: validationId,
      filename: file.name,
      headers,
      validRows,
      errors: allErrors,
      totalRows: lines.length - 1,
      validRowsCount: validRows.length,
      invalidRowsCount: allErrors.length > 0 ? new Set(allErrors.map(e => e.row)).size : 0,
      createdAt: Date.now()
    };
    
    // Simpan ke environment variable (atau KV jika ada)
    // Untuk sementara, kita encode dalam response dan frontend akan simpan
    const encodedResult = btoa(JSON.stringify(validationResult));

    return jsonResponse({
      success: true,
      validation_id: validationId,
      validation_data: encodedResult,
      total_rows: lines.length - 1,
      valid_rows: validRows.length,
      invalid_rows: validationResult.invalidRowsCount,
      preview,
      errors: allErrors.slice(0, 50) // Limit 50 errors untuk response
    }, 200, request);

  } catch (error) {
    console.error("Upload validate error:", error);
    return errorResponse("Gagal memvalidasi file CSV", 500, request);
  }
}
