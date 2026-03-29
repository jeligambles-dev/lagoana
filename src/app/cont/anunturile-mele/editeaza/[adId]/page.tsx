"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, Save } from "lucide-react";
import { COUNTIES } from "@/lib/constants";
import { toast } from "sonner";
import Link from "next/link";

interface AdImage {
  id: string;
  url: string;
  position: number;
}

interface AdData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  condition: "NEW" | "USED" | "LIKE_NEW";
  county: string;
  city: string;
  images: AdImage[];
  category: { id: string; name: string; slug: string };
  attributes: { id: string; key: string; value: string }[];
}

export default function EditAdPage() {
  const { adId } = useParams<{ adId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [condition, setCondition] = useState<"NEW" | "USED" | "LIKE_NEW">("USED");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<AdImage[]>([]);

  const fetchAd = useCallback(async () => {
    try {
      const res = await fetch(`/api/ads/${adId}`);
      if (!res.ok) {
        toast.error("Nu s-a putut incarca anuntul.");
        router.push("/cont/anunturile-mele");
        return;
      }
      const ad: AdData = await res.json();
      setTitle(ad.title);
      setDescription(ad.description);
      setPrice(ad.price !== null ? String(ad.price) : "");
      setIsNegotiable(ad.isNegotiable);
      setCondition(ad.condition);
      setCounty(ad.county);
      setCity(ad.city);
      setImages(ad.images);
    } catch {
      toast.error("Eroare la incarcarea anuntului.");
      router.push("/cont/anunturile-mele");
    } finally {
      setLoading(false);
    }
  }, [adId, router]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  async function handleDeleteImage(imageId: string) {
    try {
      const res = await fetch(`/api/ads/${adId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Nu s-a putut sterge imaginea.");
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Imaginea a fost stearsa.");
    } catch {
      toast.error("Eroare la stergerea imaginii.");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (images.length >= 10) break;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          // Save image to ad via PUT with imageUrls or directly
          const imgRes = await fetch(`/api/ads/${adId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              newImages: [{ url: data.url }],
            }),
          });
          if (imgRes.ok) {
            // Refetch to get proper image IDs
            const adRes = await fetch(`/api/ads/${adId}`);
            if (adRes.ok) {
              const ad: AdData = await adRes.json();
              setImages(ad.images);
            }
          }
        }
      } catch {
        toast.error("Eroare la incarcarea imaginii.");
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }
    if (!description.trim()) {
      toast.error("Descrierea este obligatorie.");
      return;
    }
    if (!county) {
      toast.error("Selecteaza judetul.");
      return;
    }
    if (!city.trim()) {
      toast.error("Orasul este obligatoriu.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: price ? parseFloat(price) : null,
          isNegotiable,
          condition,
          county,
          city,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Eroare la salvare.");
        return;
      }

      toast.success("Anuntul a fost actualizat.");
      router.push("/cont/anunturile-mele");
    } catch {
      toast.error("Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          render={<Link href="/cont/anunturile-mele" />}
          variant="outline"
          size="sm"
          className="border-[#2A2A2A]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-[#EDEDED]">Editeaza anuntul</h1>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#EDEDED]">Titlu</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titlul anuntului"
                maxLength={100}
                className="bg-[#0B0B0B] border-[#2A2A2A] text-[#EDEDED]"
              />
              <p className="text-xs text-[#888] text-right">{title.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#EDEDED]">Descriere</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrierea anuntului"
                rows={5}
                className="bg-[#0B0B0B] border-[#2A2A2A] text-[#EDEDED]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#EDEDED]">Stare</Label>
              <div className="flex gap-3">
                {(["NEW", "USED", "LIKE_NEW"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      condition === c
                        ? "border-gold bg-[#1B3A2B]/30 text-gold"
                        : "border-[#2A2A2A] text-[#888] hover:border-[#444]"
                    }`}
                  >
                    {c === "NEW" ? "Nou" : c === "USED" ? "Folosit" : "Ca nou"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price & Location */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[#EDEDED]">Pret (RON)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="bg-[#0B0B0B] border-[#2A2A2A] text-[#EDEDED]"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded border-[#555] text-gold focus:ring-gold"
                  />
                  <span className="text-sm text-[#EDEDED]">Negociabil</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county" className="text-[#EDEDED]">Judet</Label>
                <select
                  id="county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-3 text-sm text-[#EDEDED]"
                >
                  <option value="">Selecteaza...</option>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#EDEDED]">Oras</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Oras"
                  className="bg-[#0B0B0B] border-[#2A2A2A] text-[#EDEDED]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6 space-y-4">
            <Label className="text-[#EDEDED]">Fotografii ({images.length}/10)</Label>
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-[#2A2A2A]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-[#555] flex flex-col items-center justify-center cursor-pointer hover:border-gold transition bg-[#0B0B0B]">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-[#666] animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-[#666]" />
                      <span className="text-[10px] text-[#666] mt-1">Adauga</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            render={<Link href="/cont/anunturile-mele" />}
            variant="outline"
            className="border-[#2A2A2A] text-[#888] hover:text-[#EDEDED]"
          >
            Anuleaza
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Se salveaza...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Salveaza
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
