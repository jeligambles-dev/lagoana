"use client";

import { useState } from "react";
import type { Metadata } from "next";

const MONTHS = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Season {
  species: string;
  emoji: string;
  variants: { label: string; start: number; end: number }[];
  note?: string;
}

const SEASONS: Season[] = [
  {
    species: "Cerb (Red deer)",
    emoji: "🦌",
    variants: [
      { label: "Mascul", start: 9, end: 12 },
      { label: "Femela", start: 10, end: 1 },
    ],
  },
  {
    species: "Caprioara (Roe deer)",
    emoji: "🦌",
    variants: [
      { label: "Mascul", start: 5, end: 10 },
      { label: "Femela", start: 9, end: 1 },
    ],
  },
  {
    species: "Mistret (Wild boar)",
    emoji: "🐗",
    variants: [{ label: "Ambele sexe", start: 8, end: 2 }],
  },
  {
    species: "Iepure (Hare)",
    emoji: "🐇",
    variants: [{ label: "Ambele sexe", start: 11, end: 1 }],
  },
  {
    species: "Fazan (Pheasant)",
    emoji: "🐦",
    variants: [{ label: "Ambele sexe", start: 10, end: 2 }],
  },
  {
    species: "Rata salbatica (Wild duck)",
    emoji: "🦆",
    variants: [{ label: "Ambele sexe", start: 8, end: 2 }],
  },
  {
    species: "Gaste salbatice (Wild geese)",
    emoji: "🪿",
    variants: [{ label: "Ambele sexe", start: 9, end: 1 }],
  },
  {
    species: "Vulpe (Fox)",
    emoji: "🦊",
    variants: [{ label: "Ambele sexe", start: 9, end: 3 }],
  },
  {
    species: "Lup (Wolf)",
    emoji: "🐺",
    variants: [],
    note: "Specie protejata in majoritatea zonelor",
  },
  {
    species: "Urs (Bear)",
    emoji: "🐻",
    variants: [],
    note: "Doar prin derogare speciala",
  },
];

function isMonthInSeason(month: number, start: number, end: number): boolean {
  if (start <= end) {
    return month >= start && month <= end;
  }
  return month >= start || month <= end;
}

function getSeasonDescription(start: number, end: number): string {
  const monthNames = [
    "",
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  return `${monthNames[start]} - ${monthNames[end]}`;
}

export default function CalendarVanatoarePage() {
  const currentMonth = new Date().getMonth() + 1;
  const [showCards, setShowCards] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A2B] via-[#0F2019] to-[#0B0B0B]">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#EDEDED]">
            Calendar de <span className="text-[#C8A962]">Vanatoare</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Sezoanele de vanatoare din Romania — verifica perioadele legale de
            vanatoare pentru fiecare specie.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Toggle for mobile */}
        <div className="flex justify-end mb-6 md:hidden">
          <button
            onClick={() => setShowCards(!showCards)}
            className="px-4 py-2 text-sm rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#EDEDED] hover:border-[#C8A962] transition"
          >
            {showCards ? "Arata tabel" : "Arata carduri"}
          </button>
        </div>

        {/* Desktop: Timeline grid */}
        <div className={`${showCards ? "hidden" : "block"} overflow-x-auto`}>
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-[#EDEDED] p-3 border-b border-[#2A2A2A] min-w-[200px]">
                  Specie
                </th>
                {MONTHS.map((m, i) => (
                  <th
                    key={m}
                    className={`text-center text-xs font-medium p-2 border-b border-[#2A2A2A] w-[60px] ${
                      i + 1 === currentMonth
                        ? "text-[#C8A962] bg-[#C8A962]/10"
                        : "text-[#888]"
                    }`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEASONS.map((season) => (
                <>
                  {season.variants.length > 0 ? (
                    season.variants.map((variant, vi) => (
                      <tr
                        key={`${season.species}-${vi}`}
                        className="border-b border-[#1A1A1A] hover:bg-[#111111] transition"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{season.emoji}</span>
                            <div>
                              <span className="text-sm text-[#EDEDED]">
                                {vi === 0 ? season.species : ""}
                              </span>
                              <span className="text-xs text-[#888] ml-2">
                                ({variant.label})
                              </span>
                            </div>
                          </div>
                        </td>
                        {MONTHS.map((_, mi) => {
                          const month = mi + 1;
                          const open = isMonthInSeason(
                            month,
                            variant.start,
                            variant.end
                          );
                          return (
                            <td
                              key={mi}
                              className={`text-center p-1 ${
                                month === currentMonth
                                  ? "bg-[#C8A962]/5"
                                  : ""
                              }`}
                            >
                              <div
                                className={`h-6 rounded ${
                                  open
                                    ? "bg-green-600/80"
                                    : "bg-red-900/30"
                                }`}
                                title={
                                  open
                                    ? `Sezon deschis - ${variant.label}`
                                    : "Sezon inchis"
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr
                      key={season.species}
                      className="border-b border-[#1A1A1A] hover:bg-[#111111] transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{season.emoji}</span>
                          <span className="text-sm text-[#EDEDED]">
                            {season.species}
                          </span>
                        </div>
                      </td>
                      {MONTHS.map((_, mi) => (
                        <td
                          key={mi}
                          className={`text-center p-1 ${
                            mi + 1 === currentMonth ? "bg-[#C8A962]/5" : ""
                          }`}
                        >
                          <div
                            className="h-6 rounded bg-red-900/30"
                            title="Sezon inchis"
                          />
                        </td>
                      ))}
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card layout */}
        <div className={`${showCards ? "block" : "hidden"} md:hidden space-y-4`}>
          {SEASONS.map((season) => (
            <div
              key={season.species}
              className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{season.emoji}</span>
                <h3 className="text-[#EDEDED] font-semibold">
                  {season.species}
                </h3>
              </div>
              {season.note ? (
                <p className="text-sm text-red-400 italic">{season.note}</p>
              ) : (
                <div className="space-y-2">
                  {season.variants.map((variant, vi) => {
                    const open = isMonthInSeason(
                      currentMonth,
                      variant.start,
                      variant.end
                    );
                    return (
                      <div key={vi} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-[#888]">
                            {variant.label}:
                          </span>
                          <span className="text-sm text-[#EDEDED] ml-2">
                            {getSeasonDescription(variant.start, variant.end)}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            open
                              ? "bg-green-600/20 text-green-400"
                              : "bg-red-900/20 text-red-400"
                          }`}
                        >
                          {open ? "Deschis" : "Inchis"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#888]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-green-600/80" />
            <span>Sezon deschis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-red-900/30" />
            <span>Sezon inchis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-[#C8A962]/10 border border-[#C8A962]/30" />
            <span>Luna curenta</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-12 bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#EDEDED] mb-4">
            Informatii importante
          </h2>
          <ul className="space-y-2 text-sm text-[#888] list-disc list-inside">
            <li>
              Perioadele de vanatoare pot varia in functie de judet si de
              reglementarile locale ale AJVPS.
            </li>
            <li>
              Vanarea ursului si a lupului este strict reglementata si necesita
              derogari speciale emise de autoritati.
            </li>
            <li>
              Verificati intotdeauna ordinul ministrului in vigoare inainte de a
              planifica o partida de vanatoare.
            </li>
            <li>
              Cotele de recolta sunt stabilite anual si pot influenta
              disponibilitatea vanatorii.
            </li>
            <li>
              Este obligatoriu sa detineti permis de vanatoare valabil si
              autorizatie de vanatoare pentru zona respectiva.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
