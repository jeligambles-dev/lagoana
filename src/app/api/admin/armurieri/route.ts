import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const armurieri = await prisma.armurier.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(armurieri);
}

export async function POST(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const data = await request.json();
  const armurier = await prisma.armurier.create({ data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "create_armurier",
      targetType: "armurier",
      targetId: armurier.id,
    },
  });

  return NextResponse.json(armurier, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id, ...data } = await request.json();
  const armurier = await prisma.armurier.update({ where: { id }, data });
  return NextResponse.json(armurier);
}

export async function DELETE(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id } = await request.json();
  await prisma.armurier.delete({ where: { id } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "delete_armurier",
      targetType: "armurier",
      targetId: id,
    },
  });

  return NextResponse.json({ success: true });
}
