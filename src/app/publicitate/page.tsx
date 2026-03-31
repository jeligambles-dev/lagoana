"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Megaphone,
  Target,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  Monitor,
  Check,
  Send,
  Image as ImageIcon,
  Clock,
  BarChart3,
} from "lucide-react";

const pricingTiers = [
  {
    name: "Saptamanal",
    duration: "1 saptamana",
    price: 149,
    description: "Ideal pentru promovari rapide si evenimente.",
    features: [
      "Banner pe pagina principala",
      "Vizibil pe toate dispozitivele",
      "Raport de performanta la final",
      "1 modificare de banner inclusa",
    ],
    popular: false,
  },
  {
    name: "Lunar",
    duration: "1 luna",
    price: 449,
    description: "Cel mai popular. Expunere constanta timp de 30 de zile.",
    features: [
      "Banner pe pagina principala",
      "Vizibil pe toate dispozitivele",
      "Raport saptamanal de performanta",
      "3 modificari de banner incluse",
      "Prioritate in rotatie",
      "Mentiune in newsletter",
    ],
    popular: true,
  },
  {
    name: "Trimestrial",
    duration: "3 luni",
    price: 999,
    description: "Cel mai bun raport calitate-pret. Economisesti 30%.",
    features: [
      "Banner pe pagina principala",
      "Vizibil pe toate dispozitivele",
      "Raport saptamanal de performanta",
      "Modificari nelimitate de banner",
      "Prioritate maxima in rotatie",
      "Mentiune in newsletter",
      "Banner dedicat in email-uri",
      "Postare pe social media",
    ],
    popular: false,
  },
];

const stats = [
  { icon: Users, label: "Utilizatori activi", value: "5,000+" },
  { icon: Eye, label: "Vizualizari lunare", value: "50,000+" },
  { icon: MousePointerClick, label: "Click-uri pe bannere", value: "2,500+" },
  { icon: BarChart3, label: "Rata de conversie", value: "4.8%" },
];

const benefits = [
  {
    icon: Target,
    title: "Audienta tintita",
    description:
      "Ajungi direct la vanatori activi din Romania care cauta echipament si accesorii.",
  },
  {
    icon: TrendingUp,
    title: "Cresterea vanzarilor",
    description:
      "Promoveaza-ti produsele si serviciile in fata unei comunitati pasionate si implicate.",
  },
  {
    icon: Monitor,
    title: "Vizibilitate maxima",
    description:
      "Bannerul tau apare pe pagina principala, vizibil pe desktop, tableta si mobil.",
  },
  {
    icon: Megaphone,
    title: "Brand awareness",
    description:
      "Construieste-ti notorietatea brandului in cea mai mare comunitate de vanatori online.",
  },
];

