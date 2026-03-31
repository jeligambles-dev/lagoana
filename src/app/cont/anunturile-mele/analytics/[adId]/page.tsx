"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, MessageSquare, TrendingUp, TrendingDown, Calendar, ArrowLeft, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  title: string;
  totalViews: number;
  favoritesCount: number;
  messagesCount: number;
  viewsToday: number;
  viewsYesterday: number;
  mostActiveDay: { date: string; views: number };
  chartData: { date: string; views: number }[];
}

export default function AdAnalyticsPage({ params }: { params: Promise<{ adId: string }> }) {
  const { adId } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/ads/${adId}/analytics`)
      .then((r) => {
        if (!r.ok) throw new Error("Eroare la incarcarea datelor.");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [adId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-red-400 py-8">{error || "Eroare la incarcarea datelor."}</p>
        <Button render={<Link href="/cont/anunturile-mele" />} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Inapoi la anunturi
        </Button>
      </div>
    );
  }

  const maxViews = Math.max(...data.chartData.map((d) => d.views), 1);
  const viewsDiff = data.viewsToday - data.viewsYesterday;
  const viewsPercent = data.viewsYesterday > 0
    ? Math.round(((data.viewsToday - data.viewsYesterday) / data.viewsYesterday) * 100)
    : data.viewsToday > 0 ? 100 : 0;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button render={<Link href="/cont/anunturile-mele" />} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#EDEDED]">Statistici anunt</h1>
          <p className="text-sm text-[#888] mt-0.5">{data.title}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Eye className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#EDEDED]">{data.totalViews.toLocaleString("ro-RO")}</p>
                <p className="text-xs text-[#888]">Vizualizari totale</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-900/20">
                <Heart className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#EDEDED]">{data.favoritesCount.toLocaleString("ro-RO")}</p>
                <p className="text-xs text-[#888]">Favorite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-900/20">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#EDEDED]">{data.messagesCount.toLocaleString("ro-RO")}</p>
                <p className="text-xs text-[#888]">Mesaje primite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-900/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#EDEDED]">{formatDate(data.mostActiveDay.date)}</p>
                <p className="text-xs text-[#888]">Cea mai activa zi ({data.mostActiveDay.views} vizualizari)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today vs Yesterday */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888]">Vizualizari azi vs. ieri</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-[#EDEDED]">{data.viewsToday}</span>
                <span className="text-[#888]">vs</span>
                <span className="text-lg text-[#888]">{data.viewsYesterday}</span>
              </div>
            </div>
            {viewsDiff !== 0 && (
              <Badge className={viewsDiff > 0 ? "bg-[#1B3A2B] text-gold" : "bg-red-900/30 text-red-400"}>
                {viewsDiff > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {viewsDiff > 0 ? "+" : ""}{viewsPercent}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Views chart - last 30 days */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gold" />
            Vizualizari ultimele 30 zile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-[2px] h-40 mt-2">
            {data.chartData.map((d, i) => {
              const height = maxViews > 0 ? (d.views / maxViews) * 100 : 0;
              const isToday = i === data.chartData.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className={`w-full rounded-t transition-colors ${isToday ? "bg-gold" : "bg-gold/40 group-hover:bg-gold/70"}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-10 hidden group-hover:block bg-[#1E1E1E] border border-[#2A2A2A] rounded px-2 py-1 text-[10px] text-[#EDEDED] whitespace-nowrap z-10">
                    {formatDate(d.date)}: {d.views} vizualizari
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[#666]">
            <span>{formatDate(data.chartData[0]?.date)}</span>
            <span>Azi</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
