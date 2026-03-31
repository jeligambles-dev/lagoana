import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generateReferralCode(name: string): string {
  const cleanName = (name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  const random = Math.random().toString(36).slice(2, 7);
  return `${cleanName}-${random}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, name: true },
  });

  const totalReferrals = await prisma.referral.count({
    where: { referrerId: session.user.id },
  });

  const pendingRewards = await prisma.referral.count({
    where: { referrerId: session.user.id, rewardGiven: false },
  });

  return NextResponse.json({
    referralCode: user?.referralCode || null,
    totalReferrals,
    pendingRewards,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, name: true },
  });

  if (user?.referralCode) {
    return NextResponse.json({ referralCode: user.referralCode });
  }

  // Generate unique code, retry if collision
  let code = generateReferralCode(user?.name || "user");
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) break;
    code = generateReferralCode(user?.name || "user");
    attempts++;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
  });

  return NextResponse.json({ referralCode: updated.referralCode }, { status: 201 });
}
