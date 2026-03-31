import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 cereri per oră per IP
  const limited = rateLimitByIp(request, "contact", 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: "Toate campurile sunt obligatorii." },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
          <p style="color: #888; font-size: 14px; margin-top: 5px;">Mesaj nou de contact</p>
        </div>
        <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
          <p style="color: #888; font-size: 13px; margin: 0 0 5px;">De la:</p>
          <p style="color: #EDEDED; font-size: 16px; font-weight: bold; margin: 0 0 10px;">${name} (${email})</p>
          <p style="color: #888; font-size: 13px; margin: 0 0 5px;">Subiect:</p>
          <p style="color: #EDEDED; font-size: 16px; margin: 0 0 15px;">${subject}</p>
          <div style="background: #1E1E1E; border-radius: 6px; padding: 15px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 5px;">Mesaj:</p>
            <p style="color: #EDEDED; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: "admin@lagoana.ro",
      subject: `[Contact] ${subject}`,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[CONTACT API]", error);
    return Response.json(
      { error: "Eroare interna. Incearca din nou." },
      { status: 500 }
    );
  }
}
