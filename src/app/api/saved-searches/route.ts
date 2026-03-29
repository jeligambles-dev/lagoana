import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(searches);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { name, query, filters, notifyEmail, notifyPush } = await request.json();

  const count = await prisma.savedSearch.count({ where: { userId: session.user.id } });
  if (count >= 20) {
    return NextResponse.json({ error: "Maxim 20 cautari salvate." }, { status: 400 });
  }

  const search = await prisma.savedSearch.create({
    data: {
      userId: session.user.id,
      name: name || query || "Cautare salvata",
      query: query || null,
      filters: JSON.stringify(filters || {}),
      notifyEmail: notifyEmail ?? true,
      notifyPush: notifyPush ?? true,
    },
  });

  return NextResponse.json(search, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await request.json();

  await prisma.savedSearch.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
