"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PendingUser {
  id: string;
  name: string | null;
  email: string;
  idDocumentUrl: string | null;
  createdAt: string;
}

export function AdminIdVerifications() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  async function loadPending() {
    try {
      const res = await fetch("/api/admin/verify-id");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleAction(userId: string, action: "approve" | "reject") {
    setProcessing(userId);
    try {
      const res = await fetch("/api/admin/verify-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast.error(data.error || "Eroare.");
      }
    } catch {
      toast.error("Eroare de retea.");
    }
    setProcessing(null);
  }

  if (loading) return null;
  if (users.length === 0) return null;

  return (
    <Card className="bg-[#111111] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Verificari de identitate in asteptare
          <Badge className="bg-yellow-900/40 text-yellow-400 border-0 ml-2">
            {users.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg bg-[#0B0B0B] border border-[#2A2A2A]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#EDEDED]">
                  {user.name || "Fara nume"}
                </p>
                <p className="text-xs text-[#888]">{user.email}</p>
                {user.idDocumentUrl && (
                  <a
                    href={user.idDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Vezi documentul
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleAction(user.id, "approve")}
                  disabled={processing === user.id}
                  className="bg-green-800/50 hover:bg-green-800/80 text-green-300 border-0 text-xs"
                >
                  {processing === user.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Aproba
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(user.id, "reject")}
                  disabled={processing === user.id}
                  className="bg-red-800/50 hover:bg-red-800/80 text-red-300 border-0 text-xs"
                >
                  {processing === user.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  Respinge
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
