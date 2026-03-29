export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { Calendar } from "lucide-react";

type Props = {
  params: Promise<{ sectionSlug: string }>;
};

async function getSection(slug: string) {
  return prisma.section.findUnique({
    where: { slug, isActive: true },
    include: {
      posts: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionSlug } = await params;
  const section = await getSection(sectionSlug);

  if (!section) {
    return { title: "Sectiune negasita" };
  }

  return {
    title: section.name,
    description: section.description || `Articole din sectiunea ${section.name}`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { sectionSlug } = await params;
  const section = await getSection(sectionSlug);

  if (!section) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-3">
          {section.name}
        </h1>
        {section.description && (
          <p className="text-[#888] text-lg">{section.description}</p>
        )}
      </div>

      {section.posts.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <p className="text-[#888]">
            Inca nu exista articole in aceasta sectiune.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {section.posts.map((post) => (
            <Link
              key={post.id}
              href={`/${sectionSlug}/${post.slug}`}
              className="block bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-[#3A3A3A] transition group"
            >
              <div className="flex flex-col sm:flex-row">
                {post.coverImageUrl && (
                  <div className="relative sm:w-64 h-48 sm:h-auto shrink-0">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-xl font-semibold text-[#EDEDED] mb-2 group-hover:text-gold transition">
                    {post.title}
                  </h2>
                  <p className="text-[#888] text-sm mb-3 line-clamp-3">
                    {post.body.replace(/<[^>]*>/g, "").slice(0, 150)}
                    {post.body.replace(/<[^>]*>/g, "").length > 150 ? "..." : ""}
                  </p>
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-[#666]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(post.publishedAt), "d MMMM yyyy", {
                          locale: ro,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
