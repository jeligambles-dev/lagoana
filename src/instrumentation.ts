// Fișier de instrumentare Next.js — se execută la pornirea serverului.
// NOTĂ: @sentry/nextjs trebuie instalat pentru raportarea erorilor.

export async function register() {
  // Inițializează Sentry pe server
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    const { initSentry } = await import("@/lib/sentry");
    await initSentry();
  }
}
