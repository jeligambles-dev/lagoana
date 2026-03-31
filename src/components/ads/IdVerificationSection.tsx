"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Upload, CheckCircle, Clock, XCircle, Loader2, FileImage } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type VerificationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export function IdVerificationSection() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/verify/id")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status ?? "NONE");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tip de fisier neacceptat. Foloseste JPG, PNG sau WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fisierul depaseste 10MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecteaza o fotografie a documentului.");
      return;
    }

    setUploading(true);

    try {
      // Upload the file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        toast.error(data.error || "Eroare la incarcare.");
        setUploading(false);
        return;
      }
      const { url } = await uploadRes.json();

      // Submit for verification
      const verifyRes = await fetch("/api/verify/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentUrl: url }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        toast.success(verifyData.message);
        setStatus("PENDING");
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast.error(verifyData.error || "Eroare.");
      }
    } catch {
      toast.error("Eroare la trimiterea documentului.");
    }

    setUploading(false);
  }

  if (loading) return null;

  return (
    <Card className="bg-[#111111] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Verificare identitate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#888]">
          Incarca o fotografie a actului de identitate (fata) pentru a primi badge-ul de
          identitate verificata. Documentul va fi verificat de echipa noastra.
        </p>

        {status === "APPROVED" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1B3A2B]/30 border border-green-800/30">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">Identitate verificata</p>
              <p className="text-xs text-[#888]">Actul tau de identitate a fost verificat cu succes.</p>
            </div>
          </div>
        )}

        {status === "PENDING" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
            <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400">In asteptare</p>
              <p className="text-xs text-[#888]">Documentul tau este in curs de verificare. Vei fi notificat cand va fi aprobat.</p>
            </div>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800/30">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Respins</p>
              <p className="text-xs text-[#888]">Documentul a fost respins. Te rugam sa incarci un document valid.</p>
            </div>
          </div>
        )}

        {(status === "NONE" || status === "REJECTED") && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-6 text-center cursor-pointer hover:border-gold/40 transition-colors"
            >
              {previewUrl ? (
                <div className="relative w-full max-w-xs mx-auto aspect-[3/2]">
                  <Image
                    src={previewUrl}
                    alt="Preview document"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileImage className="h-10 w-10 text-[#444]" />
                  <p className="text-sm text-[#888]">Click pentru a selecta fotografia</p>
                  <p className="text-xs text-[#666]">JPG, PNG sau WebP, max 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={uploading || !previewUrl}
              className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Trimite pentru verificare
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
