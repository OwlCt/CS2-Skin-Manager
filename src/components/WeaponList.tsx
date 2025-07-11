"use client";

import { useEffect, useState } from "react";
import WeaponCard from "./WeaponCard";
import { isKnife, isGlove } from "@/lib/weapon-mappings";

interface UserSkinConfig {
  skins: Array<{
    steamid: string;
    weapon_team: number;
    weapon_defindex: number;
    weapon_paint_id: number;
    weapon_wear: number;
    weapon_seed: number;
    weapon_nametag?: string | null;
    weapon_stattrak: boolean;
    weapon_stattrak_count: number;
  }>;
  knives: Array<{
    steamid: string;
    weapon_team: number;
    knife: string;
  }>;
  gloves: Array<{
    steamid: string;
    weapon_team: number;
    weapon_defindex: number;
  }>;
}

interface WeaponListProps {
  categoryName: string;
  weapons: Record<string, any[]>;
  categoryRoute: string;
  userConfigs?: UserSkinConfig | null;
}

export default function WeaponList({
  categoryName,
  weapons,
  categoryRoute,
  userConfigs: serverUserConfigs,
}: WeaponListProps) {
  const [userConfigs, setUserConfigs] = useState<UserSkinConfig | null>(
    serverUserConfigs || null
  );

  // Initialize with server data
  useEffect(() => {
    setUserConfigs(serverUserConfigs || null);
  }, [serverUserConfigs]);

  const weaponKeys = Object.keys(weapons);

  const imageBaseUrl =
    categoryRoute.toLowerCase() === "gloves"
      ? "/assets/gloves"
      : "https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/panorama/images/econ/weapons/base_weapons";

  // Helper function to find user's configured skin for a weapon
  const getUserConfiguredSkin = (weaponKey: string, weaponSkins: any[]) => {
    if (!userConfigs || !weaponSkins.length) return null;

    const firstSkin = weaponSkins[0];
    const weaponDefindex = firstSkin.weapon?.weapon_id;

    if (!weaponDefindex) return null;

    // Check for knife configuration FIRST - prevent fallthrough to skins
    if (isKnife(weaponDefindex)) {
      const configuredKnife = userConfigs.knives.find(
        (config) => config.knife === weaponKey
      );

      if (configuredKnife) {
        // Check if there's also a skin configuration for this knife
        const configuredSkin = userConfigs.skins.find(
          (config) => config.weapon_defindex === weaponDefindex
        );

        if (configuredSkin) {
          // Find the skin with matching paint_id
          const matchingSkin = weaponSkins.find(
            (skin) =>
              parseInt(skin.paint_index) === configuredSkin.weapon_paint_id
          );

          if (matchingSkin) {
            return {
              ...matchingSkin,
              name: `★ ${matchingSkin.weapon?.name || weaponKey}`,
              configMeta: {
                type: "knife",
                team: configuredKnife.weapon_team,
                wear: configuredSkin.weapon_wear,
                seed: configuredSkin.weapon_seed,
                nametag: configuredSkin.weapon_nametag,
                stattrak: configuredSkin.weapon_stattrak,
              },
            };
          }
        }

        // If knife is configured but no specific skin, return the first skin
        return {
          ...firstSkin,
          name: `★ ${firstSkin.weapon?.name || weaponKey}`,
          configMeta: {
            type: "knife",
            team: configuredKnife.weapon_team,
          },
        };
      }
      // Important: Return null for knives without config to prevent skin fallthrough
      return null;
    }

    if (isGlove(weaponDefindex)) {
      const configuredGlove = userConfigs.gloves.find(
        (config) => config.weapon_defindex === weaponDefindex
      );

      if (configuredGlove) {
        // Check if there's also a skin configuration for this glove
        const configuredSkin = userConfigs.skins.find(
          (config) => config.weapon_defindex === weaponDefindex
        );

        if (configuredSkin) {
          // Find the skin with matching paint_id
          const matchingSkin = weaponSkins.find(
            (skin) =>
              parseInt(skin.paint_index) === configuredSkin.weapon_paint_id
          );

          if (matchingSkin) {
            return {
              ...matchingSkin,
              name: `★ ${matchingSkin.weapon?.name || weaponKey}`,
              configMeta: {
                type: "glove",
                team: configuredGlove.weapon_team,
                wear: configuredSkin.weapon_wear,
                seed: configuredSkin.weapon_seed,
                nametag: configuredSkin.weapon_nametag,
                stattrak: configuredSkin.weapon_stattrak,
              },
            };
          }
        }

        // If glove is configured but no specific skin, return the first skin
        return {
          ...firstSkin,
          name: `★ ${firstSkin.weapon?.name || weaponKey}`,
          configMeta: {
            type: "glove",
            team: configuredGlove.weapon_team,
          },
        };
      }

      return null;
    }

    // Only check regular skins for non-knife, non-glove weapons
    const configuredSkin = userConfigs.skins.find(
      (config) => config.weapon_defindex === weaponDefindex
    );

    if (configuredSkin) {
      // Find the skin with matching paint_id
      const matchingSkin = weaponSkins.find(
        (skin) => parseInt(skin.paint_index) === configuredSkin.weapon_paint_id
      );

      if (matchingSkin) {
        // Add config metadata to the skin object
        return {
          ...matchingSkin,
          configMeta: {
            wear: configuredSkin.weapon_wear,
            seed: configuredSkin.weapon_seed,
            nametag: configuredSkin.weapon_nametag,
            stattrak: configuredSkin.weapon_stattrak,
            team: configuredSkin.weapon_team,
          },
        };
      }
    }

    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 capitalize">{categoryName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weaponKeys.map((weaponKey) => {
          const weaponSkins = weapons[weaponKey];
          const weaponDisplayName = weaponSkins[0]?.weapon?.name || weaponKey;
          const imagePath = `${imageBaseUrl}/${weaponKey}_png.png`;

          // Get user's configured skin for this weapon
          const configuredSkin = getUserConfiguredSkin(weaponKey, weaponSkins);

          return (
            <WeaponCard
              key={weaponKey}
              displayName={weaponDisplayName}
              imagePath={imagePath}
              weaponId={weaponKey}
              categoryRoute={categoryRoute}
              configuredSkin={configuredSkin}
              hasUserConfig={!!configuredSkin}
            />
          );
        })}
      </div>
    </div>
  );
}
