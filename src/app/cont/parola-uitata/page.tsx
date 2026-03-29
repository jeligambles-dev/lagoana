"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("A aparut o eroare. Incearca din nou.");
      }

      setSent(true);
    } catch {
      setError("A aparut o eroare. Incearca din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image src="/logo.png" alt="Lagoana" width={96} height={96} className="h-24 w-24" />
          </Link>
          <CardTitle className="text-xl">Resetare parola</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-[#EDEDED]">
                Daca exista un cont cu acest email, vei primi un link de resetare.
              </p>
              <Link
                href="/cont/autentificare"
                className="text-gold font-medium hover:underline text-sm"
              >
                Inapoi la autentificare
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
                disabled={loading}
              >
                {loading ? "Se trimite..." : "Trimite link de resetare"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-[#888]">
            <Link href="/cont/autentificare" className="text-gold font-medium hover:underline">
              Inapoi la autentificare
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
