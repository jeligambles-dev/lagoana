import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { AD_EXPIRY_DAYS } from "@/lib/constants";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const url = new URL(request.url);
  const searchUsers = url.searchParams.get("searchUsers") || "";

  if (searchUsers && searchUsers.length >= 2) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchUsers, mode: "insensitive" } },
          { name: { contains: searchUsers, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 10,
    });
    return NextResponse.json({ users });
  }

  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const data = await request.json();
  const {
    userId,
    title,
    description,
    categoryId,
    condition,
    price,
    isNegotiable,
    county,
    city,
    images,
  } = data;

  if (!title || !description || !categoryId || !condition || !county || !city) {
    return NextResponse.json({ error: "Campuri obligatorii lipsa." }, { status: 400 });
  }

  // Use selected user or fall back to admin's own userId
  const ownerId = userId || session.user.id;

  // Verify the user exists if one was selected
  if (userId) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Utilizatorul selectat nu exista." }, { status: 400 });
    }
  }

  const baseSlug = slugify(title, { lower: true, strict: true, locale: "ro" });
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AD_EXPIRY_DAYS);

  const ad = await prisma.ad.create({
    data: {
      userId: ownerId,
      categoryId,
      title,
      slug,
      description,
      price: price ? parseFloat(price) : null,
      isNegotiable: isNegotiable || false,
      condition,
      county,
      city,
      status: "ACTIVE",
      expiresAt,
      images: images?.length
        ? {
            create: images.map((img: { url: string }, i: number) => ({
              url: img.url,
              position: i,
            })),
          }
        : undefined,
    },
    include: {
      category: { select: { slug: true } },
    },
  });

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "create_ad",
      targetType: "ad",
      targetId: ad.id,
      details: JSON.stringify({
        title,
        ownerId,
        createdByAdmin: true,
      }),
    },
  });

  return NextResponse.json({
    success: true,
    slug: ad.slug,
    categorySlug: ad.category.slug,
  }, { status: 201 });
}
