import AppBreadcrumb from "@/components/nav/Breadcrumb";
import WeaponList from "@/components/weapons/WeaponList";
import { getBaseWeapons } from "@/lib/data";
import { getWeaponsForCategory } from "@/lib/skins";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const weapons = await getWeaponsForCategory(category);

  if (!weapons) {
    return notFound();
  }

  const baseWeapons = await getBaseWeapons();

  const categoryDisplayName =
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="p-6">
      {/* Add the breadcrumb for this level */}
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>{categoryDisplayName}</AppBreadcrumb.Item>
      </AppBreadcrumb>

      <WeaponList
        categoryName={categoryDisplayName}
        weapons={weapons}
        baseWeapons={baseWeapons}
        categoryRoute={category}
      />
    </div>
  );
}
