"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileStack, Eye, EyeOff, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Section {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  isActive: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  _count?: { posts: number };
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formType, setFormType] = useState("blog");
  const [formDesc, setFormDesc] = useState("");
  const [formHeader, setFormHeader] = useState(false);
  const [formFooter, setFormFooter] = useState(false);

  useEffect(() => { loadSections(); }, []);

  function loadSections() {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((data) => { setSections(data); setLoading(false); });
  }

  function openCreate() {
    setEditing(null);
    setFormName(""); setFormSlug(""); setFormType("blog"); setFormDesc("");
    setFormHeader(false); setFormFooter(false);
    setShowDialog(true);
  }

  function openEdit(section: Section) {
    setEditing(section);
    setFormName(section.name); setFormSlug(section.slug); setFormType(section.type);
    setFormDesc(section.description || ""); setFormHeader(section.showInHeader); setFormFooter(section.showInFooter);
    setShowDialog(true);
  }

  async function handleSave() {
    const body = {
      ...(editing && { id: editing.id }),
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      type: formType,
      description: formDesc || null,
      showInHeader: formHeader,
      showInFooter: formFooter,
    };

    const res = await fetch("/api/admin/sections", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Sectiune actualizata." : "Sectiune creata.");
      setShowDialog(false);
      loadSections();
    } else {
      toast.error("Eroare.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Stergi aceasta sectiune si toate postarile?")) return;
    const res = await fetch("/api/admin/sections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Sectiune stearsa."); loadSections(); }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    loadSections();
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Sectiuni de continut</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-light">
          <Plus className="h-4 w-4 mr-1" /> Sectiune noua
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <p className="text-[#888]">Nu ai creat nicio sectiune. Creeaza un blog, retete sau ghiduri.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileStack className="h-5 w-5 text-gold" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#EDEDED]">{section.name}</span>
                      <Badge variant="secondary" className="text-xs">/{section.slug}</Badge>
                      <Badge variant="secondary" className="text-xs">{section.type}</Badge>
                      {!section.isActive && <Badge className="bg-[#1E1E1E] text-[#888] text-xs">Inactiv</Badge>}
                    </div>
                    <p className="text-xs text-[#888] mt-0.5">
                      {section._count?.posts || 0} postari
                      {section.showInHeader && " | In header"}
                      {section.showInFooter && " | In footer"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button render={<Link href={`/admin/sectiuni/${section.id}/postari`} />} variant="outline" size="sm" className="border-gold/30 text-gold">
                    <FileText className="h-3 w-3 mr-1" /> Postari
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(section.id, section.isActive)}>
                    {section.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(section)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(section.id)} className="text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editeaza sectiune" : "Sectiune noua"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input value={formName} onChange={(e) => {
                setFormName(e.target.value);
                if (!editing) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }} placeholder="Ex: Blog, Retete, Ghiduri" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="blog" />
            </div>
            <div className="space-y-2">
              <Label>Tip</Label>
              <select value={formType} onChange={(e) => setFormType(e.target.value)}
                className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm">
                <option value="blog">Blog</option>
                <option value="recipes">Retete</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Descriere scurta..." />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formHeader} onChange={(e) => setFormHeader(e.target.checked)} className="rounded" />
                <span className="text-sm">Arata in header</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formFooter} onChange={(e) => setFormFooter(e.target.checked)} className="rounded" />
                <span className="text-sm">Arata in footer</span>
              </label>
            </div>
            <Button onClick={handleSave} className="w-full bg-gold hover:bg-gold-light">
              {editing ? "Salveaza" : "Creeaza"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
