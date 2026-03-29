import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { adId, action } = await request.json();

  switch (action) {
    case "remove":
      await prisma.ad.update({ where: { id: adId }, data: { status: "REMOVED" } });
      break;
    case "restore":
      await prisma.ad.update({ where: { id: adId }, data: { status: "ACTIVE" } });
      break;
    case "spotlight": {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      await prisma.ad.update({ where: { id: adId }, data: { spotlightUntil: until } });
      break;
    }
    default:
      return NextResponse.json({ error: "Actiune necunoscuta." }, { status: 400 });
  }

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action,
      targetType: "ad",
      targetId: adId,
    },
  });

  return NextResponse.json({ success: true });
}