export default function PublicitatePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    tier: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: "Cerere publicitate",
          message: `Companie: ${form.company}\nTelefon: ${form.phone}\nPachet dorit: ${form.tier}\n\n${form.message}`,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        tier: "",
        message: "",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A2B]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#1B3A2B]/30 border border-[#2A2A2A] rounded-full px-4 py-1.5 mb-6">
              <Megaphone className="h-4 w-4 text-gold" />
              <span className="text-sm text-gold font-medium">
                Publicitate pe Lagoana.ro
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#EDEDED] mb-6 leading-tight">
              Promoveaza-ti afacerea in fata
              <span className="text-gold"> comunitatii de vanatori</span>
            </h1>
            <p className="text-lg text-[#888] mb-8 leading-relaxed">
              Lagoana.ro este cea mai activa piata online de echipament de
              vanatoare din Romania. Plaseaza un banner publicitar si ajungi
              direct la mii de vanatori pasionati care cauta exact ce oferi tu.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 text-center"
            >
              <div className="w-10 h-10 bg-[#1B3A2B] rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#EDEDED] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[#888]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EDEDED] mb-3">
            Pachete de publicitate
          </h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Alege pachetul potrivit pentru afacerea ta. Toate preturile includ
            TVA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-[#111111] rounded-xl border p-6 sm:p-8 flex flex-col ${
                tier.popular
                  ? "border-gold ring-1 ring-gold/20"
                  : "border-[#2A2A2A]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gold text-[#0B0B0B] text-xs font-bold px-3 py-1 rounded-full">
                    Cel mai popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="text-sm text-gold font-medium">
                    {tier.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#EDEDED] mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-[#888]">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#EDEDED]">
                  {tier.price}
                </span>
                <span className="text-[#888] ml-1">RON</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm text-[#AAAAAA]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  setForm((f) => ({ ...f, tier: tier.name }));
                  document
                    .getElementById("contact-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full h-10 font-semibold ${
                  tier.popular
                    ? "bg-gold text-[#0B0B0B] hover:bg-gold-light"
                    : "bg-[#1E1E1E] text-[#EDEDED] border border-[#2A2A2A] hover:border-gold hover:text-gold"
                }`}
              >
                Solicita oferta
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EDEDED] mb-3">
            De ce sa faci publicitate pe Lagoana?
          </h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Ajungi exact la publicul potrivit, fara risipa de buget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 flex gap-4"
            >
              <div className="w-10 h-10 bg-[#1B3A2B] rounded-full flex items-center justify-center shrink-0">
                <benefit.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-[#EDEDED] mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Specs Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1B3A2B] rounded-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-gold" />
            </div>
            <h2 className="text-xl font-bold text-[#EDEDED]">
              Specificatii banner
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Dimensiune</p>
              <p className="text-[#EDEDED] font-medium">1920 x 640 px</p>
            </div>
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Format</p>
              <p className="text-[#EDEDED] font-medium">JPG, PNG sau WebP</p>
            </div>
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Dimensiune maxima</p>
              <p className="text-[#EDEDED] font-medium">500 KB</p>
            </div>
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Aspect ratio</p>
              <p className="text-[#EDEDED] font-medium">3:1</p>
            </div>
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Link destinatie</p>
              <p className="text-[#EDEDED] font-medium">URL extern sau intern</p>
            </div>
            <div className="bg-[#0B0B0B] rounded-lg p-4 border border-[#2A2A2A]">
              <p className="text-sm text-[#888] mb-1">Pozitie</p>
              <p className="text-[#EDEDED] font-medium">
                Header pagina principala
              </p>
            </div>
          </div>

          <p className="text-sm text-[#666] mt-4">
            Nu ai un banner gata? Echipa noastra te poate ajuta cu design-ul
            gratuit pentru pachetele lunare si trimestriale.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="max-w-3xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EDEDED] mb-3">
            Solicita o oferta
          </h2>
          <p className="text-[#888]">
            Completeaza formularul si te contactam in maxim 24 de ore.
          </p>
        </div>

        <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Nume complet
                </label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Numele tau"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="email@companie.ro"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Companie
                </label>
                <Input
                  id="company"
                  required
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                  placeholder="Numele companiei"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Telefon
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="07xx xxx xxx"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tier"
                className="block text-sm text-[#888] mb-1.5"
              >
                Pachet dorit
              </label>
              <select
                id="tier"
                value={form.tier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tier: e.target.value }))
                }
                className="w-full h-10 rounded-md bg-[#1E1E1E] text-[#EDEDED] border border-[#2A2A2A] focus:border-gold px-3 text-sm outline-none"
              >
                <option value="">Selecteaza un pachet</option>
                <option value="Saptamanal">Saptamanal - 149 RON</option>
                <option value="Lunar">Lunar - 449 RON</option>
                <option value="Trimestrial">Trimestrial - 999 RON</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm text-[#888] mb-1.5"
              >
                Mesaj (optional)
              </label>
              <Textarea
                id="message"
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Spune-ne mai multe despre afacerea ta si ce doresti sa promovezi..."
                className="bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555] resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold h-10 px-6"
            >
              {status === "loading" ? (
                "Se trimite..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Trimite cererea
                </>
              )}
            </Button>

            {status === "success" && (
              <p className="text-green-500 text-sm">
                Cererea a fost trimisa cu succes! Te vom contacta in cel mai
                scurt timp.
              </p>
            )}

            {status === "error" && (
              <p className="text-red-500 text-sm">
                A aparut o eroare. Te rugam sa incerci din nou sau sa ne
                contactezi direct la contact@lagoana.ro.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
