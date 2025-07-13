import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import WeaponList from "@/components/weapons/WeaponList";
import { getBaseWeapons } from "@/lib/data";
import { getWeaponsForCategory } from "@/lib/skins";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const prisma = new PrismaClient();

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

function CategoryPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Title skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced error boundary component
function CategoryNotFound({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
        <span className="text-4xl">🔍</span>
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Category Not Found
      </h1>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        The category "{category}" doesn't exist or has no weapons available.
      </p>
      
      <Link 
        href="/"
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { category } = await params;
    
    // Validate category parameter
    if (!category || typeof category !== 'string') {
      return notFound();
    }

    const [weapons, baseWeapons] = await Promise.all([
      getWeaponsForCategory(category),
      getBaseWeapons()
    ]);

    if (!weapons || weapons.length === 0) {
      return <CategoryNotFound category={category} />;
    }

    const categoryDisplayName = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <div className="p-6 space-y-6">
        {/* Enhanced breadcrumb with better styling */}
        <div>
          <AppBreadcrumb>
            <AppBreadcrumbItem>
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Home
              </Link>
            </AppBreadcrumbItem>
            <AppBreadcrumbItem isCurrent>
              <span className="text-foreground font-medium">
                {categoryDisplayName}
              </span>
            </AppBreadcrumbItem>
          </AppBreadcrumb>
        </div>

        <Suspense fallback={<CategoryPageSkeleton />}>
          <WeaponList
            categoryName={categoryDisplayName}
            weapons={weapons}
            baseWeapons={baseWeapons}
            categoryRoute={category}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading this category.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const { category } = await params;
    const categoryDisplayName = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      title: `${categoryDisplayName} - WeaponPaints`,
    };
  } catch {
    return {
      title: 'Weapons - WeaponPaints',
    };
  }
}
