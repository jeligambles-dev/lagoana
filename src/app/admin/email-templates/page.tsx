"use client";

import { useState } from "react";
import { Mail, Send, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Date de exemplu pentru fiecare template                           */
/* ------------------------------------------------------------------ */

interface TemplateInfo {
  key: string;
  label: string;
  description: string;
  subject: string;
  sampleHtml: string;
}

const TEMPLATES: TemplateInfo[] = [
  {
    key: "verification",
    label: "Verificare email",
    description: "Trimis cand un utilizator se inregistreaza sau cere un cod de verificare.",
    subject: "Codul tau de verificare - Lagoana",
    sampleHtml: verificationHtml("482915"),
  },
  {
    key: "newMessage",
    label: "Mesaj nou",
    description: "Trimis cand un utilizator primeste un mesaj legat de un anunt.",
    subject: "Mesaj nou pe Lagoana",
    sampleHtml: newMessageHtml(
      "Andrei Popescu",
      "Blaser R8 Professional .308 Win",
      "Buna ziua, mai este disponibila arma? As fi interesat sa o vad personal."
    ),
  },
  {
    key: "savedSearchMatch",
    label: "Cautare salvata - potrivire",
    description: "Trimis cand apar anunturi noi care corespund unei cautari salvate.",
    subject: "Anunturi noi pentru cautarea ta - Lagoana",
    sampleHtml: savedSearchMatchHtml("Lunete Swarovski", [
      "Swarovski Z8i 2-16x50 P",
      "Swarovski dS 5-25x52 P L",
      "Swarovski Z6i 2.5-15x56",
    ]),
  },
  {
    key: "priceDrop",
    label: "Reducere de pret",
    description: "Trimis cand un anunt favorit isi reduce pretul.",
    subject: "Pret redus la un anunt favorit - Lagoana",
    sampleHtml: priceDropHtml("Merkel Helix Speedster .30-06", 8500, 6800, "/anunturi/arme/merkel-helix-speedster"),
  },
  {
    key: "expiringAd",
    label: "Anunt favorit expira",
    description: "Trimis cand un anunt favorit urmeaza sa expire in curand.",
    subject: "Anunt favorit expira curand - Lagoana",
    sampleHtml: expiringAdHtml("Zeiss Victory V8 1.8-14x50", "/anunturi/optice/zeiss-victory-v8"),
  },
  {
    key: "report",
    label: "Raport primit",
    description: "Trimis administratorilor cand un utilizator raporteaza un anunt.",
    subject: "Raport nou primit - Lagoana",
    sampleHtml: reportHtml(
      "Maria Ionescu",
      "Anunt suspect - pret prea mic",
      "Posibila frauda",
      "Pretul este nerealist de mic pentru acest model, posibila tentativa de inselaciune.",
      "/anunturi/arme/anunt-suspect"
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Functii HTML (duplicat client-side pt preview)                    */
/* ------------------------------------------------------------------ */

function verificationHtml(code: string) {
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
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
  <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">Daca nu ai solicitat acest cod, ignora acest email.</p>
</div>`;
}

function newMessageHtml(senderName: string, adTitle: string, messagePreview: string) {
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
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
    <a href="https://www.lagoana.ro/cont/mesaje" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">Raspunde acum</a>
  </div>
</div>`;
}

function savedSearchMatchHtml(searchName: string, adTitles: string[]) {
  const adList = adTitles.map((t) => `<li style="color: #EDEDED; padding: 5px 0;">${t}</li>`).join("");
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
  </div>
  <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
    <p style="color: #C9A646; font-size: 14px; margin: 0 0 5px;">Anunturi noi pentru cautarea ta</p>
    <p style="color: #EDEDED; font-size: 18px; font-weight: bold; margin: 0 0 15px;">"${searchName}"</p>
    <ul style="padding-left: 20px; margin: 0;">${adList}</ul>
  </div>
  <div style="text-align: center; margin-top: 25px;">
    <a href="https://www.lagoana.ro/anunturi" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">Vezi anunturile</a>
  </div>
</div>`;
}

function priceDropHtml(adTitle: string, oldPrice: number, newPrice: number, adUrl: string) {
  const drop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
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
</div>`;
}

function expiringAdHtml(adTitle: string, adUrl: string) {
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
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
</div>`;
}

function reportHtml(reporterName: string, adTitle: string, reason: string, details: string | null, adUrl: string) {
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0B0B0B; color: #EDEDED; padding: 40px 30px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://www.lagoana.ro/logo.png" alt="Lagoana" width="120" height="120" style="display: block; margin: 0 auto 10px;" />
  </div>
  <div style="background: #111111; border: 1px solid #2A2A2A; border-radius: 8px; padding: 25px;">
    <p style="color: #C9A646; font-size: 18px; font-weight: bold; margin: 0 0 15px;">Raport nou primit</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top; width: 100px;">Anunt:</td><td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${adTitle}</td></tr>
      <tr><td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Raportat de:</td><td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${reporterName}</td></tr>
      <tr><td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Motiv:</td><td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${reason}</td></tr>
      ${details ? `<tr><td style="color: #888; font-size: 13px; padding: 6px 0; vertical-align: top;">Detalii:</td><td style="color: #EDEDED; font-size: 14px; padding: 6px 0;">${details}</td></tr>` : ""}
    </table>
  </div>
  <div style="text-align: center; margin-top: 25px;">
    <a href="https://www.lagoana.ro/admin/rapoarte" style="display: inline-block; background: #C9A646; color: #0B0B0B; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">Vezi rapoartele</a>
  </div>
  <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
    <a href="https://www.lagoana.ro${adUrl}" style="color: #888; text-decoration: underline;">Vezi anuntul raportat</a>
  </p>
</div>`;
}

/* ------------------------------------------------------------------ */
/*  Componenta principala                                             */
/* ------------------------------------------------------------------ */

export default function EmailTemplatesPage() {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; ok: boolean; msg: string } | null>(null);

  const toggle = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleSendTest = async (templateKey: string) => {
    if (!testEmail) {
      setFeedback({ key: templateKey, ok: false, msg: "Introdu o adresa de email." });
      return;
    }
    setSending(templateKey);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType: templateKey, recipientEmail: testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ key: templateKey, ok: true, msg: `Email trimis cu succes catre ${testEmail}` });
      } else {
        setFeedback({ key: templateKey, ok: false, msg: data.error || "Eroare la trimitere." });
      }
    } catch {
      setFeedback({ key: templateKey, ok: false, msg: "Eroare de retea." });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#EDEDED]">Template-uri email</h2>
        <span className="text-xs text-[#888]">
          {TEMPLATES.length} template-uri disponibile
        </span>
      </div>

      <p className="text-sm text-[#888]">
        Previzualizeaza template-urile de email si trimite email-uri de test. Template-urile sunt definite in codul sursa (<code className="text-gold">src/lib/email.ts</code>).
      </p>

      {/* Email de test global */}
      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-4">
        <label className="block text-sm text-[#888] mb-2">
          Adresa email pentru teste
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="admin@lagoana.ro"
          className="w-full sm:w-80 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#EDEDED] placeholder-[#555] focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Lista template-uri */}
      <div className="space-y-3">
        {TEMPLATES.map((tpl) => {
          const isExpanded = expandedKey === tpl.key;
          const fb = feedback?.key === tpl.key ? feedback : null;

          return (
            <div
              key={tpl.key}
              className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggle(tpl.key)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#1E1E1E]/50 transition"
              >
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#EDEDED]">{tpl.label}</p>
                  <p className="text-xs text-[#888] truncate">{tpl.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#888] shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#888] shrink-0" />
                )}
              </button>

              {/* Continut expandat */}
              {isExpanded && (
                <div className="border-t border-[#2A2A2A] px-5 py-4 space-y-4">
                  {/* Subiect */}
                  <div>
                    <span className="text-xs text-[#888] block mb-1">Subiect:</span>
                    <span className="text-sm text-[#EDEDED] font-medium">{tpl.subject}</span>
                  </div>

                  {/* Preview */}
                  <div>
                    <span className="text-xs text-[#888] block mb-2">Previzualizare:</span>
                    <div className="bg-[#1E1E1E] rounded-lg border border-[#2A2A2A] p-4 overflow-auto max-h-[600px]">
                      <div dangerouslySetInnerHTML={{ __html: tpl.sampleHtml }} />
                    </div>
                  </div>

                  {/* Trimite test */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleSendTest(tpl.key)}
                      disabled={sending === tpl.key}
                      className="inline-flex items-center gap-2 bg-gold text-[#0B0B0B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold/90 transition disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {sending === tpl.key ? "Se trimite..." : "Trimite email de test"}
                    </button>
                    {fb && (
                      <span className={`text-sm ${fb.ok ? "text-green-500" : "text-red-400"}`}>
                        {fb.msg}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota */}
      <div className="bg-[#1B3A2B]/20 border border-[#2A2A2A] rounded-xl p-4">
        <p className="text-xs text-[#888]">
          Template-urile sunt definite in cod si nu pot fi modificate din aceasta interfata.
          Pentru a edita un template, modifica functiile din <code className="text-gold">src/lib/email.ts</code>.
          Stocare in baza de date poate fi adaugata ulterior pentru personalizare din interfata.
        </p>
      </div>
    </div>
  );
}
