import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { userId, action } = await request.json();

  switch (action) {
    case "suspend":
      await prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
      break;
    case "ban":
      await prisma.user.update({ where: { id: userId }, data: { status: "BANNED" } });
      await prisma.ad.updateMany({ where: { userId }, data: { status: "REMOVED" } });
      break;
    case "activate":
      await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
      break;
    case "resetPassword": {
      const tempPassword = await hash("temp123456", 12);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: tempPassword } });
      // TODO: send email with temp password
      break;
    }
    default:
      return NextResponse.json({ error: "Actiune necunoscuta." }, { status: 400 });
  }

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action,
      targetType: "user",
      targetId: userId,
    },
  });

  return NextResponse.json({ success: true });
}
