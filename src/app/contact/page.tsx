"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED] mb-8">
        Contact
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#EDEDED] mb-6">
              Trimite-ne un mesaj
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Nume
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
                  placeholder="email@exemplu.ro"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Subiect
                </label>
                <Input
                  id="subject"
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  placeholder="Subiectul mesajului"
                  className="h-10 bg-[#1E1E1E] text-[#EDEDED] border-[#2A2A2A] focus:border-gold placeholder:text-[#555]"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm text-[#888] mb-1.5"
                >
                  Mesaj
                </label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Scrie mesajul tau aici..."
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
                    Trimite mesaj
                  </>
                )}
              </Button>

              {status === "success" && (
                <p className="text-green-500 text-sm">
                  Mesajul a fost trimis cu succes. Iti vom raspunde cat mai
                  curand posibil.
                </p>
              )}

              {status === "error" && (
                <p className="text-red-500 text-sm">
                  A aparut o eroare. Te rugam sa incerci din nou.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6">
            <h2 className="text-lg font-semibold text-[#EDEDED] mb-4">
              Informatii de contact
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1B3A2B] rounded-full flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm text-[#888] mb-1">Email</p>
                <a
                  href="mailto:contact@lagoana.ro"
                  className="text-gold hover:underline text-sm"
                >
                  contact@lagoana.ro
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
