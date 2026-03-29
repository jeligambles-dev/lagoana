"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageSquare, TrendingUp, Package, CheckCircle, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";

interface AdStats {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number | null;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  category: { slug: string; name: string };
  images: { url: string }[];
  _count: { messages: number; reviews: number };
  dailyViews: { date: string; views: number }[];
}

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalFavorites: number;
    totalMessages: number;
    activeAds: number;
    soldAds: number;
    totalAds: number;
  };
  chartData: { date: string; views: number }[];
  ads: AdStats[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#666]" /></div>;
  }

  if (!data) {
    return <p className="text-[#888] py-8">Eroare la incarcarea datelor.</p>;
  }

  const { summary, chartData, ads } = data;
  const maxViews = Math.max(...chartData.map((d) => d.views), 1);
  const last7DaysViews = chartData.slice(-7).reduce((sum, d) => sum + d.views, 0);
  const prev7DaysViews = chartData.slice(-14, -7).reduce((sum, d) => sum + d.views, 0);
  const viewsTrend = prev7DaysViews > 0 ? Math.round(((last7DaysViews - prev7DaysViews) / prev7DaysViews) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EDEDED]">Statistici</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Eye} label="Vizualizari totale" value={summary.totalViews} />
        <StatCard icon={Heart} label="Favorite" value={summary.totalFavorites} />
        <StatCard icon={MessageSquare} label="Mesaje" value={summary.totalMessages} />
        <StatCard icon={Package} label="Anunturi active" value={summary.activeAds} />
        <StatCard icon={CheckCircle} label="Vandute" value={summary.soldAds} />
      </div>

      {/* Views chart */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gold" />
              Vizualizari ultimele 30 zile
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#EDEDED] font-medium">{last7DaysViews}</span>
              <span className="text-[#888]">ultimele 7 zile</span>
              {viewsTrend !== 0 && (
                <Badge className={viewsTrend > 0 ? "bg-[#1B3A2B] text-gold" : "bg-red-900/30 text-red-400"}>
                  <TrendingUp className={`h-3 w-3 mr-0.5 ${viewsTrend < 0 ? "rotate-180" : ""}`} />
                  {viewsTrend > 0 ? "+" : ""}{viewsTrend}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple bar chart */}
          <div className="flex items-end gap-[2px] h-32 mt-2">
            {chartData.map((d, i) => {
              const height = maxViews > 0 ? (d.views / maxViews) * 100 : 0;
              const isToday = i === chartData.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className={`w-full rounded-t transition-colors ${isToday ? "bg-gold" : "bg-gold/40 group-hover:bg-gold/70"}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-8 hidden group-hover:block bg-[#1E1E1E] border border-[#2A2A2A] rounded px-2 py-1 text-[10px] text-[#EDEDED] whitespace-nowrap z-10">
                    {d.date.slice(5)}: {d.views} vizualizari
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[#666]">
            <span>{chartData[0]?.date.slice(5)}</span>
            <span>Azi</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-ad stats */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#EDEDED]">Performanta pe anunturi</h2>
        {ads.map((ad) => {
          const adMaxViews = Math.max(...(ad.dailyViews.map((d) => d.views) || [0]), 1);
          return (
            <Card key={ad.id} className="bg-[#111111] border-[#2A2A2A]">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-[#1E1E1E] rounded-lg overflow-hidden shrink-0">
                    {ad.images[0] ? (
                      <img src={ad.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#666] text-[10px]">N/A</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/anunturi/${ad.category.slug}/${ad.slug}`}
                        className="font-medium text-[#EDEDED] hover:text-gold text-sm line-clamp-1"
                      >
                        {ad.title}
                      </Link>
                      <Badge className={
                        ad.status === "ACTIVE" ? "bg-[#1B3A2B] text-gold" :
                        ad.status === "SOLD" ? "bg-gold/20 text-gold" :
                        "bg-[#2A2A2A] text-[#888]"
                      }>
                        {ad.status}
                      </Badge>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#888]">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {ad.viewsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {ad.favoritesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {ad._count.messages}
                      </span>
                      {ad.price && (
                        <span className="text-gold font-medium">{ad.price.toLocaleString("ro-RO")} RON</span>
                      )}
                    </div>

                    {/* Mini sparkline */}
                    {ad.dailyViews.length > 0 && (
                      <div className="flex items-end gap-px h-6 mt-2">
                        {ad.dailyViews.slice(-14).map((d, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gold/30 rounded-t"
                            style={{ height: `${Math.max((d.views / adMaxViews) * 100, 8)}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="bg-[#111111] border-[#2A2A2A]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold" />
          <div>
            <p className="text-lg font-bold text-[#EDEDED]">{value.toLocaleString("ro-RO")}</p>
            <p className="text-[10px] text-[#888]">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
