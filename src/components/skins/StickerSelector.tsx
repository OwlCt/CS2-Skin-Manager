"use client";

import { Sticker } from "@/types/sticker";
import { useState, useMemo, useEffect, useRef } from "react";
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
  const [search, setSearch] = useState("");
  const [categoryType, setCategoryType] = useState<"tournament" | "collection">("tournament");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedEffect, setSelectedEffect] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<"all" | "autograph" | "team">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const tournaments = new Set<string>();
    const collections = new Set<string>();
    const effects = new Set<string>();

    for (const sticker of stickers) {
      // Extract tournaments
      if (sticker.tournament?.name) {
        tournaments.add(sticker.tournament.name);
      }

      // Extract collections and crates
      sticker.collections.forEach(c => collections.add(c.name));
      sticker.crates.forEach(c => collections.add(c.name));

      // Extract effects
      effects.add(sticker.effect);
    }

    return {
      tournaments: Array.from(tournaments).sort((a, b) => {
        // Sort by year descending
        const yearA = a.match(/\d{4}/)?.[0] || "0";
        const yearB = b.match(/\d{4}/)?.[0] || "0";
        return Number(yearB) - Number(yearA);
      }),
      collections: Array.from(collections).sort(),
      effects: Array.from(effects).sort(),
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
        result = result.filter((sticker) =>
          sticker.collections.some(c => c.name === selectedCollection) ||
          sticker.crates.some(c => c.name === selectedCollection)
        );
      } else {
        // Show all stickers that have a collection or crate (and no tournament)
        result = result.filter((sticker) =>
          sticker.collections.length > 0 || sticker.crates.length > 0
        );
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

    // Search filter (applied last)
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((sticker) =>
        sticker.name.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [
    stickers,
    search,
    categoryType,
    selectedTournament,
    selectedCollection,
    selectedEffect,
    teamFilter,
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
    search,
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

  const handleSelect = (sticker: Sticker) => {
    onSelect(sticker);
    onOpenChange(false);
    setSearch("");
    setCurrentPage(1);
  };

  const handleRemove = () => {
    onSelect(null);
    onOpenChange(false);
    setSearch("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
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
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>选择贴纸</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索贴纸..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
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
                赛事
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
                收藏品
              </button>
            </div>

            {/* Specific Category Selector */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">筛选:</span>
              </div>

              {categoryType === "tournament" ? (
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                  <SelectTrigger className="w-[240px] h-9">
                    <SelectValue placeholder="选择赛事" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有赛事</SelectItem>
                    {filterOptions.tournaments.map((tournament) => (
                      <SelectItem key={tournament} value={tournament}>
                        {tournament}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="w-[240px] h-9">
                    <SelectValue placeholder="选择收藏品" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有收藏品</SelectItem>
                    {filterOptions.collections.map((collection) => (
                      <SelectItem key={collection} value={collection}>
                        {collection}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="w-px h-6 bg-border" />

              <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有级别</SelectItem>
                  {filterOptions.effects.map((effect) => (
                    <SelectItem key={effect} value={effect}>
                      {effect}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categoryType === "tournament" && (
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
                  aria-label="签名或队标筛选"
                >
                  <ToggleGroupItem value="autograph" className="px-3 py-1 text-sm">
                    签名
                  </ToggleGroupItem>
                  <ToggleGroupItem value="team" className="px-3 py-1 text-sm">
                    队标
                  </ToggleGroupItem>
                </ToggleGroup>
              )}

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  重置 ({activeFiltersCount})
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
            移除贴纸
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
                          {sticker.name.replace("Sticker | ", "")}
                        </p>
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span
                            className="font-medium"
                            style={{ color: sticker.rarity.color }}
                          >
                            {sticker.effect}
                          </span>
                          <span className="text-muted-foreground">
                            {sticker.rarity.name}
                          </span>
                          {sticker.type === "Autograph" && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              签名
                            </span>
                          )}
                        </div>
                        {sticker.tournament && (
                          <p className="text-xs text-muted-foreground">
                            {sticker.tournament.name}
                          </p>
                        )}
                        {!sticker.tournament && (sticker.collections.length > 0 || sticker.crates.length > 0) && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {sticker.collections[0]?.name || sticker.crates[0]?.name}
                          </p>
                        )}
                      </div>
                    </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-1">未找到符合筛选条件的贴纸</p>
                <p className="text-sm">请尝试调整筛选条件</p>
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
                上一页
              </button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
