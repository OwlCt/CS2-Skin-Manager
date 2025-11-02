"use client";

import { Keychain } from "@/types/keychain";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface KeychainSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (keychain: Keychain | null) => void;
  keychains: Keychain[];
}

export default function KeychainSelector({
  open,
  onOpenChange,
  onSelect,
  keychains,
}: KeychainSelectorProps) {
  const { t } = useLanguage();
  const { getKeychainName, getKeychainRarity, getKeychainCollection } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const collections = new Set<string>();
    const rarities = new Set<string>();

    for (const keychain of keychains) {
      // Extract collections
      keychain.collections.forEach(c => collections.add(c.name));

      // Extract rarities
      rarities.add(keychain.rarity.name);
    }

    return {
      collections: Array.from(collections).sort(),
      rarities: Array.from(rarities).sort(),
    };
  }, [keychains]);

  // Apply all filters
  const filteredKeychains = useMemo(() => {
    let result = keychains;

    // Collection filter
    if (selectedCollection !== "all") {
      result = result.filter((keychain) =>
        keychain.collections.some(c => c.name === selectedCollection)
      );
    }

    // Rarity filter
    if (selectedRarity !== "all") {
      result = result.filter((keychain) => keychain.rarity.name === selectedRarity);
    }

    // Search filter (applied last) - now uses activeSearch for manual search
    if (activeSearch) {
      const searchLower = activeSearch.toLowerCase();
      result = result.filter((keychain) => {
        const translatedName = getKeychainName(keychain.id) || keychain.name;
        return translatedName.toLowerCase().includes(searchLower) ||
               keychain.name.toLowerCase().includes(searchLower);
      });
    }

    return result;
  }, [
    keychains,
    activeSearch,
    selectedCollection,
    selectedRarity,
    getKeychainName,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredKeychains.length / itemsPerPage);
  const paginatedKeychains = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKeychains.slice(start, start + itemsPerPage);
  }, [filteredKeychains, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeSearch,
    selectedCollection,
    selectedRarity,
  ]);

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

  const handleSelect = (keychain: Keychain) => {
    onSelect(keychain);
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
    setSelectedCollection("all");
    setSelectedRarity("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedCollection !== "all",
    selectedRarity !== "all",
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
          <DialogTitle>{t("keychain.selectKeychain")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Bar */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("keychain.searchPlaceholder")}
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("keychain.filterLabel")}</span>

            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder={t("keychain.selectCollection")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("keychain.allCollections")}</SelectItem>
                {filterOptions.collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:block w-px h-6 bg-border flex-shrink-0" />

            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder={t("keychain.rarity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("keychain.allRarities")}</SelectItem>
                {filterOptions.rarities.map((rarity) => (
                  <SelectItem key={rarity} value={rarity}>
                    {rarity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 ml-auto"
              >
                {t("keychain.resetFilters")} ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="w-full px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t("keychain.removeKeychain")}
          </button>

          {/* Keychains List */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 overflow-hidden">
            {paginatedKeychains.length > 0 ? (
              <div className="space-y-2 p-1">
                {paginatedKeychains.map((keychain) => (
                  <motion.button
                    key={keychain.id}
                    type="button"
                    onClick={() => handleSelect(keychain)}
                    className="w-full flex items-start gap-3 bg-muted/40 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/60 transition-all p-3 group text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Keychain Image */}
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-background/50 rounded-md border border-border/50">
                      <Image
                        src={keychain.image}
                        alt={keychain.name}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>

                    {/* Keychain Info - takes remaining space */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="font-medium text-foreground leading-tight">
                        {(getKeychainName(keychain.id) || keychain.name).replace(/^(Charm \| |挂件 \| )/, "")}
                      </p>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span
                          className="font-medium"
                          style={{ color: keychain.rarity.color }}
                        >
                          {getKeychainRarity(keychain.id) || keychain.rarity.name}
                        </span>
                      </div>
                      {keychain.collections.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {getKeychainCollection(keychain.id, 0) || keychain.collections[0]?.name}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-1">{t("keychain.noKeychainsFound")}</p>
                <p className="text-sm">{t("keychain.tryAdjustingFilters")}</p>
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
                {t("keychain.previous")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("keychain.page")} {currentPage} {t("keychain.of")} {totalPages} {t("keychain.page")}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {t("keychain.next")}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
