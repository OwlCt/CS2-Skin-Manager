"use client";

import { useMemo, useState, useEffect } from "react";
import BaseCard from "@/components/ui/BaseCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MusicKit } from "@/types/music-kit";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { createMusicKitTranslationMap } from "@/lib/translation-mapping";

type MusicKitGridProps = {
  kits: MusicKit[];
  team?: number;
};

const MusicKitGrid: React.FC<MusicKitGridProps> = ({ kits, team }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, t } = useLanguage();
  const [translationMap, setTranslationMap] = useState<Map<number, string>>(new Map());

  // Load translations when language changes
  useEffect(() => {
    async function loadTranslations() {
      try {
        const response = await fetch(`/data/translations/${language}.json`);
        const data = await response.json();

        if (data.music_kits) {
          const map = createMusicKitTranslationMap(kits, data.music_kits);
          setTranslationMap(map);
        }
      } catch (error) {
        console.error("Failed to load music kit translations:", error);
      }
    }

    loadTranslations();
  }, [language, kits]);

  // Filter music kits based on search (supports both English and translated names)
  const filteredKits = useMemo(() => {
    if (!searchQuery.trim()) return kits;

    const query = searchQuery.toLowerCase().trim();
    return kits.filter(kit => {
      // Search in English name
      const matchesEnglish = kit.name.toLowerCase().includes(query);

      // Search in translated name (if translations are loaded)
      const translatedName = translationMap.get(kit.id);
      const matchesTranslated = translatedName && translatedName.toLowerCase().includes(query);

      return matchesEnglish || matchesTranslated;
    });
  }, [kits, searchQuery, translationMap]);

  const handleMusicKitClick = async (kit: MusicKit) => {
    toast.loading(t("toast.savingConfig"), {
      id: "musickit-loading",
    });

    setIsLoading(true);
    try {
      const response = await fetch("/api/music-kits/config", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team: 0, // For now update for both teams until i have a better way to handle this
          defIndex: kit.def_index,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(
          errorData.error || t("toast.musicKitFailed"),
          {
            id: "musickit-loading",
          }
        );

        return;
      }

      toast.success(t("toast.musicKitEquipped"), {
        id: "musickit-loading"
      });
    } catch (error) {
      console.error("Failed to save music kit config:", error);
      toast.error(t("toast.musicKitFailed"), {
        id: "musickit-loading"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{t("nav.musicKits")}</h1>
            <Badge variant="secondary">
              {filteredKits.length} {filteredKits.length === 1 ? 'kit' : 'kits'}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`${t("nav.search").replace("...", "")} ${t("nav.musicKits").toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Music Kits Grid */}
      {filteredKits.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredKits.map((kit) => (
            <BaseCard
              key={kit.id}
              imageSrc={kit.image}
              alt={kit.name}
              onClick={() => handleMusicKitClick(kit)}
              nameBar={
                <div
                  className="w-full rounded-br rounded-bl px-2 py-1"
                  style={{
                    background: "rgba(30, 32, 40, 0.45)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  <p
                    className="text-sm font-medium truncate text-center w-full transition-colors"
                    style={{ color: "#cbd5e1" }}
                  >
                    {(() => {
                      const translatedName = translationMap.get(kit.id);
                      const displayName = translatedName || kit.name;
                      return displayName.includes("|")
                        ? displayName.split("|")[1].trim()
                        : displayName;
                    })()}
                  </p>
                  {isLoading && (
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {t("action.saving")}
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("search.noResults")}</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? `${t("search.searchFor")} "${searchQuery}"。`
              : t("weapon.noWeaponsAvailable")
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicKitGrid;
