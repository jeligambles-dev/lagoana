import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { targetId, adId, rating, comment } = await request.json();

  if (!targetId || !adId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  if (targetId === session.user.id) {
    return NextResponse.json({ error: "Nu poti lasa o recenzie tie insuti." }, { status: 400 });
  }

  // Check ad exists and is sold
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) return NextResponse.json({ error: "Anunt negasit." }, { status: 404 });
  if (ad.status !== "SOLD") {
    return NextResponse.json({ error: "Poti lasa o recenzie doar pentru anunturi vandute." }, { status: 400 });
  }
  if (ad.userId !== targetId) {
    return NextResponse.json({ error: "Vanzatorul nu corespunde anuntului." }, { status: 400 });
  }

  // Verify the reviewer had a conversation with the seller on this ad (i.e. was a buyer)
  const hadConversation = await prisma.message.findFirst({
    where: {
      adId,
      OR: [
        { senderId: session.user.id, receiverId: targetId },
        { senderId: targetId, receiverId: session.user.id },
      ],
    },
  });
  if (!hadConversation) {
    return NextResponse.json({ error: "Poti lasa o recenzie doar daca ai cumparat de la acest vanzator." }, { status: 403 });
  }

  // Check if review already exists
  const existing = await prisma.review.findUnique({
    where: { authorId_adId: { authorId: session.user.id, adId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ai lasat deja o recenzie pentru acest anunt." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      authorId: session.user.id,
      targetId,
      adId,
      rating,
      comment: comment?.trim() || null,
    },
  });

  // Notify the seller
  await prisma.notification.create({
    data: {
      userId: targetId,
      type: "new_review",
      title: `Recenzie noua: ${rating}/5 stele`,
      body: comment ? comment.substring(0, 100) : "Ai primit o recenzie noua.",
      link: `/cont/profil`,
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId obligatoriu." }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      ad: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const stats = await prisma.review.aggregate({
    where: { targetId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    reviews,
    averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
    totalReviews: stats._count.rating,
  });
}
