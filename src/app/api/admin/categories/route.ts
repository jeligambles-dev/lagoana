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

export async function POST(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { name, slug, icon, imageUrl, description, parentId } = await request.json();

  if (!name || !slug) {
    return NextResponse.json({ error: "Numele si slug-ul sunt obligatorii." }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug-ul exista deja." }, { status: 409 });
  }

  const maxPos = await prisma.category.aggregate({
    where: { parentId: parentId || null },
    _max: { position: true },
  });

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      icon,
      imageUrl: imageUrl || null,
      description: description || null,
      parentId: parentId || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "create_category",
      targetType: "category",
      targetId: category.id,
      details: JSON.stringify({ name, slug }),
    },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id, ...data } = await request.json();

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "update_category",
      targetType: "category",
      targetId: id,
      details: JSON.stringify(data),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  const session = await verifyAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { id } = await request.json();

  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Categorie negasita." }, { status: 404 });
  }

  // Move ads to parent category if exists
  if (category.parentId) {
    await prisma.ad.updateMany({
      where: { categoryId: id },
      data: { categoryId: category.parentId },
    });
  }

  // Move child categories' ads too
  for (const child of category.children) {
    if (category.parentId) {
      await prisma.ad.updateMany({
        where: { categoryId: child.id },
        data: { categoryId: category.parentId },
      });
    }
    await prisma.category.delete({ where: { id: child.id } });
  }

  await prisma.category.delete({ where: { id } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "delete_category",
      targetType: "category",
      targetId: id,
      details: JSON.stringify({ name: category.name }),
    },
  });

  return NextResponse.json({ success: true });
}
