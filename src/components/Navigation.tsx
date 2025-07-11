"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserNav from "@/components/UserNav";
import MobileMenu from "@/components/MobileMenu";
import SearchCommand from "@/components/SearchCommand";

interface NavigationProps {
  categories: string[];
  user?: {
    steamId: string;
    username?: string;
    avatar?: string;
  } | null;
}

export default function Navigation({ categories, user }: NavigationProps) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b px-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <MobileMenu categories={categories} />

          {/* Desktop: Small Search Input */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              className="relative h-9 w-48 justify-start text-sm text-muted-foreground"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search skins...
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Mobile: Search Icon Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && <UserNav user={user} />}
        </div>
      </header>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </>
  );
}
