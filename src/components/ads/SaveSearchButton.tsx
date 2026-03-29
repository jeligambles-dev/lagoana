"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveSearchButtonProps {
  currentParams: Record<string, string | undefined>;
}

export function SaveSearchButton({ currentParams }: SaveSearchButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentParams.q || "Cautare salvata");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        query: currentParams.q || null,
        filters: {
          category: currentParams.category,
          condition: currentParams.condition,
          county: currentParams.county,
          minPrice: currentParams.minPrice,
          maxPrice: currentParams.maxPrice,
        },
      }),
    });

    if (res.ok) {
      toast.success("Cautare salvata! Vei fi notificat cand apar anunturi noi.");
      setOpen(false);
    } else {
      const data = await res.json();
      toast.error(data.error || "Eroare.");
    }
    setSaving(false);
  }

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-[#2A2A2A] text-[#EDEDED]"
        onClick={() => router.push("/cont/autentificare")}
      >
        <Bell className="h-4 w-4 mr-1.5" />
        Salveaza cautarea
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="border-[#2A2A2A] text-[#EDEDED]" />}>
        <Bell className="h-4 w-4 mr-1.5" />
        Salveaza cautarea
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salveaza cautarea</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#888]">
          Vei fi notificat cand apar anunturi noi care se potrivesc filtrelor tale.
        </p>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Numele cautarii</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lunete Zeiss sub 5000 RON"
            />
          </div>
          <div className="text-xs text-[#888] space-y-1">
            {currentParams.q && <p>Cuvinte cheie: <span className="text-[#EDEDED]">{currentParams.q}</span></p>}
            {currentParams.category && <p>Categorie: <span className="text-[#EDEDED]">{currentParams.category}</span></p>}
            {currentParams.county && <p>Judet: <span className="text-[#EDEDED]">{currentParams.county}</span></p>}
            {(currentParams.minPrice || currentParams.maxPrice) && (
              <p>Pret: <span className="text-[#EDEDED]">{currentParams.minPrice || "0"} - {currentParams.maxPrice || "∞"} RON</span></p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
            Salveaza si notifica-ma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
