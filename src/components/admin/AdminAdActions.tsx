"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";

interface AdminAdActionsProps {
  adId: string;
  status: string;
}

export function AdminAdActions({ adId, status }: AdminAdActionsProps) {
  const router = useRouter();

  async function handleAction(action: string) {
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, action }),
    });

    if (res.ok) {
      toast.success("Actiune efectuata.");
      router.refresh();
    } else {
      toast.error("Eroare.");
    }
  }

  return (
    <div className="flex items-center gap-1">
      {status === "ACTIVE" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("spotlight")}
            title="Spotlight"
          >
            <Star className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Stergi acest anunt?")) handleAction("remove");
            }}
            className="text-red-600"
            title="Sterge"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
      {status === "REMOVED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("restore")}
          title="Restaureaza"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
