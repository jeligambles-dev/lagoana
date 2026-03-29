"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportButtonProps {
  adId: string;
  isLoggedIn: boolean;
}

const REASONS = [
  "Inselaciune / Scam",
  "Produs interzis",
  "Categorie gresita",
  "Continut ofensator",
  "Informatii false",
  "Altele",
];

export function ReportButton({ adId, isLoggedIn }: ReportButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  async function handleReport() {
    if (!reason) return;
    setSending(true);

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, reason, details }),
    });

    if (res.ok) {
      toast.success("Raportul a fost trimis. Multumim!");
      setOpen(false);
      setReason("");
      setDetails("");
    } else {
      toast.error("Eroare la trimiterea raportului.");
    }
    setSending(false);
  }

  if (!isLoggedIn) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/cont/autentificare")} className="flex-1">
        <Flag className="h-4 w-4 mr-1" /> Raporteaza
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="flex-1" />}>
        <Flag className="h-4 w-4 mr-1" /> Raporteaza
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raporteaza anuntul</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motiv</Label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-gold"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Detalii (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Adauga detalii suplimentare..."
            />
          </div>
          <Button
            onClick={handleReport}
            disabled={sending || !reason}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Trimite raportul
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
