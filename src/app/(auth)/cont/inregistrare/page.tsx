"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Parolele nu se potrivesc.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Parola trebuie sa aiba cel putin 6 caractere.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Eroare la inregistrare.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Cont creat, dar autentificarea a esuat. Incearca sa te autentifici.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[50vh] sm:min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image src="/logo.png" alt="Lagoana" width={300} height={300} className="h-32 w-32" />
          </Link>
          <CardTitle className="text-xl">Creeaza cont</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">


          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tau"
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Parola</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirma parola</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeta parola"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold" disabled={loading}>
              {loading ? "Se creeaza contul..." : "Creeaza cont"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#888]">
            Ai deja cont?{" "}
            <Link href="/cont/autentificare" className="text-gold font-medium hover:underline">
              Autentifica-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
