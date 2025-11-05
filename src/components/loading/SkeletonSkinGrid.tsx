import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading component for SkinGrid
 * Displays placeholder cards while translations and data are loading
 */
export default function SkeletonSkinGrid() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex gap-2 max-w-2xl">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Card skeleton with aspect ratio matching real cards */}
            <Skeleton className="w-full aspect-square rounded-lg" />
            {/* Name bar skeleton */}
            <Skeleton className="h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
