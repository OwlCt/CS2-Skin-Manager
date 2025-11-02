"use client";

import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface PaintBreadcrumbProps {
  category: string;
  weapon: string;
  skinCategory: string;
  weaponName: string;
  skinName: string;
  phase?: string;
  paintIndex?: number;
  weaponDefindex?: number;
}

export default function PaintBreadcrumb({
  category,
  weapon,
  skinCategory,
  weaponName,
  skinName,
  phase,
  paintIndex,
  weaponDefindex,
}: PaintBreadcrumbProps) {
  const { t } = useLanguage();
  const { getWeaponName, getPatternName, loading } = useTranslation();

  // Translate category name
  const getCategoryLabel = (categoryName: string) => {
    const categoryKey = `category.${categoryName.toLowerCase()}`;
    return t(categoryKey);
  };

  // Translate weapon name using weapon_defindex for accuracy
  const translatedWeaponName = (() => {
    if (loading || !weaponDefindex) return weaponName;

    const translated = getWeaponName(weaponDefindex);
    if (!translated) return weaponName;

    // For vanilla (unpainted) knives, the weaponName is the full name like "★ Bayonet"
    // The translated version from getWeaponName already includes proper formatting
    // So we just return it directly
    return translated;
  })();

  // Translate skin/pattern name
  const translatedSkinName = (() => {
    // For vanilla (unpainted) knives (paint === 0), show "无涂装" / "Vanilla"
    if (paintIndex === 0) {
      return t("skin.vanilla");
    }

    if (loading || !paintIndex || !weaponDefindex) {
      return skinName;
    }

    return getPatternName(paintIndex, weaponDefindex) || skinName;
  })();

  return (
    <AppBreadcrumb>
      <AppBreadcrumbItem>
        <Link href="/">{t("nav.home")}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem>
        <Link href={`/${category}`}>{getCategoryLabel(skinCategory)}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem>
        <Link href={`/${category}/${weapon}`}>{translatedWeaponName}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem isCurrent>
        {translatedSkinName} {phase ? `(${phase})` : ""}
      </AppBreadcrumbItem>
    </AppBreadcrumb>
  );
}
