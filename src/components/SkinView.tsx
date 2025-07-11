"use client";

import { useMemo, useState } from "react";
import type { Skin } from "@/lib/types";
import SkinGrid from "./SkinGrid";

interface SkinViewProps {
  initialSkins: Skin[];
  weaponName: string;
}

export default function SkinView({ initialSkins, weaponName }: SkinViewProps) {
  const [sortKey, setSortKey] = useState<"default" | "name">("default");
  const handleConfigSave = async (skinId: string, config: any) => {
    try {
      // Extract weapon information from the skin ID or find the skin
      const skin = initialSkins.find((s) => s.id === skinId);
      if (!skin) {
        throw new Error("Skin not found");
      }

      // Extract weapon_defindex from skin data
      const weaponDefindex = skin.weapon.weapon_id || skin.weapon.id;

      // Extract paint_index from skin data
      const weaponPaintId = skin.paint_index || 0;

      console.log("Saving skin config:", {
        skinId,
        config,
        weaponDefindex,
        weaponPaintId,
      });

      const response = await fetch("/api/skins/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinId,
          weaponDefindex,
          weaponPaintId,
          team: config.team,
          wear: config.wear,
          seed: config.seed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      const result = await response.json();
      console.log("Configuration saved successfully:", result);

      // Show success message or update UI as needed
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to save skin config:", error);
      // Handle error (show toast notification, etc.)
      alert(
        `Failed to save configuration: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const processedSkins = useMemo(() => {
    return initialSkins.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [sortKey, initialSkins]);

  return (
    <SkinGrid
      weaponName={weaponName}
      skins={processedSkins}
      sortKey={sortKey}
      onSortChange={setSortKey}
      onConfigSave={handleConfigSave}
    />
  );
}
