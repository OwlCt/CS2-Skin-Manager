"use client";

import SkinCard from "./SkinCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skins, UserSkinConfig } from "@/types/skins";
import { ListFilter } from "lucide-react";

interface SkinGridProps {
  skins: Skins[];
  userConfigs: UserSkinConfig | null;
}

export default function SkinGrid({ skins, userConfigs }: SkinGridProps) {
  const onSortChange = (value: "default" | "name") => {
    // TODO: Implement sorting logic based on the selected value
    console.log("Sort by:", value);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Skins</h1>
        <div className="flex items-center gap-4">
          <Select
            value="default"
            onValueChange={(value: "default" | "name") => onSortChange(value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort By..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort by Default</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {skins.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-xl text-muted-foreground">
            No skins found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {skins.map((skin) => (
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
      )}
    </div>
  );
}
