import { NextRequest } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateMap) {
    if (value.resetAt < now) rateMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Verifică dacă o cerere este permisă conform limitelor de rată.
 * Returnează true dacă cererea este permisă, false dacă limita a fost depășită.
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Extrage adresa IP din headerele cererii.
 * Verifică x-forwarded-for, x-real-ip, apoi fallback la "unknown".
 */
export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for poate conține mai multe IP-uri separate prin virgulă;
    // primul este IP-ul clientului real
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Aplică rate limiting pe baza IP-ului pentru utilizatorii anonimi.
 * Returnează un Response 429 dacă limita a fost depășită, sau null dacă cererea este permisă.
 */
export function rateLimitByIp(
  request: Request | NextRequest,
  prefix: string,
  maxRequests: number,
  windowMs: number
): Response | null {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;

  if (!rateLimit(key, maxRequests, windowMs)) {
    return Response.json(
      { error: "Prea multe cereri. Vă rugăm să încercați din nou mai târziu." },
      { status: 429 }
    );
  }

  return null;
}
