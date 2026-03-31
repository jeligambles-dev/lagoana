"use client";

// NOTĂ: @sentry/nextjs trebuie instalat pentru raportarea erorilor.
// Rulați: npm install @sentry/nextjs

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Raportează eroarea la Sentry dacă este disponibil
    async function reportError() {
      try {
        const { captureException } = await import("@/lib/sentry");
        captureException(error, { digest: error.digest });
      } catch {
        // Sentry nu este disponibil — ignorăm
      }
    }
    reportError();
  }, [error]);

  return (
    <html lang="ro">
      <body className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-[#EDEDED] font-sans">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-[#C9A646]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            A apărut o eroare neașteptată
          </h1>
          <p className="text-[#888] mb-8">
            Ne cerem scuze pentru inconveniență. O eroare neașteptată a apărut.
            Echipa noastră a fost notificată și lucrăm la rezolvarea problemei.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#C9A646] text-[#0B0B0B] font-semibold rounded-lg hover:bg-[#D4B85A] transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </body>
    </html>
  );
}
