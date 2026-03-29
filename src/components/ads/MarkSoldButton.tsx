"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function MarkSoldButton({ adId }: { adId: string }) {
  const router = useRouter();

  async function handleMarkSold() {
    if (!confirm("Marchezi acest anunt ca vandut?")) return;

    const res = await fetch(`/api/ads/${adId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SOLD" }),
    });

    if (res.ok) {
      toast.success("Anunt marcat ca vandut.");
      router.refresh();
    } else {
      toast.error("Eroare.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkSold} className="text-gold border-gold/30 hover:bg-gold/10">
      <CheckCircle className="h-3 w-3 mr-1" /> Vandut
    </Button>
  );
}
