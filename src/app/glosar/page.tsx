"use client";

import { useState, useMemo } from "react";

interface Term {
  term: string;
  definition: string;
  context?: string;
}

const GLOSSARY: Term[] = [
  {
    term: "Batai",
    definition: "Vanatoare organizata in grup, de obicei pentru mistreti sau iepuri, cu gonaci si postati.",
    context: "Bataia este una dintre cele mai populare forme de vanatoare colectiva in Romania.",
  },
  {
    term: "Calibru",
    definition: "Dimensiunea interioara a tevii unei arme de foc, exprimata in milimetri sau unitati imperiale.",
    context: "Calibrul .308 Winchester este unul dintre cele mai folosite pentru vanatul mare.",
  },
  {
    term: "Cartus",
    definition: "Munitia completa formata din tub, capsa, pulbere si proiectil (glont sau alice).",
    context: "Cartusele cu alice se folosesc la pusca lisa, iar cele cu glont la carabina.",
  },
  {
    term: "Chemare",
    definition: "Tehnica de atragere a vanatului folosind sunete specifice — manual sau cu dispozitive electronice.",
    context: "Chemarea vulpii imita sunetul unui iepure ranit.",
  },
  {
    term: "Cota de recolta",
    definition: "Numarul maxim de exemplare dintr-o specie care pot fi vanate intr-un sezon, stabilit de autoritati.",
    context: "Depasirea cotei de recolta constituie braconaj.",
  },
  {
    term: "Dibuit",
    definition: "Tehnica de vanatoare prin care vanatorul se apropie incet si silentios de vanat (stalking).",
    context: "Vanatul la dibuit necesita multa rabdare si cunoasterea terenului.",
  },
  {
    term: "Dogar",
    definition: "Caine de vanatoare dresat pentru a goni vanatul catre postati.",
    context: "Dogarii sunt esentiali in batai organizate la mistret sau iepure.",
  },
  {
    term: "Fond de vanatoare",
    definition: "Suprafata de teren administrata si gestionata pentru activitati de vanatoare.",
    context: "Fiecare fond de vanatoare are un administrator si reguli specifice.",
  },
  {
    term: "Goana",
    definition: "Forma de vanatoare colectiva in care gonacii impinge vanatul catre vanatorii asezati pe posturi.",
    context: "Goana este organizata de obicei pentru mistret, cerb sau iepure.",
  },
  {
    term: "Gonaci",
    definition: "Persoane care bat terenul pentru a dirija vanatul catre pozitiile vanatorilor (postati).",
    context: "Gonacii trebuie sa poarte veste reflectorizante pentru siguranta.",
  },
  {
    term: "Heghelet",
    definition: "Instrument care produce sunete pentru atragerea cerbilor in perioada boncaluitului.",
    context: "Hegheletul imita ragnetul cerbului mascul.",
  },
  {
    term: "Izlaz",
    definition: "Pasune sau teren deschis unde vanatul vine sa se hraneasca.",
    context: "Izlazurile sunt locuri bune pentru observarea si vanarea vanatului.",
  },
  {
    term: "La panda",
    definition: "Metoda de vanatoare statica, in care vanatorul asteapta vanatul dintr-o pozitie ascunsa.",
    context: "Vanatoarea la panda se practica frecvent pentru mistret, de obicei noaptea.",
  },
  {
    term: "Luneta",
    definition: "Dispozitiv optic de ochire montat pe carabina pentru trageri de precizie la distanta.",
    context: "O luneta de calitate este esentiala pentru vanatoarea la cerb.",
  },
  {
    term: "Observator",
    definition: "Dispozitiv optic binocular sau monocular folosit pentru observarea vanatului de la distanta.",
    context: "Observatoarele cu zoom variabil permit evaluarea trofeelor.",
  },
  {
    term: "Panda",
    definition: "Locul amenajat (observator, foiser) de unde vanatorul asteapta vanatul.",
    context: "Pandele sunt amplasate strategic langa poteci sau locuri de hranire.",
  },
  {
    term: "Permis de vanatoare",
    definition: "Document oficial care atesta dreptul unei persoane de a practica vanatoarea, obtinut dupa examen.",
    context: "Permisul de vanatoare trebuie reinoit anual si presupune plata taxelor aferente.",
  },
  {
    term: "Permis de arma",
    definition: "Autorizatie legala de detinere si port de arma de foc, eliberata de politie.",
    context: "Permisul de arma necesita examen medical, psihologic si de cunoastere a legislatiei.",
  },
  {
    term: "Post",
    definition: "Pozitia fixa atribuita unui vanator in cadrul unei batai sau goana.",
    context: "Fiecare vanator trebuie sa ramana pe postul atribuit pe toata durata batailor.",
  },
  {
    term: "Poteca de vanat",
    definition: "Drum sau traseu frecvent utilizat de animale salbatice.",
    context: "Identificarea potecilor de vanat este esentiala pentru plasarea pandelor.",
  },
  {
    term: "Rascolitor",
    definition: "Dispozitiv artificial care imita miscarea vanatului pentru a atrage alte exemplare (decoy).",
    context: "Rascoolitoarele de rate sunt folosite frecvent la vanatul de pasari acvatice.",
  },
  {
    term: "Sezon de vanatoare",
    definition: "Perioada din an in care vanarea unei anumite specii este permisa legal.",
    context: "Sezonul de vanatoare variaza in functie de specie si se stabileste prin ordin de ministru.",
  },
  {
    term: "Strangulare (Choke)",
    definition: "Ingustare la capatul tevii pustii lisa care controleaza dispersia alicelor.",
    context: "Strangularea full choke este folosita pentru trageri la distanta mare.",
  },
  {
    term: "Trofeu",
    definition: "Parte a vanatului pastrata ca amintire — coarne, colti, blana sau craniul cu coarne (CIC).",
    context: "Trofeele de cerb sunt evaluate dupa criteriile CIC.",
  },
  {
    term: "Turla",
    definition: "Constructie inalta (observator) amplasata in fondul de vanatoare pentru observare si tragere.",
    context: "Turlele ofera vizibilitate buna si unghi de tragere sigur.",
  },
  {
    term: "Vanatoare individuala",
    definition: "Partida de vanatoare practicata de un singur vanator, fara gonaci sau postati.",
    context: "Vanatoarea individuala se practica frecvent la dibuit sau la panda.",
  },
  {
    term: "Vanatoare colectiva",
    definition: "Forma de vanatoare organizata cu mai multi participanti, incluzand batai si goana.",
    context: "Vanatoarea colectiva necesita un organizator si respectarea stricta a regulilor de siguranta.",
  },
  {
    term: "Vanatoare selectiva",
    definition: "Recoltarea controlata a exemplarelor selectate (batrane, bolnave) pentru gestionarea populatiei.",
    context: "Vanatoarea selectiva este importanta pentru mentinerea sanatatii populatiei de vanat.",
  },
  {
    term: "Vanator postac",
    definition: "Vanatorul care ocupa un post fix in cadrul batailor, asteptand vanatul gonit.",
    context: "Vanatorii postaci nu au voie sa paraseasca postul fara semnalul de incetare.",
  },
  {
    term: "Vizare",
    definition: "Actiunea de a ochii tinta prin intermediul dispozitivelor de vizare (luneta, deschise).",
    context: "Vizarea corecta presupune alinierea reticului lunetei cu punctul vital al vanatului.",
  },
  {
    term: "Zona de liniste",
    definition: "Suprafata din fondul de vanatoare unde vanatul nu este deranjat, pentru refacerea populatiei.",
    context: "Zonele de liniste asigura un refugiu sigur pentru vanat in perioadele de vanatoare.",
  },
  {
    term: "Boncaluit",
    definition: "Perioada de imperechere a cerbilor, caracterizata prin ragnetul puternic al masculilor.",
    context: "Boncaluitul are loc in septembrie-octombrie si este momentul ideal pentru vanatul de cerb mascul.",
  },
  {
    term: "Bresa",
    definition: "Deschidere sau trecatoare in padure sau vegetatie pe unde trece vanatul.",
    context: "Bresele sunt locuri strategice pentru amplasarea posturilor de vanatoare.",
  },
  {
    term: "Ciocaneala",
    definition: "Zgomotul produs de cerbii masculi cand isi incruciaza coarnele in lupte teritoriale.",
    context: "Ciocaneala poate fi auzita la distanta si indica prezenta unor masculi puternici.",
  },
  {
    term: "Hartuire",
    definition: "Deranjarea intentionata a vanatului in zone protejate sau in afara sezonului. Este ilegala.",
    context: "Hartuirea faunei salbatice este sanctionata conform legii vanatorii.",
  },
  {
    term: "Prelucrare trofeu",
    definition: "Procesul de curatare, fierbere si albire a craniului si coarnelor pentru montare si evaluare.",
    context: "Prelucrarea corecta a trofeului este importanta pentru evaluarea CIC.",
  },
];

