import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ghid Echipament de Vanatoare - Recomandari pe Tipuri de Vanatoare",
  description:
    "Ghid complet de echipament de vanatoare: arme, optica, imbracaminte si accesorii recomandate pentru vanatoarea la cerb, mistret, pasari si vulpe.",
  keywords: [
    "echipament vanatoare",
    "ghid vanatoare",
    "arme vanatoare",
    "optica vanatoare",
    "imbracaminte vanatoare",
  ],
};

interface EquipmentItem {
  name: string;
  description: string;
  link?: string;
}

interface Guide {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: EquipmentItem[];
  tips: string[];
}

const GUIDES: Guide[] = [
  {
    id: "cerb",
    icon: "🦌",
    title: "Vanatoare la cerb",
    description:
      "Vanarea cerbului necesita echipament de precizie la distante medii si lungi. Rabdarea si echipamentul adecvat fac diferenta.",
    items: [
      {
        name: "Carabina calibru .308 Win / .30-06 / 7mm Rem Mag",
        description:
          "Calibre potrivite pentru cerb, cu energie suficienta la distante de 200-300m.",
        link: "/anunturi?category=arme-de-foc",
      },
      {
        name: "Luneta 3-12x56 sau 4-16x50",
        description:
          "Optica cu diametru mare al obiectivului pentru lumina buna in zori si amurg.",
        link: "/anunturi?category=optica",
      },
      {
        name: "Bipod sau bastoane de tragere",
        description:
          "Esentiale pentru stabilitate la trageri de precizie pe distante lungi.",
        link: "/anunturi?category=accesorii-arme",
      },
      {
        name: "Imbracaminte termica si impermeabila",
        description:
          "Sezonul de cerb este in lunile reci — haine calduroase si silentioase sunt obligatorii.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Binoclu 8x42 sau 10x42",
        description:
          "Pentru observarea si evaluarea trofeelor de la distanta.",
        link: "/anunturi?category=optica",
      },
    ],
    tips: [
      "Antrenati-va tragerea pe distante de 200m+ inainte de sezon.",
      "Folositi munitie premium cu expansiune controlata (Nosler, RWS, Hornady).",
      "Sositi la locul de vanatoare cu cel putin 30 de minute inainte de zori.",
      "Portati intotdeauna un cutit de vanatoare bun pentru prelucrarea trofeului.",
    ],
  },
  {
    id: "mistret",
    icon: "🐗",
    title: "Vanatoare la mistret",
    description:
      "Mistretul este un vanat robust care necesita arme cu calibru adecvat si echipament pentru conditii de noapte sau vizibilitate redusa.",
    items: [
      {
        name: "Carabina calibru .308 Win / .30-06 / 8x57 IS",
        description:
          "Calibre cu putere de oprire buna. Semiautomatele sunt populare la goana.",
        link: "/anunturi?category=arme-de-foc",
      },
      {
        name: "Dispozitiv de ochire nocturna sau termoviziune",
        description:
          "Esential pentru vanatoarea de noapte la panda, acolo unde este legal.",
        link: "/anunturi?category=optica",
      },
      {
        name: "Lanterna cu lumina rosie sau verde",
        description:
          "Pentru deplasare si identificare fara a speria vanatul.",
        link: "/anunturi?category=accesorii-arme",
      },
      {
        name: "Cizme cauciucate inalte",
        description:
          "Mistretul traieste in zone umede — cizmele impermeabile sunt esentiale.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Cutit de vanatoare robust",
        description:
          "Necesar pentru eviscerare si prelucrarea vanatului in teren.",
        link: "/anunturi?category=echipament",
      },
    ],
    tips: [
      "La goana, folositi munitie cu greutate mare (11-13g) pentru efect de oprire.",
      "Nu subestimati un mistret ranit — poate fi extrem de periculos.",
      "Verificati legile locale privind echipamentul de night vision inainte de utilizare.",
      "Portati haine rezistente la spini pentru deplasarea prin padure.",
    ],
  },
  {
    id: "pasari",
    icon: "🦆",
    title: "Vanatoare la pasari",
    description:
      "Vanarea pasarilor necesita arme de alice, reflexe bune si echipament specific fiecarei specii — rate, fazani sau gaste.",
    items: [
      {
        name: "Pusca lisa calibru 12 (semiautomata sau basculanta)",
        description:
          "Calibrul 12 este cel mai versatil pentru toate tipurile de pasari.",
        link: "/anunturi?category=arme-de-foc",
      },
      {
        name: "Cartuse alice nr. 4-7 (in functie de specie)",
        description:
          "Alice mici pentru fazan, alice mai mari pentru gaste si rate.",
        link: "/anunturi?category=munitie",
      },
      {
        name: "Rascolitoare si chematori",
        description:
          "Esentiale pentru atragerea ratelor si gastelor salbatice.",
        link: "/anunturi?category=accesorii-arme",
      },
      {
        name: "Vesta de vanatoare cu buzunare pentru cartuse",
        description:
          "Acces rapid la munitie si depozitare pentru vanatul recoltat.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Cizme de balta (waders)",
        description:
          "Necesare la vanatul de rate in zone mlastinoase sau lacuri.",
        link: "/anunturi?category=echipament",
      },
    ],
    tips: [
      "Antrenati-va pe platoul de tir pentru a va imbunatati reflexele.",
      "Folositi strangulari (choke) adaptate distantei de tragere.",
      "Camuflajul este esential — pasarile au o vedere excelenta.",
      "Respectati cotele de recolta si identificati corect specia inainte de tragere.",
    ],
  },
  {
    id: "vulpe",
    icon: "🦊",
    title: "Vanatoare la vulpe",
    description:
      "Vulpea este un animal inteligent si precaut. Vanarea ei necesita rabdare, camuflaj si echipament de precizie.",
    items: [
      {
        name: "Carabina calibru .222 Rem / .223 Rem / .22-250",
        description:
          "Calibre mici si rapide, ideale pentru vanatul de blana.",
        link: "/anunturi?category=arme-de-foc",
      },
      {
        name: "Luneta cu reticul iluminat 3-9x40",
        description:
          "Pentru trageri precise in conditii de lumina redusa.",
        link: "/anunturi?category=optica",
      },
      {
        name: "Chemator de vulpe (manual sau electronic)",
        description:
          "Imitatii de iepure ranit sau alte sunete pentru atragerea vulpii.",
        link: "/anunturi?category=accesorii-arme",
      },
      {
        name: "Costum ghillie sau camuflaj alb (iarna)",
        description:
          "Camuflajul complet este esential — vulpea are simturi ascutite.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Perna de sedere izolata",
        description:
          "Comfort esential pentru asteptarea indelungata la panda.",
        link: "/anunturi?category=echipament",
      },
    ],
    tips: [
      "Veniti contra vantului — vulpea are un miros exceptional.",
      "Ramaneti complet nemiscati dupa ce ati activat chematorul.",
      "Sesiunile de chemat sa dureze 15-20 de minute, cu pauze intre sunete.",
      "Alegeti pozitii cu vizibilitate buna pe 180 de grade.",
    ],
  },
  {
    id: "general",
    icon: "🎒",
    title: "Echipament general",
    description:
      "Indiferent de tipul de vanatoare, exista echipament de baza pe care fiecare vanator ar trebui sa il aiba.",
    items: [
      {
        name: "Cizme de vanatoare impermeabile",
        description:
          "Cizme confortabile, impermeabile, cu talpa aderenta pentru orice teren.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Rucsac de vanatoare 25-45L",
        description:
          "Pentru transport echipament, apa, mancare si eventualul vanat mic.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Cutit de vanatoare multifunctional",
        description:
          "Un cutit bun este unealta cea mai importanta dupa arma.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "GPS sau telefon cu harti offline",
        description:
          "Esential pentru navigarea in fondurile de vanatoare necunoscute.",
        link: "/anunturi?category=accesorii-arme",
      },
      {
        name: "Trusa de prim ajutor",
        description:
          "Obligatorie in orice expeditie de vanatoare. Include si un turnichet.",
        link: "/anunturi?category=echipament",
      },
      {
        name: "Lanterna frontala cu lumina rosie",
        description:
          "Pentru deplasarea in intuneric fara a deranja vanatul.",
        link: "/anunturi?category=accesorii-arme",
      },
    ],
    tips: [
      "Investiti in cizme de calitate — picioarele va multumesc dupa ore de mers.",
      "Aveti intotdeauna apa si o gustare energizanta in rucsac.",
      "Verificati-va echipamentul complet cu o zi inainte de vanatoare.",
      "Pastrati un kit de curatare a armei in masina sau rucsac.",
    ],
  },
];

