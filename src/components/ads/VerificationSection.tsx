"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Phone, Mail, CheckCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface VerificationStatus {
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  phone: string | null;
  email: string;
}

export function VerificationSection() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [verifyingType, setVerifyingType] = useState<"phone" | "email" | null>(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => setStatus({
        isPhoneVerified: data.isPhoneVerified ?? false,
        isIdVerified: data.isIdVerified ?? false,
        phone: data.phone,
        email: data.email,
      }));
  }, []);

  async function sendCode(type: "phone" | "email") {
    setSending(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", type }),
    });
    const data = await res.json();
    if (res.ok) {
      setVerifyingType(type);
      setCode("");
      if (data.devCode) setDevCode(data.devCode);
      toast.success(data.message);
    } else {
      toast.error(data.error);
    }
    setSending(false);
  }

  async function verifyCode() {
    if (!verifyingType || !code) return;
    setVerifying(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", type: verifyingType, code }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setVerifyingType(null);
      setCode("");
      setDevCode(null);
      // Update status
      setStatus((prev) => prev ? {
        ...prev,
        ...(verifyingType === "phone" ? { isPhoneVerified: true } : { isIdVerified: true }),
      } : null);
    } else {
      toast.error(data.error);
    }
    setVerifying(false);
  }

  if (!status) return null;

  return (
    <Card className="bg-[#111111] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Verificare cont
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#888]">
          Verifica-ti contul pentru a primi un badge de incredere pe profilul si anunturile tale.
        </p>

        {/* Email verification */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0B0B] border border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#888]" />
            <div>
              <p className="text-sm text-[#EDEDED]">Email</p>
              <p className="text-xs text-[#888]">{status.email}</p>
            </div>
          </div>
          {status.isIdVerified ? (
            <span className="flex items-center gap-1 text-xs text-gold">
              <CheckCircle className="h-4 w-4" /> Verificat
            </span>
          ) : (
            <Button
              size="sm"
              onClick={() => sendCode("email")}
              disabled={sending || verifyingType === "email"}
              className="bg-gold text-[#0B0B0B] hover:bg-gold-light text-xs"
            >
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
              Verifica
            </Button>
          )}
        </div>

        {/* Code entry */}
        {verifyingType && (
          <div className="p-3 rounded-lg bg-[#1B3A2B]/20 border border-gold/20 space-y-3">
            <p className="text-sm text-[#EDEDED]">
              Introdu codul de 6 cifre trimis pe {verifyingType === "phone" ? "telefon" : "email"}:
            </p>
            {devCode && (
              <p className="text-xs text-gold bg-[#0B0B0B] p-2 rounded font-mono">
                Cod de test: {devCode}
              </p>
            )}
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button
                onClick={verifyCode}
                disabled={verifying || code.length !== 6}
                className="bg-gold text-[#0B0B0B] hover:bg-gold-light"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirma"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
