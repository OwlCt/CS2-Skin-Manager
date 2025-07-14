import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="p-6 space-y-12">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2 mb-10">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
