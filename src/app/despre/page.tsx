import type { Metadata } from "next";
import { UserPlus, FileText, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Despre Lagoana",
  description:
    "Lagoana este piata online romaneasca de echipament de vanatoare. Publica gratuit anunturi si conecteaza-te cu comunitatea de vanatori.",
};

const steps = [
  {
    icon: UserPlus,
    title: "Creeaza cont",
    description:
      "Inregistreaza-te gratuit in cateva secunde si acceseaza toate functiile platformei.",
  },
  {
    icon: FileText,
    title: "Publica anunt",
    description:
      "Adauga echipamentul tau cu fotografii, descriere si pret. Publicarea este complet gratuita.",
  },
  {
    icon: MessageCircle,
    title: "Contacteaza vanzatorul",
    description:
      "Gaseste ce ai nevoie si contacteaza direct vanzatorul prin sistemul nostru de mesagerie.",
  },
];

async function getPageContent() {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug: "despre" },
    });
    return page;
  } catch {
    return null;
  }
}

export default async function DesprePage() {
  const pageContent = await getPageContent();

  // If we have DB content, render it
  if (pageContent) {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />

        {/* How it works - always shown */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-[#EDEDED] mb-8 text-center">
            Cum functioneaza?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 text-center"
                >
                  <div className="w-14 h-14 bg-[#1B3A2B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#EDEDED] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Fallback: original hardcoded content
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 text-[#EDEDED]">
            Despre <span className="text-gold">Lagoana</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Lagoana este piata online romaneasca dedicata echipamentului de
            vanatoare. Platforma noastra ofera un spatiu sigur si de incredere
            unde vanatorii pot cumpara si vinde echipament, complet gratuit.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-8">
          <h2 className="text-2xl font-bold text-[#EDEDED] mb-4">
            Ce este Lagoana?
          </h2>
          <div className="space-y-4 text-[#888] leading-relaxed">
            <p>
              Lagoana este o piata online de anunturi clasificate dedicata
              echipamentului de vanatoare din Romania. Fie ca esti un vanator
              experimentat sau abia incepi, platforma noastra iti ofera acces la
              o gama larga de echipamente: arme, munitie, optica, cutite,
              echipament outdoor si multe altele.
            </p>
            <p>
              Publicarea anunturilor este complet{" "}
              <span className="text-gold font-medium">gratuita</span>. Credem ca
              accesul la o piata echitabila nu ar trebui sa coste nimic.
              Comunitatea noastra de vanatori creste in fiecare zi, oferind un
              mediu activ si de incredere pentru tranzactii.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-8">
          <h2 className="text-2xl font-bold text-[#EDEDED] mb-4">
            Misiunea noastra
          </h2>
          <div className="space-y-4 text-[#888] leading-relaxed">
            <p>
              Misiunea Lagoana este sa{" "}
              <span className="text-gold font-medium">modernizeze</span> piata
              echipamentului de vanatoare din Romania. Vrem sa oferim o platforma
              sigura, transparenta si usor de utilizat, unde vanatorii pot gasi
              exact ce au nevoie.
            </p>
            <p>
              Ne propunem sa construim un mediu de incredere, unde fiecare
              utilizator este verificat si unde tranzactiile se desfasoara in
              conditii de siguranta. Platforma respecta legislatia romaneasca in
              vigoare privind armele si munitia.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-[#EDEDED] mb-8 text-center">
          Cum functioneaza?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 text-center"
              >
                <div className="w-14 h-14 bg-[#1B3A2B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-[#EDEDED] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
