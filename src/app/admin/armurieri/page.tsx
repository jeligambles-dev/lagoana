"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Store, Eye, EyeOff, Loader2, MapPin, Phone, Globe } from "lucide-react";
import { COUNTIES } from "@/lib/constants";
import { toast } from "sonner";

interface Armurier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  county: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

export default function AdminArmurieriPage() {
  const [armurieri, setArmurieri] = useState<Armurier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Armurier | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", address: "", county: "", city: "",
    phone: "", email: "", website: "", logoUrl: "",
  });

  useEffect(() => { load(); }, []);

  function load() {
    fetch("/api/admin/armurieri").then((r) => r.json()).then((d) => { setArmurieri(d); setLoading(false); });
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", address: "", county: "", city: "", phone: "", email: "", website: "", logoUrl: "" });
    setShowDialog(true);
  }

  function openEdit(a: Armurier) {
    setEditing(a);
    setForm({
      name: a.name, slug: a.slug, description: a.description || "", address: a.address,
      county: a.county, city: a.city, phone: a.phone || "", email: a.email || "",
      website: a.website || "", logoUrl: a.logoUrl || "",
    });
    setShowDialog(true);
  }

  async function handleSave() {
    const body = {
      ...(editing && { id: editing.id }),
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    };

    const res = await fetch("/api/admin/armurieri", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Armurier actualizat." : "Armurier adaugat.");
      setShowDialog(false);
      load();
    } else {
      toast.error("Eroare.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Stergi acest armurier?")) return;
    const res = await fetch("/api/admin/armurieri", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Armurier sters."); load(); }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/armurieri", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    load();
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Armurieri autorizati</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-light">
          <Plus className="h-4 w-4 mr-1" /> Adauga armurier
        </Button>
      </div>

      <p className="text-sm text-[#888]">
        Magazine autorizate care pot valida sau supraveghea tranzactiile de arme si munitie.
      </p>

      {armurieri.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl">
          <p className="text-[#888]">Nu ai adaugat niciun armurier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {armurieri.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#EDEDED]">{a.name}</span>
                      {!a.isActive && <Badge className="bg-[#1E1E1E] text-[#888] text-xs">Inactiv</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#888] mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.city}, {a.county}</span>
                      {a.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>}
                      {a.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{a.website}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(a.id, a.isActive)}>
                    {a.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editeaza armurier" : "Adauga armurier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input value={form.name} onChange={(e) => {
                setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") });
              }} placeholder="Numele armurieriei" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Adresa</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Str. Exemplu Nr. 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judet</Label>
                <select value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}
                  className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 text-sm">
                  <option value="">Selecteaza...</option>
                  {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Oras</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <Button onClick={handleSave} className="w-full bg-gold hover:bg-gold-light">
              {editing ? "Salveaza" : "Adauga"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
