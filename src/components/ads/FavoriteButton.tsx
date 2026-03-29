"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  adId: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
}

export function FavoriteButton({ adId, isFavorited: initialFav, isLoggedIn }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(initialFav);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/cont/autentificare");
      return;
    }

    const res = await fetch(`/api/favorites/${adId}`, {
      method: isFav ? "DELETE" : "POST",
    });

    if (res.ok) {
      setIsFav(!isFav);
      toast.success(isFav ? "Scos din favorite" : "Adaugat la favorite");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} className="flex-1">
      <Heart className={`h-4 w-4 mr-1 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
      {isFav ? "Favorit" : "Salveaza"}
    </Button>
  );
}
