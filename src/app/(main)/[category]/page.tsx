import WeaponList from "@/components/weapons/WeaponList";
import { getBaseWeapons } from "@/lib/data";
import { getWeaponsForCategory } from "@/lib/data";
import { notFound } from "next/navigation";
import CategoryBreadcrumb from "@/components/nav/CategoryBreadcrumb";

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
      <CategoryBreadcrumb category={categoryDisplayName} />

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
