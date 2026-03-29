import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { User, MapPin, Calendar, ShieldCheck, Phone, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  return {
    title: user?.name ? `${user.name} - Lagoana` : "Profil vanzator - Lagoana",
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      county: true,
      city: true,
      createdAt: true,
      isPhoneVerified: true,
      isIdVerified: true,
    },
  });

  if (!user) {
    notFound();
  }

  const ads = await prisma.ad.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const reviewStats = await prisma.review.aggregate({
    where: { targetId: user.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const reviews = await prisma.review.findMany({
    where: { targetId: user.id },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      ad: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const avgRating = reviewStats._avg.rating ?? 0;
  const reviewCount = reviewStats._count.rating;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#EDEDED]">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || "Avatar"}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover border-2 border-[#2A2A2A]"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#1A1A1A] border-2 border-[#2A2A2A] flex items-center justify-center">
                    <User className="h-10 w-10 text-[#888]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <h1 className="text-2xl font-bold text-[#EDEDED]">
                  {user.name || "Utilizator"}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-[#888]">
                  {(user.city || user.county) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[user.city, user.county].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membru din {format(new Date(user.createdAt), "MMMM yyyy", { locale: ro })}
                  </span>
                </div>

                {/* Verification badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {user.isIdVerified && (
                    <Badge className="bg-[#1B3A2B] text-gold border-0">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Identitate verificata
                    </Badge>
                  )}
                  {user.isPhoneVerified && (
                    <Badge className="bg-[#1B3A2B] text-gold border-0">
                      <Phone className="h-3 w-3 mr-1" />
                      Telefon verificat
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {reviewCount > 0 && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(avgRating)
                              ? "text-gold fill-gold"
                              : "text-[#444]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#888]">
                      {avgRating.toFixed(1)} ({reviewCount}{" "}
                      {reviewCount === 1 ? "recenzie" : "recenzii"})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
                <p className="text-sm text-[#EDEDED] whitespace-pre-line">{user.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Ads */}
        <section>
          <h2 className="text-lg font-semibold text-[#EDEDED] mb-4">
            Anunturi active ({ads.length})
          </h2>
          {ads.length === 0 ? (
            <p className="text-[#888] text-sm">Acest utilizator nu are anunturi active.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ads.map((ad) => {
                const imageUrl =
                  ad.images[0]?.thumbnailUrl || ad.images[0]?.url || "/placeholder.svg";
                return (
                  <Link
                    key={ad.id}
                    href={`/anunturi/${ad.category.slug}/${ad.slug}`}
                    className="group block bg-[#111111] rounded-lg border border-[#2A2A2A] overflow-hidden hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all"
                  >
                    <div className="relative aspect-[4/3] bg-[#1A1A1A] overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <h3 className="font-medium text-sm line-clamp-2 text-[#EDEDED] group-hover:text-gold transition-colors">
                        {ad.title}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gold">
                          {ad.price != null
                            ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}`
                            : "Pret la cerere"}
                        </span>
                        {ad.isNegotiable && (
                          <span className="text-xs text-[#888]">negociabil</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#888]">
                        <MapPin className="h-3 w-3" />
                        {ad.city}, {ad.county}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-lg font-semibold text-[#EDEDED] mb-4">
            Recenzii ({reviewCount})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-[#888] text-sm">Acest utilizator nu are recenzii inca.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-[#111111] border-[#2A2A2A]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {review.author.avatarUrl ? (
                        <Image
                          src={review.author.avatarUrl}
                          alt={review.author.name || ""}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-[#888]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[#EDEDED]">
                            {review.author.name || "Anonim"}
                          </span>
                          <span className="text-xs text-[#888]">
                            {format(new Date(review.createdAt), "d MMM yyyy", { locale: ro })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? "text-gold fill-gold"
                                  : "text-[#444]"
                              }`}
                            />
                          ))}
                        </div>
                        {review.ad && (
                          <p className="text-xs text-[#888] mt-1">
                            Referitor la: {review.ad.title}
                          </p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-[#EDEDED] mt-2">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
