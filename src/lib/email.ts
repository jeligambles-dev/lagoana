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

export function reportEmailHtml(
  reporterName: string,
  adTitle: string,
  reason: string,
  details: string | null,
  adUrl: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
      </div>
      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
        <p style="color: #C9A646; font-size: 18px; font-weight: bold; margin: 0 0 15px;">Raport nou primit</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top; width: 100px;">Anunt:</td>
            <td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${adTitle}</td>
          </tr>
          <tr>
            <td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Raportat de:</td>
            <td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${reporterName}</td>
          </tr>
          <tr>
            <td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Motiv:</td>
            <td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${reason}</td>
          </tr>
          ${
            details
              ? `<tr>
            <td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Detalii:</td>
            <td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${details}</td>
          </tr>`
              : ""
          }
        </table>
      </div>
      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro/admin/rapoarte" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Vezi rapoartele
        </a>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
        <a href="https://www.lagoana.ro${adUrl}" style="color: #888; text-decoration: underline;">Vezi anuntul raportat</a>
      </p>
    </div>
  `;
}

interface DigestAd {
  title: string;
  price: string;
  imageUrl: string | null;
  url: string;
}

interface DigestCategory {
  name: string;
  count: number;
}

export function weeklyDigestEmailHtml(
  newAdsCount: number,
  topAds: DigestAd[],
  topCategories: DigestCategory[]
): string {
  const adRows = topAds
    .map(
      (ad) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #2A2A2A;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${
                ad.imageUrl
                  ? `<td style="width: 80px; vertical-align: top; padding-right: 12px;">
                      <img src="${ad.imageUrl}" alt="${ad.title}" width="80" height="60" style="border-radius: 6px; object-fit: cover; display: block;" />
                    </td>`
                  : ""
              }
              <td style="vertical-align: top;">
                <a href="https://www.lagoana.ro${ad.url}" style="color: #EDEDED; font-size: 14px; font-weight: 600; text-decoration: none;">${ad.title}</a>
                <p style="color: #C9A646; font-size: 14px; font-weight: bold; margin: 4px 0 0;">${ad.price}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  const categoryRows = topCategories
    .map(
      (cat) =>
        `<span style="display: inline-block; background: #1B3A2B; color: #C9A646; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 3px 2px;">${cat.name} (${cat.count})</span>`
    )
    .join(" ");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
        <p style="color: #888; font-size: 14px; margin-top: 5px;">Rezumatul saptamanii</p>
      </div>

      <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 20px;">
        <p style="color: #C9A646; font-size: 36px; font-weight: bold; margin: 0;">${newAdsCount}</p>
        <p style="color: #888; font-size: 14px; margin: 5px 0 0;">anunturi noi in ultima saptamana</p>
      </div>

      ${
        topAds.length > 0
          ? `<div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #C9A646; font-size: 14px; font-weight: bold; margin: 0 0 12px;">Cele mai noi anunturi</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${adRows}
              </table>
            </div>`
          : ""
      }

      ${
        topCategories.length > 0
          ? `<div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #C9A646; font-size: 14px; font-weight: bold; margin: 0 0 12px;">Categorii populare saptamana aceasta</p>
              <div>${categoryRows}</div>
            </div>`
          : ""
      }

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.lagoana.ro/anunturi" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px;">
          Vezi toate anunturile
        </a>
      </div>

      <p style="color: #666; font-size: 11px; text-align: center; margin-top: 30px;">
        Primesti acest email deoarece ai cautari salvate sau favorite pe Lagoana.
      </p>
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
