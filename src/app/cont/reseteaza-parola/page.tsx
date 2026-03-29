"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    if (password.length < 6) {
      setError("Parola trebuie sa aiba cel putin 6 caractere.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "A aparut o eroare.");
      }

      router.push("/cont/autentificare");
    } catch (err) {
      setError(err instanceof Error ? err.message : "A aparut o eroare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">Parola noua</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introdu parola noua"
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
          placeholder="Confirma parola noua"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
        disabled={loading}
      >
        {loading ? "Se reseteaza..." : "Reseteaza parola"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image src="/logo.png" alt="Lagoana" width={96} height={96} className="h-24 w-24" />
          </Link>
          <CardTitle className="text-xl">Reseteaza parola</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div className="text-center text-[#888]">Se incarca...</div>}>
            <ResetPasswordForm />
          </Suspense>
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
