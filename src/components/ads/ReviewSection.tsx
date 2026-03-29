"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  ad: { title: string };
}

interface ReviewSectionProps {
  sellerId: string;
  adId?: string;
  showForm?: boolean;
}

export function ReviewSection({ sellerId, adId, showForm }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?userId=${sellerId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sellerId]);

  async function handleSubmit() {
    if (!rating || !adId) return;
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: sellerId, adId, rating, comment }),
    });

    if (res.ok) {
      toast.success("Recenzie trimisa!");
      setRating(0);
      setComment("");
      // Reload reviews
      const data = await fetch(`/api/reviews?userId=${sellerId}`).then((r) => r.json());
      setReviews(data.reviews);
      setAvgRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } else {
      const data = await res.json();
      toast.error(data.error || "Eroare.");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  const canReview = showForm && session && session.user.id !== sellerId && adId;
  const alreadyReviewed = reviews.some((r) => r.author.id === session?.user?.id);

  return (
    <div className="space-y-4">
      {/* Rating summary */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${s <= (avgRating || 0) ? "fill-gold text-gold" : "text-[#2A2A2A]"}`}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-gold">{avgRating}</span>
          <span className="text-sm text-[#888]">({totalReviews} {totalReviews === 1 ? "recenzie" : "recenzii"})</span>
        </div>
      )}

      {/* Review form */}
      {canReview && !alreadyReviewed && (
        <div className="p-4 rounded-lg bg-[#111111] border border-[#2A2A2A] space-y-3">
          <p className="text-sm font-medium text-[#EDEDED]">Lasa o recenzie</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    s <= (hoverRating || rating) ? "fill-gold text-gold" : "text-[#2A2A2A] hover:text-[#444]"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-sm text-[#888]">{rating}/5</span>}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Scrie o recenzie (optional)..."
            rows={3}
            className="bg-[#0B0B0B] border-[#2A2A2A]"
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-gold text-[#0B0B0B] hover:bg-gold-light font-semibold"
          >
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
            Trimite recenzia
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-3 rounded-lg bg-[#111111] border border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={review.author.avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#1B3A2B] text-gold text-xs">
                      {review.author.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-[#EDEDED]">{review.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-gold text-gold" : "text-[#2A2A2A]"}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[#EDEDED]/80 mt-2">{review.comment}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-[#666]">
                <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ro })}</span>
                <span>pentru: {review.ad.title}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#666]">Nicio recenzie inca.</p>
      )}
    </div>
  );
}

export function SellerRatingBadge({ sellerId }: { sellerId: string }) {
  const [data, setData] = useState<{ avg: number | null; count: number } | null>(null);

  useEffect(() => {
    fetch(`/api/reviews?userId=${sellerId}`)
      .then((r) => r.json())
      .then((d) => setData({ avg: d.averageRating, count: d.totalReviews }))
      .catch(() => {});
  }, [sellerId]);

  if (!data || !data.avg) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      <span className="font-medium text-gold">{data.avg}</span>
      <span className="text-[#888]">({data.count})</span>
    </div>
  );
}
