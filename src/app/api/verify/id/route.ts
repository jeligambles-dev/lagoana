import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { idVerificationStatus: true, idDocumentUrl: true, isIdVerified: true },
  });

  if (!user) return NextResponse.json({ error: "Utilizator negasit." }, { status: 404 });

  return NextResponse.json({
    status: user.idVerificationStatus,
    hasDocument: !!user.idDocumentUrl,
    isIdVerified: user.isIdVerified,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { documentUrl } = await request.json();

  if (!documentUrl || typeof documentUrl !== "string") {
    return NextResponse.json({ error: "URL-ul documentului este necesar." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { idVerificationStatus: true },
  });

  if (!user) return NextResponse.json({ error: "Utilizator negasit." }, { status: 404 });

  if (user.idVerificationStatus === "APPROVED") {
    return NextResponse.json({ error: "Identitatea ta este deja verificata." }, { status: 400 });
  }

  if (user.idVerificationStatus === "PENDING") {
    return NextResponse.json({ error: "Ai deja o cerere de verificare in asteptare." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      idDocumentUrl: documentUrl,
      idVerificationStatus: "PENDING",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Documentul a fost trimis pentru verificare. Vei fi notificat cand va fi aprobat.",
  });
}
