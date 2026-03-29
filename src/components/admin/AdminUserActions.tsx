"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Ban, RotateCcw, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  status: string;
  role: string;
}

export function AdminUserActions({ userId, status, role }: Props) {
  const router = useRouter();

  async function handleAction(action: string) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });

    if (res.ok) {
      toast.success("Actiune efectuata.");
      router.refresh();
    } else {
      toast.error("Eroare.");
    }
  }

  if (role === "ADMIN") return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("resetPassword")}
        title="Resetare parola"
      >
        <KeyRound className="h-3 w-3" />
      </Button>
      {status === "ACTIVE" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Suspendezi acest utilizator?")) handleAction("suspend");
          }}
          className="text-amber-600"
          title="Suspenda"
        >
          <Ban className="h-3 w-3" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("activate")}
          title="Activeaza"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
