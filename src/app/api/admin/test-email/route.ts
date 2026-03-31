import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  sendEmail,
  verificationEmailHtml,
  newMessageEmailHtml,
  savedSearchMatchEmailHtml,
  priceDropEmailHtml,
  expiringAdEmailHtml,
  reportEmailHtml,
} from "@/lib/email";

const SAMPLE_DATA: Record<string, { subject: string; html: string }> = {
  verification: {
    subject: "Codul tau de verificare - Lagoana",
    html: verificationEmailHtml("482915"),
  },
  newMessage: {
    subject: "Mesaj nou pe Lagoana",
    html: newMessageEmailHtml(
      "Andrei Popescu",
      "Blaser R8 Professional .308 Win",
      "Buna ziua, mai este disponibila arma? As fi interesat sa o vad personal."
    ),
  },
  savedSearchMatch: {
    subject: "Anunturi noi pentru cautarea ta - Lagoana",
    html: savedSearchMatchEmailHtml("Lunete Swarovski", [
      "Swarovski Z8i 2-16x50 P",
      "Swarovski dS 5-25x52 P L",
      "Swarovski Z6i 2.5-15x56",
    ]),
  },
  priceDrop: {
    subject: "Pret redus la un anunt favorit - Lagoana",
    html: priceDropEmailHtml(
      "Merkel Helix Speedster .30-06",
      8500,
      6800,
      "/anunturi/arme/merkel-helix-speedster"
    ),
  },
  expiringAd: {
    subject: "Anunt favorit expira curand - Lagoana",
    html: expiringAdEmailHtml(
      "Zeiss Victory V8 1.8-14x50",
      "/anunturi/optice/zeiss-victory-v8"
    ),
  },
  report: {
    subject: "Raport nou primit - Lagoana",
    html: reportEmailHtml(
      "Maria Ionescu",
      "Anunt suspect - pret prea mic",
      "Posibila frauda",
      "Pretul este nerealist de mic pentru acest model, posibila tentativa de inselaciune.",
      "/anunturi/arme/anunt-suspect"
    ),
  },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { templateType, recipientEmail } = await request.json();

  if (!templateType || !recipientEmail) {
    return NextResponse.json(
      { error: "templateType si recipientEmail sunt obligatorii." },
      { status: 400 }
    );
  }

  const template = SAMPLE_DATA[templateType];
  if (!template) {
    return NextResponse.json(
      { error: `Tip template necunoscut: ${templateType}` },
      { status: 400 }
    );
  }

  const success = await sendEmail({
    to: recipientEmail,
    subject: `[TEST] ${template.subject}`,
    html: template.html,
  });

  if (!success) {
    return NextResponse.json(
      { error: "Trimiterea emailului a esuat. Verifica configurarea." },
      { status: 500 }
    );
  }

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "test_email_sent",
      targetType: "email_template",
      targetId: templateType,
    },
  });

  return NextResponse.json({ success: true });
}
