import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function resetPasswordEmailHtml(resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
        <p style="color: #888; font-size: 14px; margin-top: 5px;">Piata ta de vanatoare</p>
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 30px; text-align: center;">
        <p style="color: #EDEDED; font-size: 16px; margin: 0 0 20px;">Ai solicitat resetarea parolei.</p>
        <p style="color: #888; font-size: 14px; margin: 0 0 25px;">Apasa butonul de mai jos pentru a-ti seta o parola noua:</p>
        <a href="${resetLink}" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 15px;">
          Reseteaza parola
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 25px;">Linkul expira in 1 ora.</p>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
        Daca nu ai solicitat resetarea parolei, ignora acest email.
      </p>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "OK" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete any existing reset tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Generate token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Store hashed token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send email with raw token
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "https://www.lagoana.ro";
      const resetLink = `${baseUrl}/cont/reseteaza-parola?token=${rawToken}&email=${encodeURIComponent(email)}`;

      sendEmail({
        to: email,
        subject: "Resetare parola - Lagoana",
        html: resetPasswordEmailHtml(resetLink),
      }).catch((err) => console.error("[RESET_PASSWORD] Email failed:", err));
    }

    // Always return success immediately (don't wait for email)
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[RESET_PASSWORD] POST error:", error);
    return NextResponse.json({ message: "OK" });
  }
}

export async function PUT(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Date incomplete." },
        { status: 400 }
      );
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: hashedToken,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Link invalid sau expirat." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: hashedToken,
        },
      },
    });

    return NextResponse.json({ message: "Parola a fost resetata cu succes." });
  } catch (error) {
    console.error("[RESET_PASSWORD] PUT error:", error);
    return NextResponse.json(
      { error: "A aparut o eroare. Incearca din nou." },
      { status: 500 }
    );
  }
}
