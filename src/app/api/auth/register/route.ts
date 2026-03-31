import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 10 cereri per oră per IP
  const limited = rateLimitByIp(request, "register", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const { name, email, password, referralCode } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Toate campurile sunt obligatorii." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Parola trebuie sa aiba cel putin 6 caractere." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Exista deja un cont cu acest email." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  // Look up referrer if referral code provided
  let referrerId: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      referredBy: referrerId || undefined,
    },
  });

  // Create referral record if we have a valid referrer
  if (referrerId) {
    await prisma.referral.create({
      data: {
        referrerId,
        referredId: newUser.id,
      },
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
