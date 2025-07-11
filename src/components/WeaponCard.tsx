"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { isKnife, isGlove } from "@/lib/weapon-mappings";
import CustomCard, {
  CustomCardImage,
  CustomCardOverlay,
} from "@/components/CustomCard";
import { Check, CheckCircle } from "lucide-react";

interface WeaponCardProps {
  displayName: string;
  imagePath: string;
  weaponId: string;
  categoryRoute: string;
  configuredSkin?: any; // The user's configured skin
  hasUserConfig?: boolean; // Whether user has a config for this weapon
}

export default function WeaponCard({
  displayName,
  imagePath,
  weaponId,
  categoryRoute,
  configuredSkin,
  hasUserConfig = false,
}: WeaponCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  // Use configured skin image if available, otherwise use default weapon image
  const displayImage = configuredSkin?.image || imagePath;
  const displayName_final = configuredSkin?.name || displayName;

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleCardClick = () => {
    router.push(`/${categoryRoute}/${weaponId}`);
  };

  // Get the correct rarity color - override for knives and gloves
  const getRarityColor = () => {
    if (!configuredSkin?.rarity?.color) return undefined;

    // Check if this is a knife or glove by looking at the weapon_id
    const weaponId = configuredSkin.weapon?.weapon_id;
    if (weaponId && (isKnife(weaponId) || isGlove(weaponId))) {
      return "#ffd700"; // Gold color for knives and gloves
    }

    return configuredSkin.rarity.color;
  };

  return (
    <CustomCard
      onClick={handleCardClick}
      hasUserConfig={hasUserConfig}
      rarityColor={getRarityColor()}
      showEquippedBadge={hasUserConfig}
      equippedBadgeContent={
        <div className="flex gap-1">
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <CheckCircle /> Equipped
          </Badge>
          {configuredSkin?.configMeta?.team && (
            <Badge
              variant="default"
              className={`text-white text-xs ${
                configuredSkin.configMeta.team === 3 ||
                configuredSkin.configMeta.team === "ct"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : configuredSkin.configMeta.team === 2 ||
                    configuredSkin.configMeta.team === "t"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {configuredSkin.configMeta.team === 3 ||
              configuredSkin.configMeta.team === "ct"
                ? "CT"
                : configuredSkin.configMeta.team === 2 ||
                  configuredSkin.configMeta.team === "t"
                ? "T"
                : "BOTH"}
            </Badge>
          )}
        </div>
      }
    >
      <div className="relative w-full h-full flex flex-col p-4">
        {/* Image Section - takes most of the space */}
        <div className="flex-1 flex items-center justify-center">
          <CustomCardImage
            src={displayImage}
            alt={displayName_final}
            isLoaded={isLoaded}
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Dedicated bottom section for weapon name */}
        <div className="mt-3 text-center">
          <p className="font-medium text-sm leading-tight mb-1">
            {displayName_final}
          </p>
          {hasUserConfig && configuredSkin && (
            <div className="text-xs text-muted-foreground">
              {configuredSkin.pattern?.name && (
                <p className="mb-1 truncate">{configuredSkin.pattern.name}</p>
              )}
              {configuredSkin.configMeta && (
                <div className="flex justify-center gap-1 flex-wrap">
                  {configuredSkin.configMeta.wear && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {configuredSkin.configMeta.wear.toFixed(3)}
                    </Badge>
                  )}
                  {configuredSkin.configMeta.stattrak && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 bg-orange-500/80 text-white border-orange-400"
                    >
                      ST™
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomCard>
  );
}
