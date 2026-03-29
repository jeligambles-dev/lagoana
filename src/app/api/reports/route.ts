import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId, reason, details } = await request.json();

  if (!adId || !reason) {
    return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
  }

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      adId,
      reason,
      details: details || null,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
