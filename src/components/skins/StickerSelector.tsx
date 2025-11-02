"use client";

import { Sticker } from "@/types/sticker";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const EFFECT_ORDER = [
  "Other",
  "Glitter",
  "Foil",
  "Holo",
  "Gold",
  "Lenticular",
];

const EFFECT_LABEL_KEYS: Record<string, string> = {
  Other: "sticker.effectOther",
  Glitter: "sticker.effectGlitter",
  Foil: "sticker.effectFoil",
  Holo: "sticker.effectHolo",
  Gold: "sticker.effectGold",
  Lenticular: "sticker.effectLenticular",
};

const STORE_EXCLUSIVE_VALUE = "__store_exclusive__";

interface StickerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (sticker: Sticker | null) => void;
  stickers: Sticker[];
}

export default function StickerSelector({
  open,
  onOpenChange,
  onSelect,
  stickers,
}: StickerSelectorProps) {
  const { t } = useLanguage();
  const { getStickerName, getStickerRarity, getStickerTournament, getStickerCollection } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [categoryType, setCategoryType] = useState<"tournament" | "collection">("tournament");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedEffect, setSelectedEffect] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<"all" | "autograph" | "team">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const translateEffect = useCallback(
    (effect: string) => {
      const translationKey = EFFECT_LABEL_KEYS[effect];
      if (translationKey) {
        return t(translationKey);
      }
      return effect;
    },
    [t]
  );

  // Helper to translate tournament name by finding first matching sticker
  const translateTournament = useCallback(
    (tournamentName: string) => {
      const matchingSticker = stickers.find(
        (s) => s.tournament?.name === tournamentName
      );
      if (matchingSticker) {
        return getStickerTournament(matchingSticker.id) || tournamentName;
      }
      return tournamentName;
    },
    [stickers, getStickerTournament]
  );

  // Helper to translate collection name by finding first matching sticker
  const translateCollection = useCallback(
    (collectionName: string) => {
      const matchingSticker = stickers.find(
        (s) => s.collections.some((c) => c.name === collectionName) ||
               s.crates.some((c) => c.name === collectionName)
      );
      if (matchingSticker) {
        const translatedCollection = getStickerCollection(matchingSticker.id, 0);
        // Check if the first collection/crate matches, otherwise check crates
        const firstCollectionOrCrate = matchingSticker.collections[0]?.name || matchingSticker.crates[0]?.name;
        if (firstCollectionOrCrate === collectionName) {
          return translatedCollection || collectionName;
        }
        // If not the first, we need to find the right index
        const collectionIndex = matchingSticker.collections.findIndex((c) => c.name === collectionName);
        if (collectionIndex !== -1) {
          return getStickerCollection(matchingSticker.id, collectionIndex) || collectionName;
        }
        const crateIndex = matchingSticker.crates.findIndex((c) => c.name === collectionName);
        if (crateIndex !== -1) {
          return getStickerCollection(matchingSticker.id, crateIndex) || collectionName;
        }
      }
      return collectionName;
    },
    [stickers, getStickerCollection]
  );

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const tournaments = new Set<string>();
    const collections = new Set<string>();
    const effects = new Set<string>();
    let hasStoreExclusive = false;

    for (const sticker of stickers) {
      // Extract tournaments
      if (sticker.tournament?.name) {
        tournaments.add(sticker.tournament.name);
      }

      // Extract collections and crates only for non-tournament stickers
      if (!sticker.tournament) {
        if (sticker.collections.length === 0 && sticker.crates.length === 0) {
          hasStoreExclusive = true;
        }

        sticker.collections.forEach(c => collections.add(c.name));
        sticker.crates.forEach(c => collections.add(c.name));
      }

      // Extract effects
      effects.add(sticker.effect);
    }

    const collectionList = Array.from(collections).sort();
    if (hasStoreExclusive) {
      collectionList.push(STORE_EXCLUSIVE_VALUE);
    }

    return {
      tournaments: Array.from(tournaments).sort((a, b) => {
        // Sort by year descending
        const yearA = a.match(/\d{4}/)?.[0] || "0";
        const yearB = b.match(/\d{4}/)?.[0] || "0";
        return Number(yearB) - Number(yearA);
      }),
      collections: collectionList,
      effects: Array.from(effects).sort((a, b) => {
        const indexA = EFFECT_ORDER.indexOf(a);
        const indexB = EFFECT_ORDER.indexOf(b);
        const orderA = indexA === -1 ? Number.POSITIVE_INFINITY : indexA;
        const orderB = indexB === -1 ? Number.POSITIVE_INFINITY : indexB;

        if (orderA === orderB) {
          return a.localeCompare(b);
        }

        return orderA - orderB;
      }),
    };
  }, [stickers]);

  // Apply all filters
  const filteredStickers = useMemo(() => {
    let result = stickers;

    // Category filter: tournament or collection
    if (categoryType === "tournament") {
      // Filter by tournament
      if (selectedTournament !== "all") {
        result = result.filter((sticker) =>
          sticker.tournament?.name === selectedTournament
        );
      } else {
        // Show all stickers that have a tournament
        result = result.filter((sticker) => sticker.tournament);
      }
    } else {
      // Filter by collection (exclude tournament stickers)
      result = result.filter((sticker) => !sticker.tournament);

      if (selectedCollection !== "all") {
        if (selectedCollection === STORE_EXCLUSIVE_VALUE) {
          result = result.filter(
            (sticker) =>
              sticker.collections.length === 0 && sticker.crates.length === 0
          );
        } else {
          result = result.filter((sticker) =>
            sticker.collections.some(c => c.name === selectedCollection) ||
            sticker.crates.some(c => c.name === selectedCollection)
          );
        }
      }
    }

    // Effect filter
    if (selectedEffect !== "all") {
      result = result.filter((sticker) => sticker.effect === selectedEffect);
    }

    // Signature vs team filter (tournament stickers only)
    if (categoryType === "tournament") {
      if (teamFilter === "autograph") {
        result = result.filter((sticker) => sticker.type === "Autograph");
      }

      if (teamFilter === "team") {
        result = result.filter((sticker) => sticker.type !== "Autograph");
      }
    }

    // Search filter (applied last) - now uses activeSearch for manual search
    if (activeSearch) {
      const searchLower = activeSearch.toLowerCase();
      result = result.filter((sticker) => {
        const translatedName = getStickerName(sticker.id) || sticker.name;
        return translatedName.toLowerCase().includes(searchLower) ||
               sticker.name.toLowerCase().includes(searchLower);
      });
    }

    return result;
  }, [
    stickers,
    activeSearch,
    categoryType,
    selectedTournament,
    selectedCollection,
    selectedEffect,
    teamFilter,
    getStickerName,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredStickers.length / itemsPerPage);
  const paginatedStickers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStickers.slice(start, start + itemsPerPage);
  }, [filteredStickers, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeSearch,
    categoryType,
    selectedTournament,
    selectedCollection,
    selectedEffect,
    teamFilter,
  ]);

  // Reset specific filter when category type changes
  useEffect(() => {
    if (categoryType === "tournament") {
      setSelectedCollection("all");
    } else {
      setSelectedTournament("all");
      setTeamFilter("all");
    }
  }, [categoryType]);

  // Manual search function
  const handleSearch = () => {
    setActiveSearch(search);
  };

  // Handle Enter key for manual search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelect = (sticker: Sticker) => {
    onSelect(sticker);
    onOpenChange(false);
    setSearch("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const handleRemove = () => {
    onSelect(null);
    onOpenChange(false);
    setSearch("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveSearch("");
    setCategoryType("tournament");
    setSelectedTournament("all");
    setSelectedCollection("all");
    setSelectedEffect("all");
    setTeamFilter("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    categoryType === "tournament" ? selectedTournament !== "all" : selectedCollection !== "all",
    selectedEffect !== "all",
    categoryType === "tournament" && teamFilter !== "all",
  ].filter(Boolean).length;

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    viewport?.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("sticker.selectSticker")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Bar */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("sticker.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
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

          {/* Filters */}
          <div className="space-y-3">
            {/* Category Type Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategoryType("tournament")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryType === "tournament"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("sticker.tournament")}
              </button>
              <button
                type="button"
                onClick={() => setCategoryType("collection")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryType === "collection"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("sticker.collection")}
              </button>
            </div>

            {/* Specific Category Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("sticker.filterLabel")}</span>
              </div>

              <div className="flex items-center gap-2 flex-nowrap flex-1">
                {categoryType === "tournament" ? (
                  <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                    <SelectTrigger className="w-[280px] h-9">
                      <SelectValue placeholder={t("sticker.selectTournament")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("sticker.allTournaments")}</SelectItem>
                      {filterOptions.tournaments.map((tournament) => (
                        <SelectItem key={tournament} value={tournament}>
                          {translateTournament(tournament)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger className="w-[280px] h-9">
                      <SelectValue placeholder={t("sticker.selectCollection")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("sticker.allCollections")}</SelectItem>
                      {filterOptions.collections.map((collection) => (
                        <SelectItem key={collection} value={collection}>
                          {collection === STORE_EXCLUSIVE_VALUE
                            ? t("sticker.storeExclusive")
                            : translateCollection(collection)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="hidden md:block w-px h-6 bg-border flex-shrink-0" />

                <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder={t("sticker.rarity")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("sticker.allRarities")}</SelectItem>
                  {filterOptions.effects.map((effect) => (
                    <SelectItem key={effect} value={effect}>
                      {translateEffect(effect)}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              {categoryType === "tournament" && (
                <div className="w-full flex items-center gap-2 pt-1 flex-wrap md:flex-nowrap">
                  <ToggleGroup
                    type="single"
                    value={teamFilter === "all" ? "" : teamFilter}
                    onValueChange={(value) => {
                      if (!value) {
                        setTeamFilter("all");
                        return;
                      }
                      setTeamFilter(value as "autograph" | "team");
                    }}
                    className="bg-background border border-border rounded-lg px-1 py-1"
                    aria-label={`${t("sticker.autograph")} / ${t("sticker.team")}`}
                  >
                    <ToggleGroupItem value="autograph" className="px-3 py-1 text-sm">
                      {t("sticker.autograph")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="team" className="px-3 py-1 text-sm">
                      {t("sticker.team")}
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 ml-auto"
                    >
                      {t("sticker.resetFilters")} ({activeFiltersCount})
                    </button>
                  )}
                </div>
              )}

              {categoryType !== "tournament" && activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 ml-auto"
                >
                  {t("sticker.resetFilters")} ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="w-full px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t("sticker.removeSticker")}
          </button>

          {/* Stickers List */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 overflow-hidden">
            {paginatedStickers.length > 0 ? (
              <div className="space-y-2 p-1">
                {paginatedStickers.map((sticker) => (
                  <motion.button
                    key={sticker.id}
                    type="button"
                    onClick={() => handleSelect(sticker)}
                    className="w-full flex items-start gap-3 bg-muted/40 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/60 transition-all p-3 group text-left"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Sticker Image */}
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-background/50 rounded-md border border-border/50">
                        <Image
                          src={sticker.image}
                          alt={sticker.name}
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      </div>

                      {/* Sticker Info - takes remaining space */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="font-medium text-foreground leading-tight">
                          {(getStickerName(sticker.id) || sticker.name).replace(/^(Sticker \| |印花 \| )/, "")}
                        </p>
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span
                            className="font-medium"
                            style={{ color: sticker.rarity.color }}
                          >
                            {translateEffect(sticker.effect)}
                          </span>
                          <span className="text-muted-foreground">
                            {getStickerRarity(sticker.id) || sticker.rarity.name}
                          </span>
                          {sticker.type === "Autograph" && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {t("sticker.autograph")}
                            </span>
                          )}
                        </div>
                        {sticker.tournament && (
                          <p className="text-xs text-muted-foreground">
                            {getStickerTournament(sticker.id) || sticker.tournament.name}
                          </p>
                        )}
                        {!sticker.tournament && (sticker.collections.length > 0 || sticker.crates.length > 0) && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {getStickerCollection(sticker.id, 0) || sticker.collections[0]?.name || sticker.crates[0]?.name}
                          </p>
                        )}
                      </div>
                    </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-1">{t("sticker.noStickersFound")}</p>
                <p className="text-sm">{t("sticker.tryAdjustingFilters")}</p>
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {t("sticker.previous")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("sticker.page")} {currentPage} {t("sticker.of")} {totalPages} {t("sticker.page")}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {t("sticker.next")}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
