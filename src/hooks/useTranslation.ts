"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { KNIFE_DEFINDEXES } from "@/lib/weapons";

// Translation cache to avoid refetching
const translationCache: Record<string, any> = {};

// Index cache to avoid rebuilding indexes
interface TranslationIndexes {
  skinsByPaintAndWeapon: Map<string, any>;
  skinsByWeaponId: Map<number, any>;
  skinsByWeaponKey: Map<string, any>;
  weaponsByCategoryId: Map<string, any>;
  weaponsByRarityId: Map<string, any>;
  agentsById: Map<string, any>;
  musicKitsById: Map<number, any>;
  stickersById: Map<string, any>;
  keychainsById: Map<string, any>;
}

const indexCache: Record<string, TranslationIndexes> = {};

/**
 * Build optimized indexes for fast lookups
 */
function buildIndexes(translations: any): TranslationIndexes {
  const indexes: TranslationIndexes = {
    skinsByPaintAndWeapon: new Map(),
    skinsByWeaponId: new Map(),
    skinsByWeaponKey: new Map(),
    weaponsByCategoryId: new Map(),
    weaponsByRarityId: new Map(),
    agentsById: new Map(),
    musicKitsById: new Map(),
    stickersById: new Map(),
    keychainsById: new Map(),
  };

  // Index skins by paint_index + weapon_id (most common lookup)
  if (translations.skins) {
    for (const skin of translations.skins) {
      const key = `${skin.paint_index}-${skin.weapon.weapon_id}`;
      indexes.skinsByPaintAndWeapon.set(key, skin);

      // Index by weapon_id for getWeaponName()
      if (!indexes.skinsByWeaponId.has(skin.weapon.weapon_id)) {
        indexes.skinsByWeaponId.set(skin.weapon.weapon_id, skin);
      }

      // Index by weapon.id for getWeaponNameByKey()
      if (skin.weapon?.id && !indexes.skinsByWeaponKey.has(skin.weapon.id)) {
        indexes.skinsByWeaponKey.set(skin.weapon.id, skin);
      }

      // Index by category.id
      if (skin.category?.id && !indexes.weaponsByCategoryId.has(skin.category.id)) {
        indexes.weaponsByCategoryId.set(skin.category.id, skin);
      }

      // Index by rarity.id
      if (skin.rarity?.id && !indexes.weaponsByRarityId.has(skin.rarity.id)) {
        indexes.weaponsByRarityId.set(skin.rarity.id, skin);
      }
    }
  }

  // Index agents by ID
  if (translations.agents) {
    for (const agent of translations.agents) {
      indexes.agentsById.set(agent.id, agent);
    }
  }

  // Index music kits by ID
  if (translations.music_kits) {
    for (const kit of translations.music_kits) {
      indexes.musicKitsById.set(kit.id, kit);
    }
  }

  // Index stickers by ID
  if (translations.stickers) {
    for (const sticker of translations.stickers) {
      indexes.stickersById.set(sticker.id, sticker);
    }
  }

  // Index keychains by ID
  if (translations.keychains) {
    for (const keychain of translations.keychains) {
      indexes.keychainsById.set(keychain.id, keychain);
    }
  }

  return indexes;
}

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

  // Build indexes when translations change
  const indexes = useMemo(() => {
    if (!translations) return null;

    // Check index cache first
    if (indexCache[language]) {
      return indexCache[language];
    }

    // Build and cache indexes
    const newIndexes = buildIndexes(translations);
    indexCache[language] = newIndexes;
    return newIndexes;
  }, [translations, language]);

  /**
   * Get translated skin name by paint_index and weapon_defindex
   */
  const getSkinName = (paintIndex: number, weaponDefindex: number): string => {
    if (!indexes) return "";

    // Handle vanilla (unpainted) knives
    if (paintIndex === 0) {
      const weaponName = getWeaponName(weaponDefindex);
      if (weaponName) {
        return weaponName;
      }
      return "";
    }

    const key = `${paintIndex}-${weaponDefindex}`;
    const skin = indexes.skinsByPaintAndWeapon.get(key);
    return skin?.name || "";
  };

  /**
   * Get translated pattern/paint name only (without weapon name)
   */
  const getPatternName = (paintIndex: number, weaponDefindex: number): string => {
    if (!indexes) return "";

    // Handle vanilla (unpainted) knives - return empty string
    if (paintIndex === 0) {
      return "";
    }

    const key = `${paintIndex}-${weaponDefindex}`;
    const skin = indexes.skinsByPaintAndWeapon.get(key);
    return skin?.pattern?.name || "";
  };

  /**
   * Get translated weapon name by weapon_id (defindex)
   */
  const getWeaponName = (weaponDefindex: number): string => {
    if (!indexes) return "";

    const skin = indexes.skinsByWeaponId.get(weaponDefindex);
    const weaponName = skin?.weapon?.name || "";

    // For knives, add the star symbol in the appropriate format
    if (weaponName && KNIFE_DEFINDEXES.includes(weaponDefindex)) {
      // Check if star symbol is already present
      if (weaponName.includes("★") || weaponName.includes("（★）")) {
        return weaponName;
      }

      if (language === "zh-CN") {
        // Chinese format: "刺刀（★）"
        return `${weaponName}（★）`;
      } else {
        // English format: "★ Bayonet"
        return `★ ${weaponName}`;
      }
    }

    return weaponName;
  };

  /**
   * Get translated weapon name by weapon key (e.g., "weapon_knife_butterfly")
   */
  const getWeaponNameByKey = (weaponKey: string): string => {
    if (!indexes) return "";

    const skin = indexes.skinsByWeaponKey.get(weaponKey);
    return skin?.weapon?.name || "";
  };

  /**
   * Get translated weapon name by English weapon name
   * Handles knife names with stars like "★ Bayonet"
   */
  const getWeaponNameByEnglish = (englishName: string): string => {
    if (!indexes) return englishName;

    // Handle knife names with stars (e.g., "★ Bayonet")
    if (englishName.startsWith("★ ")) {
      const knifeNameWithoutStar = englishName.substring(2).trim().toLowerCase();
      const weaponId = `weapon_knife_${knifeNameWithoutStar.replace(/\s+/g, '_')}`;

      const knifeSkin = indexes.skinsByWeaponKey.get(weaponId);
      if (knifeSkin?.weapon?.name) {
        return `${knifeSkin.weapon.name}（★）`;
      }
    }

    const normalizedInput = englishName.toLowerCase().trim();

    // For gloves, try to match by the base type
    if (normalizedInput.includes("glove") || normalizedInput.includes("wrap")) {
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

    return englishName;
  };

  /**
   * Get translated agent name by agent model path or name
   */
  const getAgentName = (agentNameOrModel: string): string => {
    if (!indexes) return "";

    const modelPart = agentNameOrModel.split('/').pop() || agentNameOrModel;

    // Try direct lookup first
    const agent = indexes.agentsById.get(agentNameOrModel);
    if (agent) return agent.name;

    // Fallback: try fuzzy matching by iterating through the map
    for (const [id, agentData] of indexes.agentsById) {
      if (
        id.toLowerCase().includes(modelPart.toLowerCase()) ||
        modelPart.toLowerCase().includes(id.toLowerCase())
      ) {
        return agentData.name;
      }
    }

    return "";
  };

  /**
   * Get translated music kit name by kit ID
   */
  const getMusicKitName = (kitId: number): string => {
    if (!indexes) return "";
    const kit = indexes.musicKitsById.get(kitId);
    return kit?.name || "";
  };

  /**
   * Get translated category name
   */
  const getCategoryName = (categoryId: string): string => {
    if (!indexes) return "";
    const skin = indexes.weaponsByCategoryId.get(categoryId);
    return skin?.category?.name || "";
  };

  /**
   * Get translated rarity name
   */
  const getRarityName = (rarityId: string): string => {
    if (!indexes) return "";
    const skin = indexes.weaponsByRarityId.get(rarityId);
    return skin?.rarity?.name || "";
  };

  /**
   * Get translated wear name
   */
  const getWearName = (wearId: string): string => {
    if (!translations?.skins?.[0]?.wears) return "";

    const wearMap: Record<string, string> = {
      "SFUI_InvTooltip_Wear_Amount_0": translations.skins[0].wears[0]?.name || "Factory New",
      "SFUI_InvTooltip_Wear_Amount_1": translations.skins[0].wears[1]?.name || "Minimal Wear",
      "SFUI_InvTooltip_Wear_Amount_2": translations.skins[0].wears[2]?.name || "Field-Tested",
      "SFUI_InvTooltip_Wear_Amount_3": translations.skins[0].wears[3]?.name || "Well-Worn",
      "SFUI_InvTooltip_Wear_Amount_4": translations.skins[0].wears[4]?.name || "Battle-Scarred",
    };

    return wearMap[wearId] || "";
  };

  /**
   * Get translated sticker name by sticker ID
   */
  const getStickerName = (stickerId: string): string => {
    if (!indexes) return "";
    const sticker = indexes.stickersById.get(stickerId);
    return sticker?.name || "";
  };

  /**
   * Get translated sticker rarity by sticker ID
   */
  const getStickerRarity = (stickerId: string): string => {
    if (!indexes) return "";
    const sticker = indexes.stickersById.get(stickerId);
    return sticker?.rarity?.name || "";
  };

  /**
   * Get translated sticker tournament name by sticker ID
   */
  const getStickerTournament = (stickerId: string): string => {
    if (!indexes) return "";
    const sticker = indexes.stickersById.get(stickerId);
    return sticker?.tournament?.name || "";
  };

  /**
   * Get translated sticker collection/crate name by sticker ID and index
   */
  const getStickerCollection = (stickerId: string, index: number = 0): string => {
    if (!indexes) return "";
    const sticker = indexes.stickersById.get(stickerId);
    if (!sticker) return "";

    const collection = sticker.collections?.[index] || sticker.crates?.[index];
    return collection?.name || "";
  };

  /**
   * Get translated keychain name by keychain ID
   */
  const getKeychainName = (keychainId: string): string => {
    if (!indexes) return "";
    const keychain = indexes.keychainsById.get(keychainId);
    return keychain?.name || "";
  };

  /**
   * Get translated keychain rarity by keychain ID
   */
  const getKeychainRarity = (keychainId: string): string => {
    if (!indexes) return "";
    const keychain = indexes.keychainsById.get(keychainId);
    return keychain?.rarity?.name || "";
  };

  /**
   * Get translated keychain collection name by keychain ID and index
   */
  const getKeychainCollection = (keychainId: string, index: number = 0): string => {
    if (!indexes) return "";
    const keychain = indexes.keychainsById.get(keychainId);
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
