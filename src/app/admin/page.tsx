"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, Activity } from "lucide-react";
import { LineChart, BarChart } from "@/components/admin/Charts";

interface AnalyticsData {
  stats: { totalActiveAds: number; totalUsers: number; pendingReports: number };
  adsPerDay: { label: string; value: number }[];
  usersPerDay: { label: string; value: number }[];
  categories: { name: string; count: number }[];
  auditLogs: {
    id: string;
    adminName: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#EDEDED]">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[#111111] border border-[#2A2A2A] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-[#111111] border border-[#2A2A2A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#EDEDED]">Dashboard</h2>
        <p className="text-[#888]">Eroare la incarcarea datelor.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Anunturi active",
      value: data.stats.totalActiveAds,
      icon: FileText,
      color: "text-green-500 bg-[#1B3A2B]",
    },
    {
      label: "Utilizatori totali",
      value: data.stats.totalUsers,
      icon: Users,
      color: "text-[#C8A951] bg-[#2A2517]",
    },
    {
      label: "Rapoarte in asteptare",
      value: data.stats.pendingReports,
      icon: AlertTriangle,
      color: "text-red-500 bg-[#3A1B1B]",
    },
  ];

  const actionLabels: Record<string, string> = {
    remove: "Sters",
    restore: "Restaurat",
    spotlight: "Spotlight",
    ban: "Banat",
    approve: "Aprobat",
    delete: "Eliminat",
  };

  const targetLabels: Record<string, string> = {
    ad: "anunt",
    user: "utilizator",
    report: "raport",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#EDEDED]">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#EDEDED]">{stat.value}</p>
                  <p className="text-xs text-[#888]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ads per day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#EDEDED]">Anunturi noi pe zi (ultimele 30 zile)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={data.adsPerDay} color="#C8A951" height={200} />
          </CardContent>
        </Card>

        {/* Users per day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#EDEDED]">Utilizatori noi pe zi (ultimele 30 zile)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={data.usersPerDay} color="#4DABF7" height={200} />
          </CardContent>
        </Card>
      </div>

      {/* Categories bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[#EDEDED]">Cele mai populare categorii</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data.categories.map((c) => ({ label: c.name, value: c.count }))}
            color="#C8A951"
            height={240}
          />
        </CardContent>
      </Card>

      {/* Recent activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[#EDEDED] flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activitate recenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.auditLogs.length === 0 ? (
            <p className="text-[#888] text-sm">Nicio activitate recenta.</p>
          ) : (
            <div className="space-y-3">
              {data.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm border-b border-[#1E1E1E] pb-3 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#C8A951] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#EDEDED]">
                      <span className="font-medium">{log.adminName}</span>{" "}
                      a executat{" "}
                      <span className="text-[#C8A951] font-medium">
                        {actionLabels[log.action] || log.action}
                      </span>{" "}
                      pe {targetLabels[log.targetType] || log.targetType}{" "}
                      <span className="text-[#888] font-mono text-xs">{log.targetId.slice(0, 8)}...</span>
                    </p>
                    <p className="text-[#666] text-xs mt-0.5">
                      {new Date(log.createdAt).toLocaleString("ro-RO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
