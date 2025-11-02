"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

// Translation cache to avoid refetching
const translationCache: Record<string, any> = {};

/**
 * Hook to get translated game data based on current language
 */
export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      // Check cache first
      if (translationCache[language]) {
        setTranslations(translationCache[language]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/data/translations/${language}.json`);
        const data = await response.json();

        // Cache the translations
        translationCache[language] = data;
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [language]);

  /**
   * Get translated skin name by paint_index and weapon_defindex
   */
  const getSkinName = (paintIndex: number, weaponDefindex: number): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find(
      (s: any) => s.paint_index === paintIndex.toString() && s.weapon.weapon_id === weaponDefindex
    );

    return skin?.name || "";
  };

  /**
   * Get translated pattern/paint name only (without weapon name)
   */
  const getPatternName = (paintIndex: number, weaponDefindex: number): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find(
      (s: any) => s.paint_index === paintIndex.toString() && s.weapon.weapon_id === weaponDefindex
    );

    return skin?.pattern?.name || "";
  };

  /**
   * Get translated weapon name by weapon_id (defindex)
   */
  const getWeaponName = (weaponDefindex: number): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find(
      (s: any) => s.weapon.weapon_id === weaponDefindex
    );

    return skin?.weapon?.name || "";
  };

  /**
   * Get translated weapon name by weapon key (e.g., "weapon_knife_butterfly")
   * This is useful for weapon lists where you have the weapon key from base_weapons.json
   */
  const getWeaponNameByKey = (weaponKey: string): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find(
      (s: any) => s.weapon?.id === weaponKey
    );

    return skin?.weapon?.name || "";
  };

  /**
   * Get translated weapon name by English weapon name
   * Handles knife names with stars like "★ Bayonet"
   * This is useful when you have the English name from base_weapons.json
   */
  const getWeaponNameByEnglish = (englishName: string): string => {
    if (!translations?.skins) return englishName;

    // Handle knife names with stars (e.g., "★ Bayonet")
    // The translation API has the format "刺刀（★）" instead of "★ 刺刀"
    if (englishName.startsWith("★ ")) {
      const knifeNameWithoutStar = englishName.substring(2).trim().toLowerCase();

      // Create weapon_id format: "★ Butterfly Knife" -> "weapon_knife_butterfly_knife"
      // Note: The API format is "weapon_knife_{type}", not "weapon_{type}"
      const weaponId = `weapon_knife_${knifeNameWithoutStar.replace(/\s+/g, '_')}`;

      // Try to find the knife in translations by weapon.id
      const knifeSkin = translations.skins.find((s: any) => {
        return s.weapon?.id === weaponId;
      });

      if (knifeSkin?.weapon?.name) {
        // Return in the format "刺刀（★）"
        return `${knifeSkin.weapon.name}（★）`;
      }
    }

    // Try to find a matching weapon by comparing English names
    // The skins array contains weapons with their English names in the weapon.name field in English translation
    // For non-English languages, we need to match by weapon structure

    // Create a normalized version of the input name for comparison
    const normalizedInput = englishName.toLowerCase().trim();

    // For gloves, try to match by the base type
    if (normalizedInput.includes("glove") || normalizedInput.includes("wrap")) {
      // Try to find by matching patterns in weapon names
      const gloveTypes: Record<string, number> = {
        "hand wraps": 5032,
        "driver gloves": 5031,
        "sport gloves": 5030,
        "moto gloves": 5033,
        "specialist gloves": 5034,
        "bloodhound gloves": 5027,
        "hydra gloves": 5035,
        "broken fang gloves": 4725,
      };

      // Remove spaces from input for matching
      const normalizedInputNoSpace = normalizedInput.replace(/\s+/g, "");

      for (const [type, defindex] of Object.entries(gloveTypes)) {
        const normalizedType = type.replace(/\s+/g, "");
        if (normalizedInputNoSpace.includes(normalizedType) || normalizedType.includes(normalizedInputNoSpace)) {
          return getWeaponName(defindex);
        }
      }
    }

    // For other weapons, try to match by weapon name
    const weaponMappings: Record<string, number> = {
      "ak-47": 7,
      "aug": 8,
      "awp": 9,
      "cz75-auto": 63,
      "desert eagle": 1,
      "dual berettas": 2,
      "famas": 10,
      "five-seven": 3,
      "g3sg1": 11,
      "galil ar": 13,
      "glock-18": 4,
      "m249": 14,
      "m4a1-s": 60,
      "m4a4": 16,
      "mac-10": 17,
      "mag-7": 27,
      "mp5-sd": 23,
      "mp7": 33,
      "mp9": 34,
      "negev": 28,
      "nova": 35,
      "p2000": 32,
      "p250": 36,
      "p90": 19,
      "pp-bizon": 26,
      "r8 revolver": 64,
      "sawed-off": 29,
      "scar-20": 38,
      "sg 553": 39,
      "ssg 08": 40,
      "tec-9": 30,
      "ump-45": 24,
      "usp-s": 61,
      "xm1014": 25,
      "knife": 42,
      "bayonet": 500,
      "flip knife": 505,
      "gut knife": 506,
      "karambit": 507,
      "m9 bayonet": 508,
      "huntsman knife": 509,
      "falchion knife": 512,
      "bowie knife": 514,
      "butterfly knife": 515,
      "shadow daggers": 516,
      "paracord knife": 517,
      "survival knife": 518,
      "ursus knife": 519,
      "navaja knife": 520,
      "nomad knife": 521,
      "stiletto knife": 522,
      "talon knife": 523,
      "classic knife": 503,
      "skeleton knife": 525,
    };

    const matchedDefindex = weaponMappings[normalizedInput];
    if (matchedDefindex) {
      return getWeaponName(matchedDefindex);
    }

    // If no match found, return the original name
    return englishName;
  };

  /**
   * Get translated agent name by agent model path or name
   * Tries to match by comparing agent names (case-insensitive partial match)
   */
  const getAgentName = (agentNameOrModel: string): string => {
    if (!translations?.agents) return "";

    // Extract the last part of the model path if it's a path (e.g., "tm_professional/tm_professional_varf5" -> "varf5")
    const modelPart = agentNameOrModel.split('/').pop() || agentNameOrModel;

    // Try to find a matching agent by comparing names (case-insensitive)
    // The English name format: "Name | Organization"
    // Try to match by the first part of the English name
    const agent = translations.agents.find((a: any) => {
      // Get the original English name from the local data
      // Since we don't have the original name here, we'll try fuzzy matching
      return a.id && (
        a.id.toLowerCase().includes(modelPart.toLowerCase()) ||
        modelPart.toLowerCase().includes(a.id.toLowerCase())
      );
    });

    return agent?.name || "";
  };

  /**
   * Get translated music kit name by kit ID
   */
  const getMusicKitName = (kitId: number): string => {
    if (!translations?.music_kits) return "";

    const kit = translations.music_kits.find((k: any) => k.id === kitId);
    return kit?.name || "";
  };

  /**
   * Get translated category name
   */
  const getCategoryName = (categoryId: string): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find((s: any) => s.category.id === categoryId);
    return skin?.category?.name || "";
  };

  /**
   * Get translated rarity name
   */
  const getRarityName = (rarityId: string): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find((s: any) => s.rarity.id === rarityId);
    return skin?.rarity?.name || "";
  };

  /**
   * Get translated wear name
   */
  const getWearName = (wearId: string): string => {
    if (!translations?.skins) return "";

    const wearMap: Record<string, string> = {
      "SFUI_InvTooltip_Wear_Amount_0": translations.skins[0]?.wears?.[0]?.name || "Factory New",
      "SFUI_InvTooltip_Wear_Amount_1": translations.skins[0]?.wears?.[1]?.name || "Minimal Wear",
      "SFUI_InvTooltip_Wear_Amount_2": translations.skins[0]?.wears?.[2]?.name || "Field-Tested",
      "SFUI_InvTooltip_Wear_Amount_3": translations.skins[0]?.wears?.[3]?.name || "Well-Worn",
      "SFUI_InvTooltip_Wear_Amount_4": translations.skins[0]?.wears?.[4]?.name || "Battle-Scarred",
    };

    return wearMap[wearId] || "";
  };

  /**
   * Get translated sticker name by sticker ID
   */
  const getStickerName = (stickerId: string): string => {
    if (!translations?.stickers) return "";

    const sticker = translations.stickers.find((s: any) => s.id === stickerId);
    return sticker?.name || "";
  };

  /**
   * Get translated sticker rarity by sticker ID
   */
  const getStickerRarity = (stickerId: string): string => {
    if (!translations?.stickers) return "";

    const sticker = translations.stickers.find((s: any) => s.id === stickerId);
    return sticker?.rarity?.name || "";
  };

  /**
   * Get translated sticker tournament name by sticker ID
   */
  const getStickerTournament = (stickerId: string): string => {
    if (!translations?.stickers) return "";

    const sticker = translations.stickers.find((s: any) => s.id === stickerId);
    return sticker?.tournament?.name || "";
  };

  /**
   * Get translated sticker collection/crate name by sticker ID and index
   */
  const getStickerCollection = (stickerId: string, index: number = 0): string => {
    if (!translations?.stickers) return "";

    const sticker = translations.stickers.find((s: any) => s.id === stickerId);
    if (!sticker) return "";

    // Try collections first, then crates
    const collection = sticker.collections?.[index] || sticker.crates?.[index];
    return collection?.name || "";
  };

  /**
   * Get translated keychain name by keychain ID
   */
  const getKeychainName = (keychainId: string): string => {
    if (!translations?.keychains) return "";

    const keychain = translations.keychains.find((k: any) => k.id === keychainId);
    return keychain?.name || "";
  };

  /**
   * Get translated keychain rarity by keychain ID
   */
  const getKeychainRarity = (keychainId: string): string => {
    if (!translations?.keychains) return "";

    const keychain = translations.keychains.find((k: any) => k.id === keychainId);
    return keychain?.rarity?.name || "";
  };

  /**
   * Get translated keychain collection name by keychain ID and index
   */
  const getKeychainCollection = (keychainId: string, index: number = 0): string => {
    if (!translations?.keychains) return "";

    const keychain = translations.keychains.find((k: any) => k.id === keychainId);
    if (!keychain) return "";

    const collection = keychain.collections?.[index];
    return collection?.name || "";
  };

  return {
    loading,
    getSkinName,
    getPatternName,
    getWeaponName,
    getWeaponNameByKey,
    getWeaponNameByEnglish,
    getAgentName,
    getMusicKitName,
    getCategoryName,
    getRarityName,
    getWearName,
    getStickerName,
    getStickerRarity,
    getStickerTournament,
    getStickerCollection,
    getKeychainName,
    getKeychainRarity,
    getKeychainCollection,
  };
}
