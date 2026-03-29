import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return null;
  return session;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sectionId = url.searchParams.get("sectionId");
  if (!sectionId) return NextResponse.json({ error: "sectionId obligatoriu." }, { status: 400 });

  const posts = await prisma.sectionPost.findMany({
    where: { sectionId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { sectionId, title, slug, body, coverImageUrl, status } = await request.json();

  if (!sectionId || !title || !slug || !body) {
    return NextResponse.json({ error: "Campuri obligatorii lipsa." }, { status: 400 });
  }

  const post = await prisma.sectionPost.create({
    data: {
      sectionId,
      authorId: session.user.id,
      title,
      slug: slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      body,
      coverImageUrl: coverImageUrl || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id, ...data } = await request.json();

  if (data.status === "published") {
    const existing = await prisma.sectionPost.findUnique({ where: { id } });
    if (existing && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
  }

  const post = await prisma.sectionPost.update({ where: { id }, data });
  return NextResponse.json(post);
}

export async function DELETE(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id } = await request.json();
  await prisma.sectionPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
