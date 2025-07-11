"use client";

import { useState } from "react";
import { Skin } from "@/lib/types";
import SkinConfigDialog from "@/components/SkinConfigDialog";
import AgentConfigDialog from "@/components/AgentConfigDialog";
import MusicKitConfigDialog from "@/components/MusicKitConfigDialog";
import CustomCard, { CustomCardImage } from "@/components/CustomCard";
import { isKnife, isGlove } from "@/lib/weapon-mappings";
import { toast } from "sonner";

interface SkinCardProps {
  skin: Skin;
  onConfigSave?: (skinId: string, config: any) => void;
}

interface SkinConfig {
  team: "ct" | "t" | "both";
  wear: number;
  seed: number;
}

interface AgentConfig {
  team: "ct" | "t";
  modelPlayer: string;
}

interface MusicKitConfig {
  team: "ct" | "t";
  defIndex: string;
}

export default function SkinCard({ skin, onConfigSave }: SkinCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if this is an agent
  const isAgent = skin.weapon?.type === "Agent" || (skin as any).model_player;

  // Check if this is a music kit
  const isMusicKit =
    skin.weapon?.type === "MusicKit" || (skin as any).def_index;

  const handleCardClick = () => {
    setDialogOpen(true);
  };

  const handleConfigSave = (config: SkinConfig) => {
    if (onConfigSave) {
      onConfigSave(skin.id, config);
    }
    console.log("Skin config saved:", { skinId: skin.id, config });
  };

  const handleAgentConfigSave = async (config: AgentConfig) => {
    try {
      const response = await fetch("/api/agents/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save agent configuration"
        );
      }

      const result = await response.json();
      console.log("Agent config saved:", { agentId: skin.id, config, result });
    } catch (error) {
      console.error("Error saving agent config:", error);
      toast.error("Failed to save agent configuration", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleMusicKitConfigSave = async (config: MusicKitConfig) => {
    try {
      const response = await fetch("/api/music-kits/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save music kit configuration"
        );
      }

      const result = await response.json();
      console.log("Music kit config saved:", {
        musicKitId: skin.id,
        config,
        result,
      });

      // Note: Success toast is already shown in the dialog component
    } catch (error) {
      console.error("Error saving music kit config:", error);
      toast.error("Failed to save music kit configuration", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Get the correct rarity color - override for knives and gloves
  const getRarityColor = () => {
    if (!skin.rarity?.color) return undefined;

    // Check if this is a knife or glove by looking at the weapon_id
    const weaponId = skin.weapon?.weapon_id;
    if (weaponId && (isKnife(weaponId) || isGlove(weaponId))) {
      return "#ffd700"; // Gold color for knives and gloves
    }

    return skin.rarity.color;
  };

  return (
    <>
      <CustomCard
        onClick={handleCardClick}
        rarityColor={getRarityColor()}
        showStripedBackground={true}
      >
        <div className="relative w-full h-full flex flex-col p-6">
          {/* Image Section - takes most of the space */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full h-full max-h-40">
              <CustomCardImage
                src={skin.image}
                alt={skin.name}
                isLoaded={isLoaded}
                onLoad={() => setIsLoaded(true)}
                className="p-0" // Remove default padding for SkinCard
                rarityColor={getRarityColor()}
                showStripedBackground={true}
              />
            </div>
          </div>

          {/* Dedicated bottom section for skin name - CS:GO style */}
          <div className="mt-4 bg-black/70 backdrop-blur-sm p-2 rounded">
            <p className="text-white text-sm font-medium text-center line-clamp-2">
              {skin.name.replace("★ ", "")}{" "}
              {skin.phase ? `(${skin.phase})` : ""}
            </p>
          </div>
        </div>
      </CustomCard>

      {isAgent ? (
        <AgentConfigDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          agent={skin}
          onSave={handleAgentConfigSave}
        />
      ) : isMusicKit ? (
        <MusicKitConfigDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          // @ts-ignore
          musicKit={skin}
          onSave={handleMusicKitConfigSave}
        />
      ) : (
        <SkinConfigDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          skin={skin}
          onSave={handleConfigSave}
        />
      )}
    </>
  );
}
