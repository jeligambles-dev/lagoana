"use client";

import { Button } from "@/components/ui/button";
import { Share2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copiat!");
    setShowOptions(false);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`, "_blank");
    setShowOptions(false);
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, "_blank");
    setShowOptions(false);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 border-[#2A2A2A]"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Share2 className="h-4 w-4 mr-1" /> Distribuie
      </Button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#151515] border border-[#2A2A2A] rounded-lg shadow-xl p-1 min-w-40 z-10">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#EDEDED] hover:bg-[#1E1E1E] rounded transition"
          >
            <Link2 className="h-4 w-4 text-[#888]" /> Copiaza link
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#EDEDED] hover:bg-[#1E1E1E] rounded transition"
          >
            <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
          </button>
          <button
            onClick={shareFacebook}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#EDEDED] hover:bg-[#1E1E1E] rounded transition"
          >
            <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      )}
    </div>
  );
}
