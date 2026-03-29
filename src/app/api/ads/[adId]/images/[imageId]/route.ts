import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ adId: string; imageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId, imageId } = await params;

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) {
    return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  }
  if (ad.userId !== session.user.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const image = await prisma.adImage.findUnique({ where: { id: imageId } });
  if (!image || image.adId !== adId) {
    return NextResponse.json({ error: "Imagine negasita." }, { status: 404 });
  }

  await prisma.adImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}
