"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Loader2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string | null };
}

export default function SectionPostsPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/posts?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); });
  }, [sectionId]);

  async function handleDelete(id: string) {
    if (!confirm("Stergi aceasta postare?")) return;
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Postare stearsa.");
    }
  }

  async function togglePublish(post: Post) {
    const newStatus = post.status === "published" ? "draft" : "published";
    const res = await fetch("/api/admin/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, status: newStatus }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
      toast.success(newStatus === "published" ? "Postare publicata." : "Postare retrasa in ciorna.");
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Postari</h2>
        <Button render={<Link href={`/admin/sectiuni/${sectionId}/postari/nou`} />} className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold">
          <Plus className="h-4 w-4 mr-1" /> Postare noua
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <FileText className="h-12 w-12 text-[#555] mx-auto mb-3" />
          <p className="text-[#888]">Nicio postare in aceasta sectiune.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="bg-[#111111] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#EDEDED]">{post.title}</span>
                    <Badge className={post.status === "published" ? "bg-[#1B3A2B] text-gold" : "bg-[#2A2A2A] text-[#888]"}>
                      {post.status === "published" ? "Publicat" : "Ciorna"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#888] mt-1">
                    {post.author.name} &middot; {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ro })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => togglePublish(post)} className="border-[#2A2A2A]">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button render={<Link href={`/admin/sectiuni/${sectionId}/postari/${post.id}`} />} variant="outline" size="sm" className="border-[#2A2A2A]">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} className="border-[#2A2A2A] text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
