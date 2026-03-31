"use client";

import { useEffect, useState } from "react";
import {
  Trophy, Zap, ShieldCheck, Activity, HeartHandshake,
} from "lucide-react";

interface Badge {
  key: string;
  label: string;
  icon: string;
  color: "gold" | "green" | "blue";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  zap: Zap,
  "shield-check": ShieldCheck,
  activity: Activity,
  "heart-handshake": HeartHandshake,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  gold: {
    bg: "bg-amber-900/30",
    text: "text-amber-400",
    border: "border-amber-700/40",
  },
  green: {
    bg: "bg-green-900/30",
    text: "text-green-400",
    border: "border-green-700/40",
  },
  blue: {
    bg: "bg-blue-900/30",
    text: "text-blue-400",
    border: "border-blue-700/40",
  },
};

interface SellerBadgesProps {
  userId: string;
  compact?: boolean;
}

export function SellerBadges({ userId, compact }: SellerBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetch(`/api/users/${userId}/badges`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.badges) setBadges(data.badges);
      })
      .catch(() => {});
  }, [userId]);

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-1.5"}`}>
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon] || ShieldCheck;
        const colors = colorMap[badge.color] || colorMap.blue;

        return (
          <span
            key={badge.key}
            className={`inline-flex items-center gap-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${
              compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
            }`}
          >
            <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
