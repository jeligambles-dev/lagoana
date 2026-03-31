import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const pendingUsers = await prisma.user.findMany({
    where: { idVerificationStatus: "PENDING" },
    select: {
      id: true,
      name: true,
      email: true,
      idDocumentUrl: true,
      idVerificationStatus: true,
      createdAt: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  return NextResponse.json({ users: pendingUsers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { userId, action } = await request.json();

  if (!userId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Parametri invalizi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { idVerificationStatus: true },
  });

  if (!user) return NextResponse.json({ error: "Utilizator negasit." }, { status: 404 });
  if (user.idVerificationStatus !== "PENDING") {
    return NextResponse.json({ error: "Aceasta cerere nu este in asteptare." }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        idVerificationStatus: "APPROVED",
        isIdVerified: true,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        idVerificationStatus: "REJECTED",
        idDocumentUrl: null,
      },
    });
  }

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: action === "approve" ? "APPROVE_ID_VERIFICATION" : "REJECT_ID_VERIFICATION",
      targetType: "User",
      targetId: userId,
    },
  });

  return NextResponse.json({
    success: true,
    message: action === "approve" ? "Identitate aprobata." : "Identitate respinsa.",
  });
}
