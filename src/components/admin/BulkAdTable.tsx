"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminAdActions } from "@/components/admin/AdminAdActions";
import { CheckSquare, Square, Trash2, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Ad {
  id: string;
  title: string;
  price: number | null;
  status: string;
  user: { name: string | null; email: string };
  category: { name: string };
}

interface BulkAdTableProps {
  ads: Ad[];
}

export function BulkAdTable({ ads }: BulkAdTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    label: string;
  } | null>(null);

  const allSelected = ads.length > 0 && selected.size === ads.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ads.map((a) => a.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function executeBulk(action: string) {
    setLoading(true);
    setConfirmAction(null);
    try {
      const res = await fetch("/api/admin/ads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adIds: Array.from(selected), action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Actiune executata cu succes: ${data.affected} anunturi afectate.`);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(data.error || "Eroare la executarea actiunii.");
      }
    } catch {
      toast.error("Eroare de retea.");
    } finally {
      setLoading(false);
    }
  }

  function requestBulk(action: string, label: string) {
    setConfirmAction({ action, label });
  }

  return (
    <div className="space-y-3">
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#C8A951]/30 rounded-lg">
          <span className="text-sm text-[#C8A951] font-medium">
            {selected.size} anunturi selectate
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => requestBulk("approve", "Aproba")}
              className="text-green-500 border-green-800 hover:bg-green-900/30"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Aproba
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => requestBulk("remove", "Sterge (REMOVED)")}
              className="text-amber-500 border-amber-800 hover:bg-amber-900/30"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Sterge
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => requestBulk("delete", "Elimina permanent")}
              className="text-red-500 border-red-800 hover:bg-red-900/30"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Elimina permanent
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-[#EDEDED] font-bold text-lg">Confirmare actiune</h3>
            <p className="text-[#888] text-sm">
              Esti sigur ca vrei sa aplici actiunea{" "}
              <span className="text-[#C8A951] font-medium">&quot;{confirmAction.label}&quot;</span>{" "}
              pe <span className="text-[#EDEDED] font-medium">{selected.size}</span> anunturi?
            </p>
            {confirmAction.action === "delete" && (
              <p className="text-red-500 text-sm font-medium">
                Aceasta actiune este ireversibila! Anunturile vor fi sterse definitiv.
              </p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
              >
                Anuleaza
              </Button>
              <Button
                size="sm"
                disabled={loading}
                onClick={() => executeBulk(confirmAction.action)}
                className={
                  confirmAction.action === "delete"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-[#C8A951] hover:bg-[#B89941] text-black"
                }
              >
                {loading ? "Se proceseaza..." : "Confirma"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-left text-[#888] bg-[#111111]">
              <th className="px-4 py-3 font-medium w-10">
                <button onClick={toggleAll} className="text-[#888] hover:text-[#EDEDED]">
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-[#C8A951]" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Titlu</th>
              <th className="px-4 py-3 font-medium">Utilizator</th>
              <th className="px-4 py-3 font-medium">Categorie</th>
              <th className="px-4 py-3 font-medium">Pret</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr
                key={ad.id}
                className={`border-b border-[#1E1E1E] hover:bg-[#1E1E1E] ${
                  selected.has(ad.id) ? "bg-[#1A1A1A]" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <button onClick={() => toggleOne(ad.id)} className="text-[#888] hover:text-[#EDEDED]">
                    {selected.has(ad.id) ? (
                      <CheckSquare className="h-4 w-4 text-[#C8A951]" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-[#EDEDED] max-w-56 truncate">{ad.title}</td>
                <td className="px-4 py-3 text-[#888]">{ad.user.name || ad.user.email}</td>
                <td className="px-4 py-3 text-[#888]">{ad.category.name}</td>
                <td className="px-4 py-3 text-[#888]">
                  {ad.price ? `${ad.price.toLocaleString("ro-RO")} RON` : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      ad.status === "ACTIVE"
                        ? "bg-[#1B3A2B] text-green-700"
                        : ad.status === "REMOVED"
                        ? "bg-red-100 text-red-700"
                        : "bg-[#1E1E1E] text-[#888]"
                    }
                  >
                    {ad.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminAdActions adId={ad.id} status={ad.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
