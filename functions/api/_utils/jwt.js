function getJwtSecret(env) {
  const secret = env.JWT_SECRET || "sbp-default-secret-change-in-production-min-32-chars";
  return new TextEncoder().encode(secret);
}

async function importKey(secret) {
  return crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function base64UrlEncode(data) {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function generateToken(payload, expiresIn = 86400, env = {}) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresIn };
  const headerB64 = base64UrlEncode(header);
  const payloadB64 = base64UrlEncode(fullPayload);
  const data = `${headerB64}.${payloadB64}`;
  const key = await importKey(getJwtSecret(env));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureB64}`;
}

export async function verifyToken(token, env = {}) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const key = await importKey(getJwtSecret(env));
    const signatureBytes = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(data));
    if (!isValid) return null;
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function requireAuth(request, env) {
  const token = extractToken(request);
  if (!token) return null;

  // Coba verifikasi sebagai JWT dulu
  let payload = await verifyToken(token, env);

  // Jika bukan JWT valid, coba parse sebagai local token
  if (!payload) {
    const parts = token.split(".");
    if (parts.length === 2) {
      try {
        const decoded = JSON.parse(atob(parts[0]));
        if (decoded.local && decoded.sub && decoded.exp && decoded.exp > Date.now()) {
          payload = { email: decoded.sub };
        }
      } catch {}
    }
  }

  if (!payload || !payload.email) return null;
  const admin = await env.DB.prepare("SELECT id, email, name, role, is_active FROM admins WHERE email = ?").bind(payload.email).first();
  if (!admin || !admin.is_active) return null;
  return admin;
}
