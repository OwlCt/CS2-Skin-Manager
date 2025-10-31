"use client";

import { useMemo, useState } from "react";
import WeaponCard from "./WeaponCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface WeaponListProps {
  categoryName: string;
  weapons: string[];
  categoryRoute: string;
  baseWeapons?: Record<string, Record<string, string>>;
}

export default function WeaponList({
  categoryName,
  weapons,
  categoryRoute,
  baseWeapons,
}: WeaponListProps) {
  const { t } = useLanguage();
  const { getWeaponNameByKey, loading: translationLoading } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Translate category name
  const getCategoryLabel = (category: string) => {
    const categoryKey = `category.${category.toLowerCase()}`;
    return t(categoryKey);
  };

  // Process weapon data
  const processedWeapons = useMemo(() => {
    if (!baseWeapons) return [];

    return weapons
      .map((weapon) => {
        const weaponData = baseWeapons[weapon];
        if (!weaponData) return null;

        return {
          key: weapon,
          displayName: weaponData.name,
          imagePath: weaponData.image,
          searchText: weaponData.name.toLowerCase(),
        };
      })
      .filter(Boolean);
  }, [weapons, baseWeapons]);

  // Filter weapons based on search (supports both English and translated names)
  const filteredWeapons = useMemo(() => {
    if (!searchQuery.trim()) return processedWeapons;

    const query = searchQuery.toLowerCase().trim();
    return processedWeapons.filter(weapon => {
      if (!weapon) return false;

      // Search in English name
      const matchesEnglish = weapon.searchText.includes(query);

      // Search in translated name (if translations are loaded)
      if (!translationLoading) {
        const translatedName = getWeaponNameByKey(weapon.key);
        const matchesTranslated = translatedName && translatedName.toLowerCase().includes(query);
        return matchesEnglish || matchesTranslated;
      }

      return matchesEnglish;
    });
  }, [processedWeapons, searchQuery, translationLoading, getWeaponNameByKey]);

  // Loading state
  if (!baseWeapons) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{getCategoryLabel(categoryName)}</h1>
            <Badge variant="secondary">
              {filteredWeapons.length} {t(filteredWeapons.length === 1 ? "weapon.weapon" : "weapon.weapons")}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`${t("nav.search").replace("...", "")} ${getCategoryLabel(categoryName).toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Weapons Grid */}
      {filteredWeapons.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredWeapons.map((weapon) => {
            if (!weapon) return null;
            
            return (
              <WeaponCard
                key={weapon.key}
                weaponKey={weapon.key}
                displayName={weapon.displayName}
                imagePath={weapon.imagePath}
                categoryRoute={categoryRoute}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("weapon.noWeaponsFound")}</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? `${t("weapon.noWeaponsMatch")} "${searchQuery}"。`
              : t("weapon.noWeaponsAvailable")
            }
          </p>
        </div>
      )}
    </div>
  );
}