export default function GhidEchipamentPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#EDEDED]">
            Ghid de <span className="text-[#C8A962]">Echipament</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Recomandari de echipament pentru fiecare tip de vanatoare — arme,
            optica, imbracaminte si accesorii.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {GUIDES.map((guide) => (
          <div
            key={guide.id}
            id={guide.id}
            className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden"
          >
            {/* Guide header */}
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{guide.icon}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EDEDED]">
                  {guide.title}
                </h2>
              </div>
              <p className="text-[#888] text-sm leading-relaxed">
                {guide.description}
              </p>
            </div>

            {/* Recommended items */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-[#C8A962] uppercase tracking-wider mb-4">
                Echipament recomandat
              </h3>
              <div className="space-y-4">
                {guide.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[#EDEDED]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#888] mt-1">
                        {item.description}
                      </p>
                    </div>
                    {item.link && (
                      <Link
                        href={item.link}
                        className="text-xs text-[#C8A962] hover:underline whitespace-nowrap shrink-0"
                      >
                        Cauta anunturi →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 bg-[#0D0D0D] border-t border-[#2A2A2A]">
              <h3 className="text-sm font-semibold text-[#C8A962] uppercase tracking-wider mb-3">
                Sfaturi
              </h3>
              <ul className="space-y-2">
                {guide.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-[#888] flex items-start gap-2"
                  >
                    <span className="text-[#C8A962] mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Quick navigation */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#EDEDED] mb-4">
            Navigare rapida
          </h3>
          <div className="flex flex-wrap gap-3">
            {GUIDES.map((guide) => (
              <a
                key={guide.id}
                href={`#${guide.id}`}
                className="px-4 py-2 text-sm rounded-lg border border-[#2A2A2A] text-[#888] hover:text-[#C8A962] hover:border-[#C8A962] transition"
              >
                {guide.icon} {guide.title}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