export default function GlosarPage() {
  const [search, setSearch] = useState("");

  const filteredTerms = useMemo(() => {
    const sorted = [...GLOSSARY].sort((a, b) =>
      a.term.localeCompare(b.term, "ro")
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase().trim();
    return sorted.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [search]);

  const letters = useMemo(() => {
    const all = new Set(filteredTerms.map((t) => t.term[0].toUpperCase()));
    return Array.from(all).sort((a, b) => a.localeCompare(b, "ro"));
  }, [filteredTerms]);

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#EDEDED]">
            Glosar de <span className="text-[#C8A962]">Vanatoare</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Terminologie romaneasca de vanatoare — definitii si explicatii
            pentru termenii cei mai folositi.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cauta un termen..."
            className="w-full h-12 rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 text-[#EDEDED] placeholder:text-[#555] focus:outline-none focus:border-[#C8A962] transition text-sm"
          />
        </div>

        {/* Letter navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#2A2A2A] text-sm text-[#888] hover:text-[#C8A962] hover:border-[#C8A962] transition"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-[#888] mb-6">
          {filteredTerms.length} {filteredTerms.length === 1 ? "termen" : "termeni"} {search && "gasiti"}
        </p>

        {/* Terms grouped by letter */}
        {letters.map((letter) => {
          const termsForLetter = filteredTerms.filter(
            (t) => t.term[0].toUpperCase() === letter
          );
          return (
            <div key={letter} id={`letter-${letter}`} className="mb-8">
              <h2 className="text-2xl font-bold text-[#C8A962] mb-4 border-b border-[#2A2A2A] pb-2">
                {letter}
              </h2>
              <div className="space-y-4">
                {termsForLetter.map((item) => (
                  <div
                    key={item.term}
                    className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C8A962]/30 transition"
                  >
                    <h3 className="text-lg font-semibold text-[#EDEDED] mb-2">
                      {item.term}
                    </h3>
                    <p className="text-sm text-[#AAAAAA] leading-relaxed">
                      {item.definition}
                    </p>
                    {item.context && (
                      <p className="text-xs text-[#666] mt-2 italic">
                        {item.context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#888] text-lg">
              Niciun termen gasit pentru &ldquo;{search}&rdquo;
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-[#C8A962] hover:underline text-sm"
            >
              Sterge cautarea
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
