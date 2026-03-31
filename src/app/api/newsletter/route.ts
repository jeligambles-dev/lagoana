import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe incercari. Incearca mai tarziu." }, { status: 429 });
  }

  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresa de email invalida." }, { status: 400 });
  }

  const existing = await prisma.newsletter.findUnique({ where: { email } });

  if (existing) {
    if (existing.isActive) {
      return NextResponse.json({ message: "Esti deja abonat la newsletter." });
    }
    // Re-activate
    await prisma.newsletter.update({
      where: { email },
      data: { isActive: true },
    });
    return NextResponse.json({ message: "Te-ai reabonat cu succes!" }, { status: 200 });
  }

  await prisma.newsletter.create({
    data: { email },
  });

  return NextResponse.json({ message: "Te-ai abonat cu succes la newsletter!" }, { status: 201 });
}
