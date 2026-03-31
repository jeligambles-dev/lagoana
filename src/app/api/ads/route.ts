import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { AD_EXPIRY_DAYS } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!rateLimit(`post-ad:${session.user.id}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe anunturi publicate. Incearca mai tarziu." }, { status: 429 });
  }

  const data = await request.json();
  const { title, description, categoryId, condition, price, isNegotiable, county, city, images, attributes, status: adStatus, draftId } = data;

  const isDraft = adStatus === "DRAFT";

  // For drafts, only title is required (allow partial saves)
  if (isDraft) {
    if (!title) {
      return NextResponse.json({ error: "Titlul este obligatoriu chiar si pentru ciorne." }, { status: 400 });
    }
  } else {
    if (!title || !description || !categoryId || !condition || !county || !city) {
      return NextResponse.json({ error: "Campuri obligatorii lipsa." }, { status: 400 });
    }
  }

  // Check user has a phone number saved (skip for drafts)
  if (!isDraft) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } });
    if (!user?.phone) {
      return NextResponse.json({ error: "Trebuie sa ai un numar de telefon salvat in profil pentru a publica un anunt." }, { status: 400 });
    }
  }

  // If updating an existing draft, update it instead of creating new
  if (draftId) {
    const existingDraft = await prisma.ad.findUnique({ where: { id: draftId } });
    if (!existingDraft || existingDraft.userId !== session.user.id || existingDraft.status !== "DRAFT") {
      return NextResponse.json({ error: "Ciorna negasita." }, { status: 404 });
    }

    // Delete old images and re-create
    if (images?.length) {
      await prisma.adImage.deleteMany({ where: { adId: draftId } });
    }

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + AD_EXPIRY_DAYS);

    const updated = await prisma.ad.update({
      where: { id: draftId },
      data: {
        title,
        description: description || "",
        categoryId: categoryId || existingDraft.categoryId,
        condition: condition || existingDraft.condition,
        price: price ? parseFloat(price) : null,
        isNegotiable: isNegotiable || false,
        county: county || "",
        city: city || "",
        status: isDraft ? "DRAFT" : "ACTIVE",
        expiresAt: isDraft ? undefined : newExpiresAt,
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

    if (!isDraft) {
      return NextResponse.json({
        success: true,
        slug: updated.slug,
        categorySlug: updated.category.slug,
      }, { status: 201 });
    }

    return NextResponse.json({ success: true, id: updated.id }, { status: 200 });
  }

  const baseSlug = slugify(title, { lower: true, strict: true, locale: "ro" });
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AD_EXPIRY_DAYS);

  // For drafts, skip referral logic and create immediately
  if (isDraft) {
    const ad = await prisma.ad.create({
      data: {
        userId: session.user.id,
        categoryId: categoryId || (await prisma.category.findFirst({ select: { id: true } }))!.id,
        title,
        slug,
        description: description || "",
        price: price ? parseFloat(price) : null,
        isNegotiable: isNegotiable || false,
        condition: condition || "USED",
        county: county || "",
        city: city || "",
        status: "DRAFT",
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
    });

    return NextResponse.json({ success: true, id: ad.id }, { status: 201 });
  }

  // Check referral reward: 3+ referrals = free promoted ad
  let promotedUntil: Date | undefined;
  const totalReferrals = await prisma.referral.count({
    where: { referrerId: session.user.id },
  });
  if (totalReferrals >= 3) {
    // Check if there are unrewarded referrals
    const unrewarded = await prisma.referral.count({
      where: { referrerId: session.user.id, rewardGiven: false },
    });
    if (unrewarded >= 3) {
      promotedUntil = new Date();
      promotedUntil.setDate(promotedUntil.getDate() + 7);
      // Mark 3 referrals as rewarded
      const toReward = await prisma.referral.findMany({
        where: { referrerId: session.user.id, rewardGiven: false },
        take: 3,
        select: { id: true },
      });
      await prisma.referral.updateMany({
        where: { id: { in: toReward.map((r) => r.id) } },
        data: { rewardGiven: true },
      });
    }
  }

  const ad = await prisma.ad.create({
    data: {
      userId: session.user.id,
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
      promotedUntil: promotedUntil || undefined,
      images: images?.length
        ? {
            create: images.map((img: { url: string }, i: number) => ({
              url: img.url,
              position: i,
            })),
          }
        : undefined,
      attributes: attributes?.length
        ? {
            create: attributes.map((attr: { key: string; value: string }) => ({
              key: attr.key,
              value: attr.value,
            })),
          }
        : undefined,
    },
    include: {
      category: { select: { slug: true } },
    },
  });

  return NextResponse.json({
    success: true,
    slug: ad.slug,
    categorySlug: ad.category.slug,
  }, { status: 201 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const q = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";
  const condition = url.searchParams.get("condition") || "";
  const county = url.searchParams.get("county") || "";
  const minPrice = url.searchParams.get("minPrice") || "";
  const maxPrice = url.searchParams.get("maxPrice") || "";
  const sort = url.searchParams.get("sort") || "newest";

  const where: Record<string, unknown> = { status: "ACTIVE" as const };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category }, include: { children: true } });
    if (cat) {
      const catIds = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: catIds };
    }
  }

  if (condition) where.condition = condition;
  if (county) where.county = county;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
  }

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    default: orderBy.createdAt = "desc";
  }

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { slug: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ad.count({ where }),
  ]);

  return NextResponse.json({ ads, total, page, totalPages: Math.ceil(total / limit) });
}
