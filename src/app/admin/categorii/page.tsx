"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronRight, FolderTree, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  position: number;
  isActive: boolean;
  parentId: string | null;
  children?: Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }

  function openAdd(parentId: string | null = null) {
    setAddParentId(parentId);
    setFormName("");
    setFormSlug("");
    setFormIcon("");
    setFormImageUrl("");
    setFormDescription("");
    setShowAdd(true);
    setEditingCat(null);
  }

  function openEdit(cat: Category) {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon || "");
    setFormImageUrl(cat.imageUrl || "");
    setFormDescription(cat.description || "");
    setShowAdd(true);
    setAddParentId(cat.parentId);
  }

  async function handleSave() {
    const endpoint = "/api/admin/categories";
    const method = editingCat ? "PUT" : "POST";
    const body = {
      ...(editingCat && { id: editingCat.id }),
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      icon: formIcon || null,
      imageUrl: formImageUrl || null,
      description: formDescription || null,
      parentId: addParentId,
    };

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editingCat ? "Categorie actualizata." : "Categorie adaugata.");
      setShowAdd(false);
      loadCategories();
    } else {
      const data = await res.json();
      toast.error(data.error || "Eroare.");
    }
  }

  async function handleDelete(catId: string) {
    if (!confirm("Stergi aceasta categorie? Anunturile vor fi mutate in categoria parinte.")) return;

    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: catId }),
    });

    if (res.ok) {
      toast.success("Categorie stearsa.");
      loadCategories();
    } else {
      toast.error("Eroare la stergere.");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setFormImageUrl(data.url);
      toast.success("Imagine incarcata.");
    } else {
      toast.error("Eroare la incarcarea imaginii.");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function toggleActive(catId: string, isActive: boolean) {
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: catId, isActive: !isActive }),
    });
    loadCategories();
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Gestionare categorii</h2>
        <Button onClick={() => openAdd(null)} className="bg-gold hover:bg-gold-light">
          <Plus className="h-4 w-4 mr-1" /> Categorie noua
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cat.imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1E1E1E] shrink-0">
                      <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <FolderTree className="h-5 w-5 text-gold" />
                  )}
                  <span className="font-medium text-[#EDEDED]">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs">/{cat.slug}</Badge>
                  {!cat.isActive && (
                    <Badge className="bg-[#1E1E1E] text-[#888] text-xs">Inactiv</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(cat.id, cat.isActive)}>
                    {cat.isActive ? "Dezactiveaza" : "Activeaza"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(cat)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openAdd(cat.id)} title="Adauga subcategorie">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Subcategories */}
              {cat.children && cat.children.length > 0 && (
                <div className="mt-3 ml-8 space-y-2">
                  {cat.children.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2 px-3 bg-[#111111] rounded-lg">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-[#666]" />
                        <span className="text-sm text-[#EDEDED]/80">{sub.name}</span>
                        <Badge variant="secondary" className="text-[10px]">/{sub.slug}</Badge>
                        {!sub.isActive && (
                          <Badge className="bg-[#1E1E1E] text-[#888] text-[10px]">Inactiv</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(sub)} className="h-7">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} className="h-7 text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Editeaza categorie" : addParentId ? "Adauga subcategorie" : "Adauga categorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingCat) {
                    setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }
                }}
                placeholder="Numele categoriei"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="slug-categorie"
              />
            </div>
            <div className="space-y-2">
              <Label>Icona (numele Lucide icon)</Label>
              <Input
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                placeholder="Ex: Crosshair, Target, Eye"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagine categorie</Label>
              {formImageUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#1E1E1E] mb-2">
                  <Image src={formImageUrl} alt="Preview" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-[#2A2A2A] bg-[#111111] cursor-pointer hover:border-gold transition text-sm text-[#888]">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Incarca imagine
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="sau URL imagine"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descriere scurta a categoriei"
              />
            </div>
            <Button onClick={handleSave} className="w-full bg-gold hover:bg-gold-light">
              {editingCat ? "Salveaza" : "Adauga"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
