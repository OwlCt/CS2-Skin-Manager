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
   * Get translated weapon name by weapon_id
   */
  const getWeaponName = (weaponDefindex: number): string => {
    if (!translations?.skins) return "";

    const skin = translations.skins.find(
      (s: any) => s.weapon.weapon_id === weaponDefindex
    );

    return skin?.weapon?.name || "";
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

  return {
    loading,
    getSkinName,
    getPatternName,
    getWeaponName,
    getAgentName,
    getMusicKitName,
    getCategoryName,
    getRarityName,
    getWearName,
  };
}
