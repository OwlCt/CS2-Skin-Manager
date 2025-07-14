import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import WeaponList from "@/components/weapons/WeaponList";
import { getBaseWeapons } from "@/lib/data";
import { getWeaponsForCategory } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!category || typeof category !== "string") {
    notFound();
  }

  const [weapons, baseWeapons] = await Promise.all([
    getWeaponsForCategory(category),
    getBaseWeapons(),
  ]);

  if (!weapons || weapons.length === 0) {
    notFound();
  }

  const categoryDisplayName = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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

      <WeaponList
        categoryName={categoryDisplayName}
        weapons={weapons}
        baseWeapons={baseWeapons}
        categoryRoute={category}
      />
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const { category } = await params;
    const categoryDisplayName = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title: `${categoryDisplayName} - WeaponPaints`,
    };
  } catch {
    return {
      title: "Weapons - WeaponPaints",
    };
  }
}
