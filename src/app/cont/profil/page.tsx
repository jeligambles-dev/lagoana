"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTIES } from "@/lib/constants";
import { Loader2, Save, Copy, Share2, Users, Gift } from "lucide-react";
import { toast } from "sonner";
import { VerificationSection } from "@/components/ads/VerificationSection";
import { IdVerificationSection } from "@/components/ads/IdVerificationSection";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  county: string;
  city: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, pendingRewards: 0 });
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
    fetch("/api/referral")
      .then((r) => r.json())
      .then((data) => {
        setReferralCode(data.referralCode);
        setReferralStats({
          totalReferrals: data.totalReferrals || 0,
          pendingRewards: data.pendingRewards || 0,
        });
      });
  }, []);

  async function handleSave() {
    if (!profile) return;

    // Validate phone: must be 10 digits if provided
    if (profile.phone) {
      const digits = profile.phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        toast.error("Numarul de telefon trebuie sa aiba 10 cifre.");
        return;
      }
    }

    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      toast.success("Profil actualizat!");
      update();
    } else {
      toast.error("Eroare la salvare.");
    }
    setSaving(false);
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EDEDED]">Profilul meu</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informatii personale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-[#111111]" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="07xx xxx xxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Despre mine</Label>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Cateva cuvinte despre tine..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Judet</Label>
              <select
                value={profile.county || ""}
                onChange={(e) => setProfile({ ...profile, county: e.target.value })}
                className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm"
              >
                <option value="">Selecteaza...</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Oras</Label>
              <Input
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-light">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salveaza
          </Button>
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Invita prieteni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#888]">
            Invita-ti prietenii pe Lagoana si primesti un anunt promovat gratuit dupa 3 invitati!
          </p>

          {referralCode ? (
            <>
              <div className="flex items-center gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/cont/inregistrare?ref=${referralCode}`}
                  readOnly
                  className="bg-[#111111] text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/cont/inregistrare?ref=${referralCode}`
                    );
                    toast.success("Link copiat!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Lagoana - Piata de vanatoare",
                        text: "Inregistreaza-te pe Lagoana!",
                        url: `${window.location.origin}/cont/inregistrare?ref=${referralCode}`,
                      });
                    } else {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/cont/inregistrare?ref=${referralCode}`
                      );
                      toast.success("Link copiat!");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gold">{referralStats.totalReferrals}</p>
                  <p className="text-sm text-[#888]">Total invitati</p>
                </div>
                <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gold">{referralStats.pendingRewards}</p>
                  <p className="text-sm text-[#888]">Recompense in asteptare</p>
                </div>
              </div>

              {referralStats.pendingRewards >= 3 && (
                <div className="flex items-center gap-2 bg-green-900/20 text-green-400 p-3 rounded-md text-sm">
                  <Gift className="h-4 w-4" />
                  Ai o recompensa disponibila! Urmatorul anunt va fi promovat gratuit 7 zile.
                </div>
              )}
            </>
          ) : (
            <Button
              onClick={async () => {
                setGeneratingCode(true);
                const res = await fetch("/api/referral", { method: "POST" });
                const data = await res.json();
                setReferralCode(data.referralCode);
                setGeneratingCode(false);
                toast.success("Codul de referral a fost generat!");
              }}
              disabled={generatingCode}
              className="bg-gold hover:bg-gold-light text-[#0B0B0B]"
            >
              {generatingCode ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Genereaza link de invitare
            </Button>
          )}
        </CardContent>
      </Card>

      <VerificationSection />
      <IdVerificationSection />
    </div>
  );
}
