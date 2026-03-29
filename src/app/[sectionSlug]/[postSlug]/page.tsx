export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { ArrowLeft, Calendar, User } from "lucide-react";

type Props = {
  params: Promise<{ sectionSlug: string; postSlug: string }>;
};

async function getPost(sectionSlug: string, postSlug: string) {
  const section = await prisma.section.findUnique({
    where: { slug: sectionSlug, isActive: true },
  });

  if (!section) return null;

  const post = await prisma.sectionPost.findUnique({
    where: {
      sectionId_slug: {
        sectionId: section.id,
        slug: postSlug,
      },
      status: "published",
    },
    include: {
      author: { select: { name: true } },
      section: { select: { name: true, slug: true } },
    },
  });

  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionSlug, postSlug } = await params;
  const post = await getPost(sectionSlug, postSlug);

  if (!post) {
    return { title: "Articol negasit" };
  }

  return {
    title: post.title,
    description: post.body.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function PostPage({ params }: Props) {
  const { sectionSlug, postSlug } = await params;
  const post = await getPost(sectionSlug, postSlug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href={`/${sectionSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-gold transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Inapoi la {post.section.name}
      </Link>

      {/* Cover image */}
      {post.coverImageUrl && (
        <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Title & meta */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-[#888] mb-8">
        {post.author.name && (
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>{post.author.name}</span>
          </div>
        )}
        {post.publishedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(post.publishedAt), "d MMMM yyyy", {
                locale: ro,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        className="prose-dark"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </div>
  );
}
