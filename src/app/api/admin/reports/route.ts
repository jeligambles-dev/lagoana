import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { reportId, adId, action } = await request.json();

  switch (action) {
    case "dismiss":
      await prisma.report.update({ where: { id: reportId }, data: { status: "DISMISSED" } });
      break;
    case "removeAd":
      await prisma.ad.update({ where: { id: adId }, data: { status: "REMOVED" } });
      await prisma.report.update({ where: { id: reportId }, data: { status: "ACTIONED" } });
      break;
    default:
      return NextResponse.json({ error: "Actiune necunoscuta." }, { status: 400 });
  }

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: `report_${action}`,
      targetType: "report",
      targetId: reportId,
    },
  });

  return NextResponse.json({ success: true });
}
