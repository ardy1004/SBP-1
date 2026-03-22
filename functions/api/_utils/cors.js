const ALLOWED_ORIGINS = [
  "https://salambumi.xyz",
  "https://www.salambumi.xyz",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

export function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleCors(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }
  return null;
}

export function jsonResponse(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
  });
}

export function errorResponse(message, status, request) {
  return jsonResponse({ success: false, error: message }, status, request);
}
