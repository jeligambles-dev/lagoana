"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Crosshair, Target, Eye, Sword, Shirt, Settings, Dog, MapPin,
  Upload, X, Loader2, Plus, ArrowLeft,
} from "lucide-react";
import { COUNTIES } from "@/lib/constants";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";

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
  previewUrl: string;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

export default function AdminCreateAdPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<"NEW" | "USED" | "LIKE_NEW">("USED");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Search users
  useEffect(() => {
    if (!userSearch.trim() || userSearch.length < 2) {
      setUsers([]);
      return;
    }
    setUsersLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/admin/ads/create?searchUsers=${encodeURIComponent(userSearch)}`)
        .then((r) => r.json())
        .then((data) => {
          setUsers(data.users || []);
          setUsersLoading(false);
        })
        .catch(() => setUsersLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (images.length >= 10) break;
      const formData = new FormData();
      formData.append("file", file);

      const previewUrl = URL.createObjectURL(file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, { url: data.url, previewUrl }]);
      } else {
        URL.revokeObjectURL(previewUrl);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!selectedCategoryId && !selectedSubcategoryId) {
      setError("Selecteaza o categorie.");
      return;
    }
    if (!title.trim()) {
      setError("Titlul este obligatoriu.");
      return;
    }
    if (!description.trim()) {
      setError("Descrierea este obligatorie.");
      return;
    }
    if (!county) {
      setError("Selecteaza judetul.");
      return;
    }
    if (!city.trim()) {
      setError("Orasul este obligatoriu.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/ads/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUserId || undefined,
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
      setError(data.error || "Eroare la creare.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/anunturi/${data.categorySlug}/${data.slug}`);
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Adauga anunt (admin)</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/anunturi")}
          className="border-[#2A2A2A] text-[#EDEDED]/80 hover:bg-[#1E1E1E]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Inapoi la anunturi
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700/50 text-green-200 p-3 rounded-lg text-sm">{success}</div>
      )}

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
        {/* User selection */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Utilizator (optional)</Label>
          <p className="text-xs text-[#888]">
            Selecteaza un utilizator existent sau lasa gol pentru a folosi contul tau de admin.
          </p>
          <div className="flex gap-3 items-start">
            <div className="flex-1 relative">
              <Input
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  if (!e.target.value.trim()) setSelectedUserId("");
                }}
                placeholder="Cauta dupa email sau nume..."
                className="bg-[#0B0B0B] border-[#2A2A2A]"
              />
              {usersLoading && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-[#666]" />
              )}
              {users.length > 0 && userSearch.length >= 2 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#2A2A2A] bg-[#1E1E1E] shadow-lg">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setUserSearch(u.name ? `${u.name} (${u.email})` : u.email);
                        setUsers([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#EDEDED] hover:bg-[#2A2A2A] hover:text-gold transition-colors"
                    >
                      <span className="font-medium">{u.name || "Fara nume"}</span>
                      <span className="text-[#888] ml-2">{u.email}</span>
                      {u.phone && <span className="text-[#666] ml-2">({u.phone})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedUserId && (
              <button
                onClick={() => { setSelectedUserId(""); setUserSearch(""); }}
                className="mt-1 text-sm text-red-400 hover:text-red-300"
              >
                Sterge
              </button>
            )}
          </div>
          {selectedUserId && (
            <p className="text-xs text-gold">Utilizator selectat. Anuntul va fi publicat in numele acestuia.</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Categorie</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Target;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedSubcategoryId("");
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                    selectedCategoryId === cat.id
                      ? "border-gold bg-[#1B3A2B]/30"
                      : "border-[#2A2A2A] hover:border-[#444]"
                  }`}
                >
                  <Icon className="h-5 w-5 text-gold" />
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

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titlu</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Luneta Zeiss Victory V8 2.8-20x56"
            maxLength={100}
            className="bg-[#0B0B0B] border-[#2A2A2A]"
          />
          <p className="text-xs text-[#888] text-right">{title.length}/100</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descriere</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrie produsul in detaliu..."
            rows={5}
            className="bg-[#0B0B0B] border-[#2A2A2A]"
          />
        </div>

        {/* Condition */}
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

        {/* Price */}
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
              className="bg-[#0B0B0B] border-[#2A2A2A]"
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

        {/* Photos */}
        <div>
          <Label className="mb-1 block">Fotografii (max. 10)</Label>
          <p className="text-xs text-[#888] mb-2">Trage pentru a reordona. Prima imagine va fi coperta anuntului.</p>
          <div className="grid grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${
                  dragIndex === i
                    ? "opacity-40 border-gold scale-95"
                    : dragOverIndex === i
                    ? "border-gold border-dashed"
                    : "border-[#2A2A2A]"
                }`}
              >
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Coperta
                  </span>
                )}
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

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="county">Judet</Label>
            <select
              id="county"
              value={county}
              onChange={(e) => { setCounty(e.target.value); setCity(""); }}
              className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#0B0B0B] px-3 text-sm"
            >
              <option value="">Selecteaza...</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Oras</Label>
            <CityAutocomplete
              county={county}
              value={city}
              onChange={setCity}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-[#2A2A2A]">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gold hover:bg-gold-light text-white px-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Se creeaza...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Publica anuntul
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
