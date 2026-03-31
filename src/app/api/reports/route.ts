import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, reportEmailHtml } from "@/lib/email";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  // Rate limit: 10 rapoarte per oră per IP
  const limited = rateLimitByIp(request, "report", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const { adId, reason, details } = await request.json();

  if (!adId || !reason) {
    return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: session.user.id,
      adId,
      reason,
      details: details || null,
    },
    include: {
      reporter: { select: { name: true, email: true } },
      ad: {
        select: {
          title: true,
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  // Trimite email de notificare catre admin
  try {
    let adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      adminEmail = admin?.email || undefined;
    }

    if (adminEmail) {
      const adUrl = `/anunturi/${report.ad.category.slug}/${report.ad.slug}`;
      const reporterName = report.reporter.name || report.reporter.email;
      const html = reportEmailHtml(
        reporterName,
        report.ad.title,
        reason,
        details || null,
        adUrl
      );

      await sendEmail({
        to: adminEmail,
        subject: `Raport nou: ${report.ad.title}`,
        html,
      });
    }
  } catch (error) {
    // Nu oprim raspunsul daca emailul esueaza
    console.error("[REPORT] Eroare la trimiterea emailului catre admin:", error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
