/**
 * Slug Generator Utility untuk Salam Bumi Property
 * 
 * Fungsi untuk generate SEO-friendly slug secara otomatis
 * Pattern: {property-type}-{key-features}-{location}-{listing-code}
 * 
 * Contoh: rumah-mewah-2-lantai-sleman-r3-27
 */

// Stop words bahasa Indonesia yang dihapus dari slug
export const STOP_WORDS = [
  "yang", "di", "ke", "dari", "untuk", "dengan", "dan", "atau", "pada", "dalam",
  "adalah", "akan", "sangat", "ini", "itu", "tersebut", "sebuah", "secara",
  "telah", "sedang", "sudah", "jadi", "menjadi", "harga", "turun", "naik",
  "murah", "mahal", "promo", "diskon", "ter", "se", "ber", "me", "pe",
  "lah", "kah", "pun", "nya", "ku", "mu", "dia", "ia", "mereka", "kami",
  "kita", "anda", "beliau", "saya", "hanya", "juga", "tidak", "bukan",
  "belum", "masih", "lebih", "paling", "sekali", "banget"
];

/**
 * Normalize text: lowercase, remove special chars, replace with hyphen
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Remove stop words dari text
 */
export function removeStopWords(text: string): string {
  if (!text) return "";
  
  const words = text.split("-");
  const filtered = words.filter(word => !STOP_WORDS.includes(word));
  
  return filtered.join("-");
}

/**
 * Truncate slug ke panjang maksimal tanpa memotong kata
 */
export function truncateSlug(slug: string, maxLength: number = 60): string {
  if (!slug || slug.length <= maxLength) return slug;
  
  const truncated = slug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");
  
  if (lastHyphen > 0) {
    return truncated.substring(0, lastHyphen);
  }
  
  return truncated;
}

/**
 * Format listing code: replace dot with hyphen, lowercase
 */
export function formatListingCode(code: string): string {
  if (!code) return "";
  
  return code
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Parameter untuk generate slug
 */
export interface SlugParams {
  title?: string;
  propertyType?: string;
  location?: string;
  listingCode?: string;
}

/**
 * Generate SEO-friendly slug
 */
export function generateSlug(params: SlugParams): string {
  const { title, propertyType, location, listingCode } = params;
  
  if (!title && !propertyType) {
    return "";
  }
  
  let slugParts: string[] = [];
  
  if (propertyType) {
    slugParts.push(normalizeText(propertyType));
  }
  
  if (title) {
    const normalizedTitle = normalizeText(title);
    const titleWithoutStopWords = removeStopWords(normalizedTitle);
    const titleWords = titleWithoutStopWords.split("-").slice(0, 5);
    
    const propTypeNormalized = propertyType ? normalizeText(propertyType) : null;
    const filteredWords = titleWords.filter(word => word && word !== propTypeNormalized);
    
    slugParts = slugParts.concat(filteredWords);
  }
  
  if (location) {
    slugParts.push(normalizeText(location));
  }
  
  let slug = slugParts.filter(p => p).join("-");
  
  const uniqueWords: string[] = [];
  slug.split("-").forEach(word => {
    if (!uniqueWords.includes(word)) {
      uniqueWords.push(word);
    }
  });
  slug = uniqueWords.join("-");
  
  slug = truncateSlug(slug, 50);
  
  if (listingCode) {
    const formattedCode = formatListingCode(listingCode);
    slug = `${slug}-${formattedCode}`;
  }
  
  slug = slug
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  return slug;
}

/**
 * Result dari validasi slug
 */
export interface SlugValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validasi format slug
 */
export function validateSlug(slug: string): SlugValidationResult {
  const errors: string[] = [];
  
  if (!slug) {
    return { isValid: false, errors: ["Slug tidak boleh kosong"] };
  }
  
  if (slug.length > 80) {
    errors.push("Slug terlalu panjang (maksimal 80 karakter)");
  }
  
  const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!validFormat.test(slug)) {
    errors.push("Slug hanya boleh berisi huruf kecil, angka, dan hyphen");
  }
  
  if (slug.startsWith("-") || slug.endsWith("-")) {
    errors.push("Slug tidak boleh diawali atau diakhiri dengan hyphen");
  }
  
  if (slug.includes("--")) {
    errors.push("Slug tidak boleh mengandung double hyphen");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Hitung SEO score untuk slug (0-100)
 */
export function calculateSEOScore(slug: string): number {
  if (!slug) return 0;
  
  let score = 0;
  
  const propertyTypes = ["rumah", "kost", "tanah", "villa", "ruko", "apartment", "hotel", "gudang"];
  if (propertyTypes.some(type => slug.includes(type))) {
    score += 20;
  }
  
  if (/[a-z]+[0-9]+-[0-9]+$/.test(slug) || /[a-z]+[0-9]+$/.test(slug)) {
    score += 20;
  }
  
  if (slug.length >= 30 && slug.length <= 60) {
    score += 20;
  } else if (slug.length >= 20 && slug.length <= 80) {
    score += 10;
  }
  
  const hasStopWords = STOP_WORDS.some(word => 
    slug.includes(`-${word}-`) || slug.startsWith(`${word}-`) || slug.endsWith(`-${word}`)
  );
  if (!hasStopWords) {
    score += 20;
  }
  
  const validation = validateSlug(slug);
  if (validation.isValid) {
    score += 20;
  }
  
  return score;
}

/**
 * Generate suggestions jika slug sudah dipakai
 */
export function generateSlugSuggestions(baseSlug: string, count: number = 3): string[] {
  const suggestions: string[] = [];
  
  for (let i = 1; i <= count; i++) {
    suggestions.push(`${baseSlug}-${i}`);
  }
  
  return suggestions;
}
