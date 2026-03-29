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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email sau parola incorecta.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image src="/logo.png" alt="Lagoana" width={300} height={300} className="h-32 w-32" />
          </Link>
          <CardTitle className="text-xl">Autentificare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">


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
            <div className="space-y-2">
              <Label htmlFor="password">Parola</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introdu parola"
                required
              />
            </div>
            <div className="text-right">
              <Link href="/cont/parola-uitata" className="text-sm text-gold hover:underline">
                Ai uitat parola?
              </Link>
            </div>
            <Button type="submit" className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold" disabled={loading}>
              {loading ? "Se incarca..." : "Autentificare"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#888]">
            Nu ai cont?{" "}
            <Link href="/cont/inregistrare" className="text-gold font-medium hover:underline">
              Inregistreaza-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
