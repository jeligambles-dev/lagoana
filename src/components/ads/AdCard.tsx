import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface AdCardProps {
  ad: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    currency: string;
    isNegotiable: boolean;
    condition: string;
    county: string;
    city: string;
    createdAt: Date;
    promotedUntil: Date | null;
    spotlightUntil: Date | null;
    category: {
      slug: string;
      name: string;
    };
    images: {
      url: string;
      thumbnailUrl: string | null;
    }[];
  };
}

const conditionLabels: Record<string, string> = {
  NEW: "Nou",
  USED: "Folosit",
  LIKE_NEW: "Ca nou",
};

export function AdCard({ ad }: AdCardProps) {
  const isPromoted =
    (ad.promotedUntil && new Date(ad.promotedUntil) > new Date()) ||
    (ad.spotlightUntil && new Date(ad.spotlightUntil) > new Date());

  const imageUrl = ad.images[0]?.thumbnailUrl || ad.images[0]?.url || "/placeholder.svg";

  return (
    <Link
      href={`/anunturi/${ad.category.slug}/${ad.slug}`}
      className="group block bg-[#111111] rounded-lg border border-[#2A2A2A] overflow-hidden hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#1A1A1A] overflow-hidden">
        <Image
          src={imageUrl}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {isPromoted && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gold text-[#0B0B0B] text-[10px]">
              <Star className="h-3 w-3 mr-0.5" />
              Promovat
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-[#0B0B0B]/70 text-[#EDEDED] text-[10px] backdrop-blur-sm">
            {conditionLabels[ad.condition] || ad.condition}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-medium text-sm line-clamp-2 text-[#EDEDED] group-hover:text-gold transition-colors">
          {ad.title}
        </h3>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gold">
            {ad.price != null ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}` : "Pret la cerere"}
          </span>
          {ad.isNegotiable && (
            <span className="text-xs text-[#888]">negociabil</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#888]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {ad.city}, {ad.county}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: ro })}
          </span>
        </div>
      </div>
    </Link>
  );
}
