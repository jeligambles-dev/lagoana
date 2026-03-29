import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId } = await params;

  await prisma.favorite.create({
    data: { userId: session.user.id, adId },
  });

  await prisma.ad.update({
    where: { id: adId },
    data: { favoritesCount: { increment: 1 } },
  });

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

  await prisma.favorite.delete({
    where: { userId_adId: { userId: session.user.id, adId } },
  });

  await prisma.ad.update({
    where: { id: adId },
    data: { favoritesCount: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}
