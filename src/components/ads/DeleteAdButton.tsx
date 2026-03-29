"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAdButton({ adId }: { adId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Esti sigur ca vrei sa stergi acest anunt?")) return;

    const res = await fetch(`/api/ads/${adId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Anunt sters.");
      router.refresh();
    } else {
      toast.error("Eroare la stergere.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
      <Trash2 className="h-3 w-3 mr-1" /> Sterge
    </Button>
  );
}
