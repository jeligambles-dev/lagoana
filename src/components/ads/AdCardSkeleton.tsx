import { Skeleton } from "@/components/ui/skeleton";

export function AdCardSkeleton() {
  return (
    <div className="bg-[#111111] rounded-lg border border-[#2A2A2A] overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/3] rounded-none" />

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* Title - two lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Price */}
        <Skeleton className="h-6 w-1/3" />

        {/* Location / date */}
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
