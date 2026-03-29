"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  reportId: string;
  adId: string;
  status: string;
}

export function AdminReportActions({ reportId, adId, status }: Props) {
  const router = useRouter();

  async function handleAction(action: string) {
    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, adId, action }),
    });

    if (res.ok) {
      toast.success("Actiune efectuata.");
      router.refresh();
    } else {
      toast.error("Eroare.");
    }
  }

  if (status !== "PENDING") return <span className="text-xs text-stone-400">Rezolvat</span>;

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={() => handleAction("dismiss")} title="Respinge">
        <X className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("removeAd")} className="text-red-600" title="Sterge anunt">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
