import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, verificationEmailHtml } from "@/lib/email";

const verificationCodes = new Map<string, { code: string; type: string; expiresAt: number }>();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { action, type, code } = await request.json();

  if (action === "send") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Utilizator negasit." }, { status: 404 });

    if (type === "phone" && !user.phone) {
      return NextResponse.json({ error: "Adauga un numar de telefon in profil." }, { status: 400 });
    }
    if (type === "email" && !user.email) {
      return NextResponse.json({ error: "Email lipsa." }, { status: 400 });
    }

    // Generate 6-digit code
    const verifyCode = String(Math.floor(100000 + Math.random() * 900000));
    verificationCodes.set(`${session.user.id}-${type}`, {
      code: verifyCode,
      type,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    });

    if (type === "email") {
      const sent = await sendEmail({
        to: user.email,
        subject: "Cod de verificare - Lagoana",
        html: verificationEmailHtml(verifyCode),
      });

      if (!sent) {
        return NextResponse.json({ error: "Eroare la trimiterea emailului. Incearca din nou." }, { status: 500 });
      }
    } else {
      // Phone: log to console for now (integrate SMS provider later)
      console.log(`\n[SMS] Verification code for ${user.phone}: ${verifyCode}\n`);
    }

    return NextResponse.json({
      success: true,
      message: type === "phone"
        ? "Codul a fost trimis prin SMS."
        : "Codul a fost trimis pe email.",
      // DEV ONLY: include code for phone testing (email is sent for real)
      ...(type === "phone" && process.env.NODE_ENV !== "production" && { devCode: verifyCode }),
    });
  }

  if (action === "verify") {
    const key = `${session.user.id}-${type}`;
    const stored = verificationCodes.get(key);

    if (!stored || stored.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Codul a expirat. Trimite un cod nou." }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Cod incorect." }, { status: 400 });
    }

    // Mark as verified
    if (type === "phone") {
      await prisma.user.update({ where: { id: session.user.id }, data: { isPhoneVerified: true } });
    } else if (type === "email") {
      await prisma.user.update({ where: { id: session.user.id }, data: { isIdVerified: true } });
    }

    verificationCodes.delete(key);

    return NextResponse.json({ success: true, message: "Verificare reusita!" });
  }

  return NextResponse.json({ error: "Actiune necunoscuta." }, { status: 400 });
}
