"use client";

import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface WeaponPageBreadcrumbProps {
  categoryName: string;
  categoryDisplayName: string;
  weaponDisplayName: string;
  weaponDefindex?: number;
}

export default function WeaponPageBreadcrumb({
  categoryName,
  categoryDisplayName,
  weaponDisplayName,
  weaponDefindex,
}: WeaponPageBreadcrumbProps) {
  const { t } = useLanguage();
  const { getWeaponName, loading } = useTranslation();

  // Translate category name
  const getCategoryLabel = (category: string) => {
    const categoryKey = `category.${category.toLowerCase()}`;
    return t(categoryKey);
  };

  // Translate weapon name using weapon_defindex for accuracy
  const translatedWeaponName = (() => {
    if (loading || !weaponDefindex) return weaponDisplayName;

    const translated = getWeaponName(weaponDefindex);
    if (!translated) return weaponDisplayName;

    // For knives (which start with ★), add the star back in Chinese format
    if (weaponDisplayName.startsWith("★ ")) {
      return `${translated}（★）`;
    }

    return translated;
  })();

  return (
    <AppBreadcrumb>
      <AppBreadcrumbItem>
        <Link href="/">{t("nav.home")}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem>
        <Link href={`/${categoryName}`}>
          {getCategoryLabel(categoryDisplayName)}
        </Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem isCurrent>{translatedWeaponName}</AppBreadcrumbItem>
    </AppBreadcrumb>
  );
}
