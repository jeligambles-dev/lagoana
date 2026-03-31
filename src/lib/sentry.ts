// NOTĂ: Pachetul @sentry/nextjs trebuie instalat pentru ca acest modul să funcționeze.
// Rulați: npm install @sentry/nextjs
// Apoi setați variabila de mediu SENTRY_DSN în .env

let Sentry: typeof import("@sentry/nextjs") | null = null;

/**
 * Inițializează Sentry dacă SENTRY_DSN este configurat.
 * Apelați această funcție o singură dată la pornirea aplicației.
 */
export async function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("[Sentry] SENTRY_DSN nu este setat — Sentry dezactivat.");
    return;
  }

  try {
    Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
      debug: process.env.NODE_ENV !== "production",
    });
    console.log("[Sentry] Inițializat cu succes.");
  } catch (error) {
    console.warn("[Sentry] Nu s-a putut inițializa (@sentry/nextjs nu este instalat?):", error);
    Sentry = null;
  }
}

/**
 * Captează o excepție și o trimite la Sentry.
 * Funcționează silențios dacă Sentry nu este inițializat.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!Sentry) {
    return;
  }

  try {
    if (context) {
      Sentry.withScope((scope) => {
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry!.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Silențios — nu vrem ca raportarea erorilor să cauzeze alte erori
  }
}

/**
 * Captează un mesaj și îl trimite la Sentry.
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!Sentry) {
    return;
  }

  try {
    Sentry.captureMessage(message, level);
  } catch {
    // Silențios
  }
}
