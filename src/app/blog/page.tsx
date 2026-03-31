export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { Calendar, ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Articole",
  description:
    "Articole, ghiduri si sfaturi despre vanatoare, echipament si natura pe Lagoana — piata ta de echipament de vanatoare.",
  openGraph: {
    title: "Blog & Articole | Lagoana",
    description:
      "Articole, ghiduri si sfaturi despre vanatoare, echipament si natura.",
    type: "website",
    url: "https://www.lagoana.ro/blog",
    siteName: "Lagoana",
  },
  alternates: {
    canonical: "https://www.lagoana.ro/blog",
  },
};

async function getSectionsWithPosts() {
  return prisma.section.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    include: {
      posts: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: {
          author: { select: { name: true } },
        },
      },
      _count: {
        select: {
          posts: { where: { status: "published" } },
        },
      },
    },
  });
}

export default async function BlogPage() {
  const sections = await getSectionsWithPosts();

  // Colecteaza toate postarile recente pentru hero
  const allRecentPosts = sections
    .flatMap((s) =>
      s.posts.map((p) => ({ ...p, sectionSlug: s.slug, sectionName: s.name }))
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
    );

  const featuredPost = allRecentPosts[0] || null;
  const latestPosts = allRecentPosts.slice(1, 7);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-3">
          Blog & Articole
        </h1>
        <p className="text-[#888] text-lg max-w-2xl">
          Ghiduri, sfaturi si articole despre vanatoare, echipament si
          natura de la comunitatea Lagoana.
        </p>
      </div>

      {/* Articol principal */}
      {featuredPost && (
        <Link
          href={`/${featuredPost.sectionSlug}/${featuredPost.slug}`}
          className="block bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-gold/40 transition mb-10 group"
        >
          <div className="flex flex-col md:flex-row">
            {featuredPost.coverImageUrl && (
              <div className="relative md:w-1/2 h-56 md:h-72 shrink-0">
                <Image
                  src={featuredPost.coverImageUrl}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="text-xs text-gold font-semibold uppercase tracking-wider mb-2">
                {featuredPost.sectionName}
              </span>
              <h2 className="text-2xl font-bold text-[#EDEDED] mb-3 group-hover:text-gold transition">
                {featuredPost.title}
              </h2>
              <p className="text-[#888] text-sm mb-4 line-clamp-3">
                {featuredPost.body.replace(/<[^>]*>/g, "").slice(0, 200)}
                {featuredPost.body.replace(/<[^>]*>/g, "").length > 200
                  ? "..."
                  : ""}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#666]">
                {featuredPost.author.name && (
                  <span>{featuredPost.author.name}</span>
                )}
                {featuredPost.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(
                        new Date(featuredPost.publishedAt),
                        "d MMMM yyyy",
                        { locale: ro }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Ultimele articole */}
      {latestPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#EDEDED] mb-5">
            Ultimele articole
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/${post.sectionSlug}/${post.slug}`}
                className="block bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-gold/30 transition group"
              >
                {post.coverImageUrl && (
                  <div className="relative h-40">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-[10px] text-gold font-semibold uppercase tracking-wider">
                    {post.sectionName}
                  </span>
                  <h3 className="text-sm font-semibold text-[#EDEDED] mt-1 mb-2 line-clamp-2 group-hover:text-gold transition">
                    {post.title}
                  </h3>
                  <p className="text-[#888] text-xs line-clamp-2 mb-2">
                    {post.body.replace(/<[^>]*>/g, "").slice(0, 100)}
                  </p>
                  {post.publishedAt && (
                    <div className="flex items-center gap-1 text-[10px] text-[#666]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(post.publishedAt), "d MMM yyyy", {
                          locale: ro,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sectiuni */}
      {sections.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#EDEDED] mb-5">Sectiuni</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${section.slug}`}
                className="flex items-center justify-between bg-[#111111] rounded-xl border border-[#2A2A2A] p-5 hover:border-gold/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1B3A2B] flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#EDEDED] group-hover:text-gold transition">
                      {section.name}
                    </h3>
                    <p className="text-xs text-[#888]">
                      {section._count.posts}{" "}
                      {section._count.posts === 1 ? "articol" : "articole"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#666] group-hover:text-gold transition" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stare goala */}
      {sections.length === 0 && (
        <div className="text-center py-20 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <FileText className="h-12 w-12 text-[#555] mx-auto mb-4" />
          <p className="text-[#888] text-lg">
            Inca nu exista articole publicate.
          </p>
          <p className="text-[#666] text-sm mt-2">
            Revino curand pentru ghiduri si sfaturi.
          </p>
        </div>
      )}
    </div>
  );
}
