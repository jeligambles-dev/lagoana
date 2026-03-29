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
  const sections = await prisma.section.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const data = await request.json();

  const section = await prisma.section.create({ data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "create_section",
      targetType: "section",
      targetId: section.id,
    },
  });

  return NextResponse.json(section, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id, ...data } = await request.json();
  const section = await prisma.section.update({ where: { id }, data });
  return NextResponse.json(section);
}

export async function DELETE(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id } = await request.json();
  await prisma.section.delete({ where: { id } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "delete_section",
      targetType: "section",
      targetId: id,
    },
  });

  return NextResponse.json({ success: true });
}
