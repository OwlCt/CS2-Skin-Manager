import { getWeaponsForCategory } from "@/lib/data";
import WeaponList from "@/components/WeaponList";
import { notFound, redirect } from "next/navigation";
import AppBreadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

async function getUserConfigs() {
  try {
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return null;
    }

    // Get all user configurations
    const [skins, knives, gloves] = await Promise.all([
      prisma.wp_player_skins.findMany({
        where: { steamid },
        orderBy: [{ weapon_team: "asc" }, { weapon_defindex: "asc" }],
      }),
      prisma.wp_player_knife.findMany({
        where: { steamid },
      }),
      prisma.wp_player_gloves.findMany({
        where: { steamid },
      }),
    ]);

    return { skins, knives, gloves };
  } catch (error) {
    console.error("Error fetching user configs:", error);
    return null;
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category); // This is "gloves"

  // Handle Music Kits special case - redirect to direct music-kits page
  if (categoryName.toLowerCase() === "music kits") {
    redirect("/music-kits");
  }

  const weapons = await getWeaponsForCategory(categoryName);

  if (!weapons) {
    notFound();
  }

  const userConfigs = await getUserConfigs();

  const categoryDisplayName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

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
        categoryRoute={categoryName}
        userConfigs={userConfigs}
      />
    </div>
  );
}
