import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "Parametrul ids este obligatoriu." }, { status: 400 });
  }

  const ids = idsParam.split(",").slice(0, 4);

  if (ids.length < 2) {
    return NextResponse.json({ error: "Minim 2 anunturi pentru comparatie." }, { status: 400 });
  }

  const ads = await prisma.ad.findMany({
    where: {
      id: { in: ids },
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { slug: true, name: true } },
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // Preserve original order
  const ordered = ids
    .map((id) => ads.find((a) => a.id === id))
    .filter(Boolean);

  return NextResponse.json(ordered);
}
