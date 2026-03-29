"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Crosshair, Target, Eye, Sword, Shirt, Settings, Dog, MapPin,
  ArrowLeft, ArrowRight, Upload, X, Check, Loader2,
} from "lucide-react";
import { COUNTIES } from "@/lib/constants";

const categoryIcons: Record<string, React.ElementType> = {
  "arme-de-foc": Crosshair,
  munitie: Target,
  optica: Eye,
  "cutite-unelte": Sword,
  "arcuri-arbalete": Target,
  echipament: Shirt,
  "accesorii-arme": Settings,
  "caini-vanatoare": Dog,
  servicii: MapPin,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  children?: Category[];
}

interface UploadedImage {
  url: string;
  file?: File;
}

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  // Step 1
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<"NEW" | "USED" | "LIKE_NEW">("USED");

  // Step 2
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (images.length >= 10) break;
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, { url: data.url }]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function validateStep1(): boolean {
    if (!selectedCategoryId && !selectedSubcategoryId) {
      setError("Selecteaza o categorie.");
      return false;
    }
    if (!title.trim()) {
      setError("Titlul este obligatoriu.");
      return false;
    }
    if (!description.trim()) {
      setError("Descrierea este obligatorie.");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!county) {
      setError("Selecteaza judetul.");
      return false;
    }
    if (!city.trim()) {
      setError("Orasul este obligatoriu.");
      return false;
    }
    return true;
  }

  async function handlePublish() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        categoryId: selectedSubcategoryId || selectedCategoryId,
        condition,
        price: price || null,
        isNegotiable,
        county,
        city,
        images: images.map((img) => ({ url: img.url })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Eroare la publicare.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/anunturi/${data.categorySlug}/${data.slug}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">Publica un anunt</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step ? "bg-gold text-white" : "bg-[#2A2A2A] text-[#888]"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-gold" : "bg-[#2A2A2A]"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-[#888]">
          {step === 1 ? "Ce vinzi?" : step === 2 ? "Detalii" : "Previzualizare"}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {/* Step 1: Category & Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Categorie</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.slug] || Target;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedCategorySlug(cat.slug);
                      setSelectedSubcategoryId("");
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                      selectedCategoryId === cat.id
                        ? "border-gold bg-[#1B3A2B]/30"
                        : "border-[#2A2A2A] hover:border-[#444]"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-gold" />
                    <span className="text-xs text-center font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCategory?.children && selectedCategory.children.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Subcategorie</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.children.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategoryId(sub.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      selectedSubcategoryId === sub.id
                        ? "border-gold bg-[#1B3A2B]/30 text-gold"
                        : "border-[#2A2A2A] hover:border-[#444]"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Titlu</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Luneta Zeiss Victory V8 2.8-20x56"
              maxLength={100}
            />
            <p className="text-xs text-[#888] text-right">{title.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrie produsul in detaliu: stare, specificatii, motivul vanzarii..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Stare</Label>
            <div className="flex gap-3">
              {(["NEW", "USED", "LIKE_NEW"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    condition === c
                      ? "border-gold bg-[#1B3A2B]/30 text-gold"
                      : "border-[#2A2A2A] text-[#888]"
                  }`}
                >
                  {c === "NEW" ? "Nou" : c === "USED" ? "Folosit" : "Ca nou"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => { setError(""); if (validateStep1()) setStep(2); }}
              className="bg-gold hover:bg-gold-light"
            >
              Continua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Price, Photos, Location */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Pret (RON)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
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
                <span className="text-sm">Negociabil</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Fotografii (max. 10)</Label>
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#2A2A2A]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-[#555] flex flex-col items-center justify-center cursor-pointer hover:border-green-800 transition">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">Judet</Label>
              <select
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm"
              >
                <option value="">Selecteaza...</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Oras</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Oras"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setError(""); setStep(1); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Inapoi
            </Button>
            <Button
              onClick={() => { setError(""); if (validateStep2()) setStep(3); }}
              className="bg-gold hover:bg-gold-light"
            >
              Continua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#1E1E1E] text-[#EDEDED]/80">
                  {selectedCategory?.name}
                </Badge>
                <Badge className={
                  condition === "NEW" ? "bg-[#1B3A2B] text-gold" :
                  condition === "LIKE_NEW" ? "bg-blue-100 text-blue-800" :
                  "bg-[#1E1E1E] text-[#EDEDED]/80"
                }>
                  {condition === "NEW" ? "Nou" : condition === "USED" ? "Folosit" : "Ca nou"}
                </Badge>
              </div>

              <h2 className="text-xl font-bold text-[#EDEDED]">{title}</h2>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <p className="text-2xl font-bold text-gold">
                {price ? `${parseFloat(price).toLocaleString("ro-RO")} RON` : "Pret la cerere"}
                {isNegotiable && <span className="text-sm font-normal text-[#888] ml-2">negociabil</span>}
              </p>

              <p className="text-[#EDEDED]/80 whitespace-pre-wrap">{description}</p>

              <div className="flex items-center gap-1 text-sm text-[#888]">
                <MapPin className="h-4 w-4" />
                {city}, {county}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setError(""); setStep(2); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Inapoi
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="bg-gold hover:bg-gold-light"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Se publica...
                </>
              ) : (
                "Publica anuntul"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
