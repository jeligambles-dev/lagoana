"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTIES } from "@/lib/constants";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { VerificationSection } from "@/components/ads/VerificationSection";
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

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!profile) return;
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

      <VerificationSection />
    </div>
  );
}
