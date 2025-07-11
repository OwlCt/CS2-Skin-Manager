import { getSkinsForWeapon } from "@/lib/data";
import SkinView from "@/components/SkinView";
import { notFound } from "next/navigation";
import AppBreadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

interface WeaponPageProps {
  params: Promise<{
    category: string;
    weapon: string;
  }>;
}

export default async function WeaponPage({ params }: WeaponPageProps) {
  const { category, weapon } = await params;
  const categoryName = decodeURIComponent(category); // This is "gloves"
  const weaponKey = decodeURIComponent(weapon);
  const initialSkins = await getSkinsForWeapon(categoryName, weaponKey);

  if (!initialSkins) {
    notFound();
  }

  // --- THE FIX ---
  // Create a capitalized version for display purposes.
  const categoryDisplayName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  // For agents, use proper display names for teams
  let weaponDisplayName = initialSkins[0]?.weapon?.name || weaponKey;
  if (categoryName.toLowerCase().includes("agents")) {
    if (weaponKey === "terrorist") {
      weaponDisplayName = "Terrorists";
    } else if (weaponKey === "counter-terrorist") {
      weaponDisplayName = "Counter-Terrorists";
    }
  }

  return (
    <div className="p-6">
      <AppBreadcrumb>
        <AppBreadcrumb.Item>
          <Link href="/">Home</Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item>
          {/* Use the lowercase 'categoryName' for the URL */}
          <Link href={`/${categoryName}`}>
            {/* Use the capitalized 'categoryDisplayName' for the text */}
            {categoryDisplayName}
          </Link>
        </AppBreadcrumb.Item>
        <AppBreadcrumb.Item isCurrent>{weaponDisplayName}</AppBreadcrumb.Item>
      </AppBreadcrumb>

      <SkinView initialSkins={initialSkins} weaponName={weaponDisplayName} />
    </div>
  );
}
