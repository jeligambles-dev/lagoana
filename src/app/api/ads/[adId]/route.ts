import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId } = await params;

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      attributes: true,
    },
  });

  if (!ad) {
    return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  }
  if (ad.userId !== session.user.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  return NextResponse.json(ad);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId } = await params;
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  if (ad.userId !== session.user.id) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const data = await request.json();

  // Extract newImages before passing data to update
  const newImages = data.newImages;
  delete data.newImages;

  // Track price changes for notifications
  if (data.price !== undefined && ad.price !== null && data.price !== ad.price) {
    data.previousPrice = ad.price;
  }

  await prisma.ad.update({ where: { id: adId }, data });

  // Add new images if provided
  if (newImages && Array.isArray(newImages) && newImages.length > 0) {
    const existingCount = await prisma.adImage.count({ where: { adId } });
    const imagesToCreate = newImages.slice(0, 10 - existingCount);
    for (let i = 0; i < imagesToCreate.length; i++) {
      await prisma.adImage.create({
        data: {
          adId,
          url: imagesToCreate[i].url,
          position: existingCount + i,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId } = await params;

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) {
    return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  }

  // Allow owner or admin to delete
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (ad.userId !== session.user.id && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  await prisma.ad.update({
    where: { id: adId },
    data: { status: "REMOVED" },
  });

  return NextResponse.json({ success: true });
}
