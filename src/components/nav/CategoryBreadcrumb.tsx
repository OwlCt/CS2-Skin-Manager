"use client";

import AppBreadcrumb, { AppBreadcrumbItem } from "@/components/nav/Breadcrumb";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryBreadcrumbProps {
  category: string;
}

export default function CategoryBreadcrumb({ category }: CategoryBreadcrumbProps) {
  const { t } = useLanguage();

  // Translate category name
  const getCategoryLabel = (categoryName: string) => {
    const categoryKey = `category.${categoryName.toLowerCase()}`;
    return t(categoryKey);
  };

  return (
    <div>
      <AppBreadcrumb>
        <AppBreadcrumbItem>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {t("nav.home")}
          </Link>
        </AppBreadcrumbItem>
        <AppBreadcrumbItem isCurrent>
          <span className="text-foreground font-medium">
            {getCategoryLabel(category)}
          </span>
        </AppBreadcrumbItem>
      </AppBreadcrumb>
    </div>
  );
}
