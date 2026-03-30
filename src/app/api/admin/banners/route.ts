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

export async function GET() {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const banners = await prisma.banner.findMany({
    orderBy: { position: "asc" },
  });

  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { title, imageUrl, linkUrl, company, startsAt, expiresAt } = await request.json();

  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Titlul si imaginea sunt obligatorii." }, { status: 400 });
  }

  const maxPos = await prisma.banner.aggregate({ _max: { position: true } });
  const position = (maxPos._max.position ?? -1) + 1;

  const banner = await prisma.banner.create({
    data: {
      title,
      imageUrl,
      linkUrl: linkUrl || null,
      company: company || null,
      position,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(banner, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID lipsa." }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl || null;
  if (data.company !== undefined) updateData.company = data.company || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const banner = await prisma.banner.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(banner);
}

export async function DELETE(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID lipsa." }, { status: 400 });

  await prisma.banner.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
