// NOTĂ: Pachetul @sentry/nextjs trebuie instalat pentru ca acest modul să funcționeze.
// Rulați: npm install @sentry/nextjs
// Apoi setați variabila de mediu SENTRY_DSN în .env

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

/**
 * Inițializează Sentry dacă SENTRY_DSN este configurat.
 */
export async function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    Sentry = await import("@sentry/nextjs" as string);
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    });
  } catch {
    Sentry = null;
  }
}

/**
 * Captează o excepție și o trimite la Sentry.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!Sentry) return;
  try {
    if (context) {
      Sentry.withScope((scope: any) => {
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // silent
  }
}

/**
 * Captează un mesaj și îl trimite la Sentry.
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!Sentry) return;
  try {
    Sentry.captureMessage(message, level);
  } catch {
    // silent
  }
}
