import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;

// Use Resend API in production, SMTP locally
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const transporter = !resend
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    })
  : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || "Lagoana <verify@lagoana.ro>";

  try {
    if (resend) {
      // Use Resend API (works on Railway, no SMTP port needed)
      const result = await resend.emails.send({ from, to, subject, html });
      if (result.error) {
        console.error("[EMAIL] Resend error:", result.error);
        return false;
      }
      console.log("[EMAIL] Sent via Resend to:", to);
      return true;
    }

    if (transporter) {
      // Use SMTP (local dev)
      await transporter.sendMail({ from, to, subject, html });
      console.log("[EMAIL] Sent via SMTP to:", to);
      return true;
    }

    console.error("[EMAIL] No email provider configured");
    return false;
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return false;
  }
}

export function verificationEmailHtml(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
        <p style="color: #888; font-size: 14px; margin-top: 5px;">Piata ta de vanatoare</p>
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 30px; text-align: center;">
        <p style="color: #EDEDED; font-size: 16px; margin: 0 0 20px;">Codul tau de verificare:</p>
        <div style="background: #1B3A2B; border-radius: 8px; padding: 20px; display: inline-block;">
          <span style="font-size: 36px; font-weight: bold; color: #C9A646; letter-spacing: 8px; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 20px;">Codul expira in 10 minute.</p>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
        Daca nu ai solicitat acest cod, ignora acest email.
      </p>
    </div>
  `;
}

export function newMessageEmailHtml(senderName: string, adTitle: string, messagePreview: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
        <p style="color: #C9A646; font-size: 14px; margin: 0 0 5px;">Mesaj nou de la</p>
        <p style="color: #EDEDED; font-size: 18px; font-weight: bold; margin: 0 0 15px;">${senderName}</p>
        <p style="color: #888; font-size: 13px; margin: 0 0 10px;">Referitor la: ${adTitle}</p>
        <div style="background: #1E1E1E; border-radius: 6px; padding: 15px; margin-top: 10px;">
          <p style="color: #EDEDED; font-size: 14px; margin: 0;">${messagePreview}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro/cont/mesaje" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Raspunde acum
        </a>
      </div>
    </div>
  `;
}

export function savedSearchMatchEmailHtml(searchName: string, adTitles: string[]): string {
  const adList = adTitles.map((t) => `<li style="color: #EDEDED; padding: 5px 0;">${t}</li>`).join("");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
        <p style="color: #C9A646; font-size: 14px; margin: 0 0 5px;">Anunturi noi pentru cautarea ta</p>
        <p style="color: #EDEDED; font-size: 18px; font-weight: bold; margin: 0 0 15px;">"${searchName}"</p>
        <ul style="padding-left: 20px; margin: 0;">${adList}</ul>
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro/anunturi" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Vezi anunturile
        </a>
      </div>
    </div>
  `;
}

export function priceDropEmailHtml(adTitle: string, oldPrice: number, newPrice: number, adUrl: string): string {
  const drop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px; text-align: center;">
        <p style="color: #C9A646; font-size: 20px; font-weight: bold; margin: 0 0 10px;">Pret redus cu ${drop}%!</p>
        <p style="color: #EDEDED; font-size: 16px; margin: 0 0 15px;">${adTitle}</p>
        <p style="color: #888; font-size: 14px; margin: 0; text-decoration: line-through;">${oldPrice.toLocaleString("ro-RO")} RON</p>
        <p style="color: #C9A646; font-size: 28px; font-weight: bold; margin: 5px 0 0;">${newPrice.toLocaleString("ro-RO")} RON</p>
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro${adUrl}" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">Vezi anuntul</a>
      </div>
    </div>
  `;
}

export function expiringAdEmailHtml(adTitle: string, adUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px; text-align: center;">
        <p style="color: #C9A646; font-size: 16px; font-weight: bold; margin: 0 0 10px;">Anunt favorit expira curand</p>
        <p style="color: #EDEDED; font-size: 16px; margin: 0 0 5px;">${adTitle}</p>
        <p style="color: #888; font-size: 13px; margin: 0;">Acest anunt expira in mai putin de 3 zile.</p>
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro${adUrl}" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">Vezi anuntul</a>
      </div>
    </div>
  `;
}
