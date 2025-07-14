"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Skins } from "@/types/skins";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchSkins() {
  try {
    const response = await fetch("/api/skins/search");
    if (!response.ok) {
      throw new Error("Failed to fetch skins");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load skins:", error);
    return [];
  }
}

// Component for image with skeleton loading
function SkinImage({ skin }: { skin: Skins }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
      {!imageLoaded && !imageError && (
        <Skeleton className="h-full w-full absolute inset-0" />
      )}
      <img
        src={skin.image}
        alt={skin!.paint?.toString()}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-xs text-muted-foreground text-center font-mono">
            {skin.paint_name}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchCommand({
  open,
  onOpenChange,
}: SearchCommandProps) {
  const [searchValue, setSearchValue] = useState("");
  const [allSkins, setAllSkins] = useState<Skins[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load all skins for search on component mount
  useEffect(() => {
    setIsLoading(true);
    fetchSkins()
      .then((skins) => setAllSkins(skins))
      .finally(() => setIsLoading(false));
  }, []);

  console.log(allSkins);

  // Filter skins based on search value with memoization for performance
  const filteredSkins = useMemo(() => {
    if (!searchValue) return [];

    return allSkins
      .filter(
        (skin) =>
          skin.paint_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          skin.weapon_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          skin.category.toLowerCase().includes(searchValue.toLowerCase())
      )
      .slice(0, 8);
  }, [searchValue, allSkins]);

  const handleSelectSkin = (skin: Skins) => {
    onOpenChange(false);
    setSearchValue("");
    router.push(
      `/${skin.category.toLowerCase()}/${skin.weapon_name}#skin-${skin.paint}`
    );
  };

  const handleSearch = () => {};

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search skins, weapons, or categories..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? "Loading skins..." : "No results found."}
          </CommandEmpty>
          {filteredSkins.length > 0 && (
            <CommandGroup heading="Skins">
              {filteredSkins.map((skin) => (
                <CommandItem
                  key={`${skin.paint}`}
                  value={skin.paint_name}
                  onSelect={() => handleSelectSkin(skin)}
                  className="flex items-center gap-3 p-3"
                >
                  <SkinImage skin={skin} />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {skin.paint_name}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {searchValue && (
            <CommandGroup heading="Actions">
              <CommandItem onSelect={handleSearch} className="p-3">
                <Search className="mr-2 h-4 w-4" />
                Search for "{searchValue}"
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
