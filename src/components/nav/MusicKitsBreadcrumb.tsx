"use client";

import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MusicKitsBreadcrumb() {
  const { t } = useLanguage();

  return (
    <AppBreadcrumb>
      <AppBreadcrumbItem>
        <Link href="/">{t("nav.home")}</Link>
      </AppBreadcrumbItem>
      <AppBreadcrumbItem isCurrent>{t("nav.musicKits")}</AppBreadcrumbItem>
    </AppBreadcrumb>
  );
}
