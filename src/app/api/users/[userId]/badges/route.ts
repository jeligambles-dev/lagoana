import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export interface SellerBadge {
  key: string;
  label: string;
  icon: string;
  color: "gold" | "green" | "blue";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      createdAt: true,
      isPhoneVerified: true,
      isIdVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilizator negasit." }, { status: 404 });
  }

  const badges: SellerBadge[] = [];

  // 1. "Top Vanzator" - 10+ sold ads
  const soldCount = await prisma.ad.count({
    where: { userId, status: "SOLD" },
  });
  if (soldCount >= 10) {
    badges.push({
      key: "top_seller",
      label: "Top Vanzator",
      icon: "trophy",
      color: "gold",
    });
  }

  // 2. "Raspuns Rapid" - average message response time < 2 hours
  // Calculate by finding pairs where user received a message and then replied
  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { id: true, adId: true, senderId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  if (receivedMessages.length >= 5) {
    let totalResponseMs = 0;
    let responseCount = 0;

    for (const msg of receivedMessages) {
      const reply = await prisma.message.findFirst({
        where: {
          adId: msg.adId,
          senderId: userId,
          receiverId: msg.senderId,
          createdAt: { gt: msg.createdAt },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      if (reply) {
        totalResponseMs += reply.createdAt.getTime() - msg.createdAt.getTime();
        responseCount++;
      }
    }

    if (responseCount >= 3) {
      const avgResponseHours = totalResponseMs / responseCount / (1000 * 60 * 60);
      if (avgResponseHours < 2) {
        badges.push({
          key: "fast_response",
          label: "Raspuns Rapid",
          icon: "zap",
          color: "blue",
        });
      }
    }
  }

  // 3. "Verificat" - phone AND ID verified
  if (user.isPhoneVerified && user.isIdVerified) {
    badges.push({
      key: "verified",
      label: "Verificat",
      icon: "shield-check",
      color: "green",
    });
  }

  // 4. "Membru Activ" - account older than 6 months + 5+ active ads
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isOldAccount = user.createdAt < sixMonthsAgo;

  if (isOldAccount) {
    const activeAdCount = await prisma.ad.count({
      where: { userId, status: "ACTIVE" },
    });
    if (activeAdCount >= 5) {
      badges.push({
        key: "active_member",
        label: "Membru Activ",
        icon: "activity",
        color: "blue",
      });
    }
  }

  // 5. "De Incredere" - 4.5+ average rating with 5+ reviews
  const reviewStats = await prisma.review.aggregate({
    where: { targetId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  if (
    reviewStats._count.rating >= 5 &&
    reviewStats._avg.rating != null &&
    reviewStats._avg.rating >= 4.5
  ) {
    badges.push({
      key: "trusted",
      label: "De Incredere",
      icon: "heart-handshake",
      color: "gold",
    });
  }

  return NextResponse.json({ badges });
}
