"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function PhoneButton({ phone }: { phone: string }) {
  const [revealed, setRevealed] = useState(false);

  // Mask phone: show first 4 chars, hide the rest
  const masked = phone.slice(0, 4) + " *** ***";

  return revealed ? (
    <a href={`tel:${phone}`} className="w-full">
      <Button variant="outline" className="w-full border-green-700 text-green-500 hover:bg-green-900/20">
        <Phone className="h-4 w-4 mr-2" />
        {phone}
      </Button>
    </a>
  ) : (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => setRevealed(true)}
    >
      <Phone className="h-4 w-4 mr-2" />
      {masked} — Arata numarul
    </Button>
  );
}
