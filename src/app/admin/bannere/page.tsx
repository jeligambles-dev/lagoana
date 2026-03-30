"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2, Upload, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  company: string | null;
  isActive: boolean;
  position: number;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  function loadBanners() {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((data) => {
        setBanners(data);
        setLoading(false);
      });
  }

  function openAdd() {
    setEditing(null);
    setFormTitle("");
    setFormImageUrl("");
    setFormLinkUrl("");
    setFormCompany("");
    setFormStartsAt("");
    setFormExpiresAt("");
    setShowDialog(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setFormTitle(banner.title);
    setFormImageUrl(banner.imageUrl);
    setFormLinkUrl(banner.linkUrl || "");
    setFormCompany(banner.company || "");
    setFormStartsAt(banner.startsAt ? banner.startsAt.slice(0, 16) : "");
    setFormExpiresAt(banner.expiresAt ? banner.expiresAt.slice(0, 16) : "");
    setShowDialog(true);
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

  async function handleSave() {
    if (!formTitle || !formImageUrl) {
      toast.error("Titlul si imaginea sunt obligatorii.");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const body = {
      ...(editing && { id: editing.id }),
      title: formTitle,
      imageUrl: formImageUrl,
      linkUrl: formLinkUrl,
      company: formCompany,
      startsAt: formStartsAt || undefined,
      expiresAt: formExpiresAt || undefined,
    };

    const res = await fetch("/api/admin/banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Banner actualizat." : "Banner adaugat.");
      setShowDialog(false);
      loadBanners();
    } else {
      const data = await res.json();
      toast.error(data.error || "Eroare.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Stergi acest banner?")) return;

    const res = await fetch("/api/admin/banners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Banner sters.");
      loadBanners();
    } else {
      toast.error("Eroare la stergere.");
    }
  }

  async function toggleActive(banner: Banner) {
    await fetch("/api/admin/banners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
    });
    loadBanners();
  }

  async function movePosition(banner: Banner, direction: "up" | "down") {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const other = banners[swapIdx];
    await Promise.all([
      fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, position: other.position }),
      }),
      fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: other.id, position: banner.position }),
      }),
    ]);
    loadBanners();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isExpired(banner: Banner) {
    return banner.expiresAt && new Date(banner.expiresAt) < new Date();
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Gestionare bannere</h2>
        <Button onClick={openAdd} className="bg-gold hover:bg-gold-light">
          <Plus className="h-4 w-4 mr-1" /> Banner nou
        </Button>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-[#444] mx-auto mb-3" />
            <p className="text-[#888]">Niciun banner adaugat.</p>
            <p className="text-[#666] text-sm mt-1">Adauga bannere pentru a afisa reclame pe pagina principala.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, idx) => (
            <Card key={banner.id} className={!banner.isActive || isExpired(banner) ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-40 h-20 shrink-0 rounded-lg overflow-hidden bg-[#1E1E1E]">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#EDEDED] truncate">{banner.title}</h3>
                      {banner.isActive && !isExpired(banner) && (
                        <Badge className="bg-[#1B3A2B] text-gold text-[10px]">Activ</Badge>
                      )}
                      {!banner.isActive && (
                        <Badge className="bg-[#1E1E1E] text-[#888] text-[10px]">Inactiv</Badge>
                      )}
                      {isExpired(banner) && (
                        <Badge className="bg-red-900/30 text-red-400 text-[10px]">Expirat</Badge>
                      )}
                    </div>
                    {banner.company && (
                      <p className="text-xs text-gold mb-1">{banner.company}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[#888]">
                      <span>De la: {formatDate(banner.startsAt)}</span>
                      {banner.expiresAt && <span>Pana la: {formatDate(banner.expiresAt)}</span>}
                      {banner.linkUrl && (
                        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-gold hover:underline">
                          <ExternalLink className="h-3 w-3" /> Link
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => movePosition(banner, "up")} disabled={idx === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => movePosition(banner, "down")} disabled={idx === banners.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(banner)}>
                      {banner.isActive ? "Dezactiveaza" : "Activeaza"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(banner)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(banner.id)} className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editeaza banner" : "Adauga banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titlu *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titlul bannerului"
              />
            </div>

            <div className="space-y-2">
              <Label>Companie</Label>
              <Input
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Numele companiei (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagine *</Label>
              {formImageUrl && (
                <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-[#1E1E1E] mb-2">
                  <Image src={formImageUrl} alt="Preview" fill className="object-cover" sizes="500px" />
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="sau URL imagine externa"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link (URL destinatie)</Label>
              <Input
                value={formLinkUrl}
                onChange={(e) => setFormLinkUrl(e.target.value)}
                placeholder="https://exemplu.ro (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data start</Label>
                <Input
                  type="datetime-local"
                  value={formStartsAt}
                  onChange={(e) => setFormStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data expirare</Label>
                <Input
                  type="datetime-local"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                />
                <p className="text-[10px] text-[#666]">Lasa gol pentru nelimitat</p>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full bg-gold hover:bg-gold-light">
              {editing ? "Salveaza" : "Adauga banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
