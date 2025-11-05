"use client";

import { useMemo, useState } from "react";
import SkinCard from "./SkinCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skins, UserSkinConfig } from "@/types/skins";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import SkeletonSkinGrid from "@/components/loading/SkeletonSkinGrid";

interface SkinGridProps {
  skins: Skins[];
  userConfigs: UserSkinConfig | null;
}

export default function SkinGrid({ skins, userConfigs }: SkinGridProps) {
  const { t } = useLanguage();
  const { getSkinName, getPatternName, loading: translationLoading } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Show skeleton while translations are loading
  if (translationLoading) {
    return <SkeletonSkinGrid />;
  }

  // Manual search function
  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  // Handle Enter key for manual search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Filter skins based on search (supports both English and translated names)
  const filteredSkins = useMemo(() => {
    if (!activeSearchQuery.trim()) return skins;

    const query = activeSearchQuery.toLowerCase().trim();
    return skins.filter(skin => {
      // Search in English names
      const matchesEnglish =
        skin.paint_name.toLowerCase().includes(query) ||
        skin.weapon_name.toLowerCase().includes(query);

      // Search in translated names (if translations are loaded)
      if (!translationLoading) {
        const translatedSkinName = getSkinName(skin.paint, skin.weapon_defindex);
        const translatedPatternName = getPatternName(skin.paint, skin.weapon_defindex);

        const matchesTranslated =
          (translatedSkinName && translatedSkinName.toLowerCase().includes(query)) ||
          (translatedPatternName && translatedPatternName.toLowerCase().includes(query));

        return matchesEnglish || matchesTranslated;
      }

      return matchesEnglish;
    });
  }, [skins, activeSearchQuery, translationLoading, getSkinName, getPatternName]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{t("search.skins")}</h1>
            <Badge variant="secondary">
              {filteredSkins.length} {t(filteredSkins.length === 1 ? "weapon.weapon" : "weapon.weapons")}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {t("nav.search")}
          </button>
        </div>
      </div>

      {/* Skins Grid */}
      {filteredSkins.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSkins.map((skin) => (
            <SkinCard
              key={skin.paint}
              skin={skin}
              userConfig={
                userConfigs?.skins?.find(
                  (config) => config.weapon_paint_id === skin.paint
                ) && {
                  team: userConfigs.skins.find(
                    (config) => config.weapon_paint_id === skin.paint
                  )!.weapon_team,
                }
              }
            />
          ))}
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
