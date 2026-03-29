"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactButtonProps {
  adId: string;
  sellerId: string;
  isLoggedIn: boolean;
}

export function ContactButton({ adId, sellerId, isLoggedIn }: ContactButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Buna ziua, sunt interesat de acest produs. Este inca disponibil?");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, receiverId: sellerId, body: message }),
    });

    if (res.ok) {
      toast.success("Mesaj trimis cu succes!");
      setOpen(false);
      setMessage("");
    } else {
      toast.error("Eroare la trimiterea mesajului.");
    }
    setSending(false);
  }

  if (!isLoggedIn) {
    return (
      <Button
        className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
        onClick={() => router.push("/cont/autentificare")}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Contacteaza vanzatorul
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold" />}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Contacteaza vanzatorul
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trimite un mesaj</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Scrie mesajul tau..."
          />
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Trimite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
