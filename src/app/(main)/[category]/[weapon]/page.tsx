import { getSkinsForWeapon } from "@/lib/data";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { PrismaClient } from "@prisma/client";
import SkinGrid from "@/components/skins/SkinGrid";
import ScrollToHash from "@/components/skins/ScrollToHash";
import WeaponPageBreadcrumb from "@/components/nav/WeaponPageBreadcrumb";

interface WeaponPageProps {
  params: Promise<{
    category: string;
    weapon: string;
  }>;
}

async function getUserConfigs() {
  try {
    const prisma = new PrismaClient();
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

export default async function WeaponPage({ params }: WeaponPageProps) {
  const { category, weapon } = await params;
  const categoryName = decodeURIComponent(category);
  const weaponKey = decodeURIComponent(weapon);
  const skins = await getSkinsForWeapon(weaponKey);
  const userConfigs = await getUserConfigs();

  if (!skins) {
    notFound();
  }

  const categoryDisplayName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const firstSkin = skins.find((s) => s.weapon_name.toLowerCase() === weaponKey.toLowerCase())!;
  const weaponDisplayName = firstSkin.paint_name.split(" | ")[0];
  const weaponDefindex = firstSkin.weapon_defindex;

  return (
    <div className="p-6">
      <WeaponPageBreadcrumb
        categoryName={categoryName}
        categoryDisplayName={categoryDisplayName}
        weaponDisplayName={weaponDisplayName}
        weaponDefindex={weaponDefindex}
      />

      <ScrollToHash />
      <SkinGrid userConfigs={userConfigs} skins={skins} />
    </div>
  );
}
