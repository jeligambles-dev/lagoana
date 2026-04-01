"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Edit, Loader2, Save, ArrowLeft, Eye,
  Bold, Italic, Heading1, Heading2, List, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
  updatedBy: string | null;
}

const PAGE_LABELS: Record<string, string> = {
  despre: "Despre noi",
  termeni: "Termeni si conditii",
};

export default function AdminPaginiPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageContent | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadPages = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Eroare la incarcarea paginilor");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  function openEdit(page: PageContent) {
    setEditing(page);
    setTitle(page.title);
    setContent(page.content);
    setShowPreview(false);
  }

  function goBack() {
    setEditing(null);
    setTitle("");
    setContent("");
    setShowPreview(false);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editing.slug, title, content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Eroare la salvare");
      }
      toast.success("Pagina a fost salvata cu succes");
      loadPages();
      goBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  function insertTag(tag: string, wrap = false) {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let insertion: string;
    if (wrap && selected) {
      insertion = `<${tag}>${selected}</${tag}>`;
    } else if (tag === "ul") {
      insertion = selected
        ? `<ul class="list-disc list-inside space-y-2 ml-2">\n  <li>${selected}</li>\n</ul>`
        : `<ul class="list-disc list-inside space-y-2 ml-2">\n  <li></li>\n</ul>`;
    } else if (tag === "a") {
      insertion = `<a href="" class="text-gold hover:underline">${selected || "link"}</a>`;
    } else {
      insertion = `<${tag}>${selected}</${tag}>`;
    }

    const newContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + insertion.length;
      textarea.selectionEnd = start + insertion.length;
    }, 0);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Edit mode
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="text-[#888] hover:text-[#EDEDED]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Inapoi
          </Button>
          <h2 className="text-xl font-bold text-[#EDEDED]">
            Editeaza: {PAGE_LABELS[editing.slug] || editing.slug}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[#EDEDED] mb-2 block">Titlu</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#111111] border-[#2A2A2A] text-[#EDEDED]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[#EDEDED]">Continut HTML</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#888] hover:text-gold"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? "Ascunde previzualizare" : "Previzualizare"}
              </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-[#111111] border border-[#2A2A2A] rounded-t-lg">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("strong", true)}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("em", true)}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("h2", true)}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Heading 2"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("h3", true)}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Heading 3"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("ul")}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Lista"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("a")}
                className="text-[#888] hover:text-gold h-8 w-8 p-0"
                title="Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("p", true)}
                className="text-[#888] hover:text-gold px-2 h-8 text-xs"
                title="Paragraf"
              >
                &lt;p&gt;
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  insertTag(
                    'section class="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8"',
                    false
                  )
                }
                className="text-[#888] hover:text-gold px-2 h-8 text-xs"
                title="Sectiune card"
              >
                Card
              </Button>
            </div>

            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full bg-[#111111] border border-[#2A2A2A] border-t-0 rounded-b-lg text-[#EDEDED] p-4 font-mono text-sm resize-y focus:outline-none focus:border-gold/50"
              placeholder="Introdu continutul HTML al paginii..."
            />
          </div>

          {/* Live preview */}
          {showPreview && (
            <div>
              <Label className="text-[#EDEDED] mb-2 block">Previzualizare</Label>
              <div
                className="bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl p-6 min-h-[200px] prose-invert"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !title || !content}
              className="bg-gold hover:bg-gold/90 text-black font-medium"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salveaza
            </Button>
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-[#888] hover:text-[#EDEDED]"
            >
              Anuleaza
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-gold" />
        <h2 className="text-xl font-bold text-[#EDEDED]">Pagini editabile</h2>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card
            key={page.id}
            className="bg-[#111111] border-[#2A2A2A] hover:border-gold/30 transition cursor-pointer"
            onClick={() => openEdit(page)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="text-[#EDEDED] font-semibold">
                  {PAGE_LABELS[page.slug] || page.title}
                </h3>
                <p className="text-[#888] text-sm mt-1">
                  /{page.slug} &middot; Ultima actualizare:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold hover:text-gold/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editeaza
              </Button>
            </CardContent>
          </Card>
        ))}

        {pages.length === 0 && (
          <p className="text-[#888] text-center py-8">
            Nu exista pagini editabile.
          </p>
        )}
      </div>
    </div>
  );
}
