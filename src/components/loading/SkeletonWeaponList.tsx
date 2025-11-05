import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading component for WeaponList
 * Displays placeholder cards while weapons are loading
 */
export default function SkeletonWeaponList() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Weapon Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Card skeleton */}
            <Skeleton className="w-full aspect-square rounded-lg" />
            {/* Name skeleton */}
            <Skeleton className="h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
