"use client";

import { useMemo, useState } from "react";
import SkinCard from "./SkinCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skins, UserSkinConfig } from "@/types/skins";
import { Search } from "lucide-react";

interface SkinGridProps {
  skins: Skins[];
  userConfigs: UserSkinConfig | null;
}

export default function SkinGrid({ skins, userConfigs }: SkinGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter skins based on search
  const filteredSkins = useMemo(() => {
    if (!searchQuery.trim()) return skins;
    
    const query = searchQuery.toLowerCase().trim();
    return skins.filter(skin => 
      skin.paint_name.toLowerCase().includes(query) ||
      skin.weapon_name.toLowerCase().includes(query)
    );
  }, [skins, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Skins</h1>
            <Badge variant="secondary">
              {filteredSkins.length} skin{filteredSkins.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search skins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
          <h3 className="text-lg font-semibold mb-2">No skins found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No skins match your search "${searchQuery}".`
              : "No skins are available."
            }
          </p>
        </div>
      )}
    </div>
  );
}
