"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 30_000;

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if dismissed within the last 7 days
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Show the prompt after 30 seconds, only on mobile-sized screens
  useEffect(() => {
    if (!deferredPrompt) return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [deferredPrompt]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setShow(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 shrink-0">
            <Download className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-[#EDEDED]">
              Instaleaza Lagoana
            </p>
            <p className="text-xs text-[#888]">
              Adauga aplicatia pe ecranul principal pentru acces rapid si
              notificari.
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
              >
                Instaleaza
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="border-[#2A2A2A] text-[#888]"
              >
                Nu acum
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#555] hover:text-[#888] transition-colors"
            aria-label="Inchide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
