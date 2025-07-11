import SkinCard from "./SkinCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skin } from "@/lib/types";
import { ListFilter } from "lucide-react";

interface SkinGridProps {
  weaponName: string | null;
  skins: Skin[];
  sortKey: "default" | "name";
  onSortChange: (key: "default" | "name") => void;
  onConfigSave?: (skinId: string, config: any) => void;
}

export default function SkinGrid({
  weaponName,
  skins,
  sortKey,
  onSortChange,
  onConfigSave,
}: SkinGridProps) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">{weaponName} Skins</h1>
        <div className="flex items-center gap-4">
          <Select
            value={sortKey}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {skins.map((skin) => (
            <SkinCard key={skin.id} skin={skin} onConfigSave={onConfigSave} />
          ))}
        </div>
      )}
    </div>
  );
}
