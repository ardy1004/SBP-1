/**
 * POST /api/slug/generate
 * Generate SEO-friendly slug untuk properti
 * 
 * Body: { title, propertyType, location, listingCode }
 * Response: { success, slug, seoScore, isUnique, suggestions }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// Stop words bahasa Indonesia
const STOP_WORDS = [
  "yang", "di", "ke", "dari", "untuk", "dengan", "dan", "atau", "pada", "dalam",
  "adalah", "akan", "sangat", "ini", "itu", "tersebut", "sebuah", "secara",
  "telah", "sedang", "sudah", "jadi", "menjadi", "harga", "turun", "naik",
  "murah", "mahal", "promo", "diskon", "ter", "se", "ber", "me", "pe"
];

function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function removeStopWords(text) {
  if (!text) return "";
  return text.split("-").filter(w => !STOP_WORDS.includes(w)).join("-");
}

function formatListingCode(code) {
  if (!code) return "";
  return code.toLowerCase().replace(/\./g, "-").replace(/[^a-z0-9-]/g, "");
}

function generateSlug({ title, propertyType, location, listingCode }) {
  let parts = [];
  
  if (propertyType) parts.push(normalizeText(propertyType));
  
  if (title) {
    const normalized = normalizeText(title);
    const withoutStop = removeStopWords(normalized);
    const words = withoutStop.split("-").slice(0, 5);
    const propTypeNorm = normalizeText(propertyType);
    parts = parts.concat(words.filter(w => w !== propTypeNorm));
  }
  
  if (location) parts.push(normalizeText(location));
  
  let slug = parts.filter(p => p).join("-");
  
  // Remove duplicate words
  const unique = [];
  slug.split("-").forEach(w => { if (!unique.includes(w)) unique.push(w); });
  slug = unique.join("-");
  
  // Truncate before adding listing code
  if (slug.length > 50) {
    const truncated = slug.substring(0, 50);
    const lastHyphen = truncated.lastIndexOf("-");
    slug = lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
  }
  
  // Add listing code
  if (listingCode) {
    slug = `${slug}-${formatListingCode(listingCode)}`;
  }
  
  return slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function validateSlug(slug) {
  const errors = [];
  if (!slug) return { isValid: false, errors: ["Slug tidak boleh kosong"] };
  if (slug.length > 80) errors.push("Slug terlalu panjang (maksimal 80 karakter)");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push("Slug hanya boleh berisi huruf kecil, angka, dan hyphen");
  if (slug.startsWith("-") || slug.endsWith("-")) errors.push("Slug tidak boleh diawali/akhir dengan hyphen");
  return { isValid: errors.length === 0, errors };
}

function calculateSEOScore(slug) {
  if (!slug) return 0;
  let score = 0;
  const types = ["rumah", "kost", "tanah", "villa", "ruko", "apartment", "hotel", "gudang"];
  if (types.some(t => slug.includes(t))) score += 20;
  if (/[a-z]+[0-9]+-[0-9]+$/.test(slug) || /[a-z]+[0-9]+$/.test(slug)) score += 20;
  if (slug.length >= 30 && slug.length <= 60) score += 20;
  else if (slug.length >= 20 && slug.length <= 80) score += 10;
  const hasStop = STOP_WORDS.some(w => slug.includes(`-${w}-`) || slug.startsWith(`${w}-`));
  if (!hasStop) score += 20;
  const v = validateSlug(slug);
  if (v.isValid) score += 20;
  return score;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Auth check (skip for dev)
    let admin = null;
    try { admin = await requireAuth(request, env); } catch {}
    
    const body = await request.json();
    const { title, propertyType, location, listingCode } = body;
    
    if (!title && !propertyType) {
      return errorResponse("Title atau propertyType wajib diisi", 400, request);
    }
    
    // Generate slug
    let slug = generateSlug({ title, propertyType, location, listingCode });
    
    // Check uniqueness
    let isUnique = true;
    let suggestions = [];
    
    if (env.DB) {
      const existing = await env.DB.prepare("SELECT id FROM properties WHERE slug = ?").bind(slug).first();
      if (existing) {
        isUnique = false;
        // Generate suggestions
        for (let i = 1; i <= 3; i++) {
          suggestions.push(`${slug}-${i}`);
        }
        // Use first suggestion
        slug = suggestions[0];
      }
    }
    
    const seoScore = calculateSEOScore(slug);
    const validation = validateSlug(slug);
    
    return jsonResponse({
      success: true,
      slug,
      isUnique,
      seoScore,
      isValid: validation.isValid,
      suggestions,
      errors: validation.errors
    }, 200, request);
    
  } catch (error) {
    console.error("Slug generate error:", error);
    return errorResponse("Gagal generate slug", 500, request);
  }
}
