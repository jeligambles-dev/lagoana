import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      bio: true,
      county: true,
      city: true,
      avatarUrl: true,
      isPhoneVerified: true,
      isIdVerified: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { name, phone, bio, county, city } = await request.json();

  // Validate phone: must be 10 digits if provided
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      return NextResponse.json(
        { error: "Numarul de telefon trebuie sa aiba 10 cifre." },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone, bio, county, city },
  });

  return NextResponse.json({ success: true });
}
