"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId as string;
  const postId = params.postId as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/posts?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then((posts) => {
        const post = posts.find((p: { id: string }) => p.id === postId);
        if (post) {
          setTitle(post.title);
          setSlug(post.slug);
          setCoverImageUrl(post.coverImageUrl || "");
          setBody(post.body);
          setStatus(post.status);
        }
        setLoading(false);
      });
  }, [sectionId, postId]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, title, slug, body, coverImageUrl: coverImageUrl || null, status }),
    });

    if (res.ok) {
      toast.success("Postare salvata.");
      router.push(`/admin/sectiuni/${sectionId}/postari`);
    } else {
      toast.error("Eroare la salvare.");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button render={<Link href={`/admin/sectiuni/${sectionId}/postari`} />} variant="outline" size="sm" className="border-[#2A2A2A]">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold text-[#EDEDED]">Editeaza postare</h2>
      </div>

      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titlu</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagine coperta (URL)</Label>
            <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label>Continut</Label>
            <TipTapEditor content={body} onChange={setBody} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Label>Status:</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-md border border-[#2A2A2A] bg-[#1E1E1E] text-[#EDEDED] px-3 text-sm"
              >
                <option value="draft">Ciorna</option>
                <option value="published">Publicat</option>
              </select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salveaza
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
