"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-[#EDEDED]">
              Folosim cookie-uri pentru a imbunatati experienta ta pe site.
            </p>
            <p className="text-xs text-[#888]">
              Citeste{" "}
              <Link href="/termeni" className="text-gold hover:underline">
                politica de confidentialitate
              </Link>
              .
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={accept}
                size="sm"
                className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
              >
                Accept
              </Button>
              <Button
                onClick={decline}
                variant="outline"
                size="sm"
                className="border-[#2A2A2A] text-[#888]"
              >
                Refuz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
