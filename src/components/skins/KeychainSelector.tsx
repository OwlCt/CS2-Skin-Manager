"use client";

import { Keychain } from "@/types/keychain";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, X } from "lucide-react";

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
  const [search, setSearch] = useState("");

  const filteredKeychains = useMemo(() => {
    if (!search) return keychains;
    const searchLower = search.toLowerCase();
    return keychains.filter((keychain) =>
      keychain.name.toLowerCase().includes(searchLower)
    );
  }, [keychains, search]);

  const handleSelect = (keychain: Keychain) => {
    onSelect(keychain);
    onOpenChange(false);
    setSearch("");
  };

  const handleRemove = () => {
    onSelect(null);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Keychain</DialogTitle>
          <DialogDescription>
            Choose a keychain to attach to your weapon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search keychains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="w-full px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Remove Keychain
          </button>

          {/* Keychains Grid */}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {filteredKeychains.map((keychain) => (
                <motion.button
                  key={keychain.id}
                  type="button"
                  onClick={() => handleSelect(keychain)}
                  className="relative aspect-square bg-muted/40 rounded-lg border border-border hover:border-primary/50 transition-all p-2 group overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={keychain.image}
                      alt={keychain.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-xs font-medium text-foreground truncate">
                      {keychain.name.replace("Charm | ", "")}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ color: keychain.rarity.color }}
                    >
                      {keychain.rarity.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            {filteredKeychains.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No keychains found
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
