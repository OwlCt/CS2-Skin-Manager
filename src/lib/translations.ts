import { promises as fs } from "fs";
import path from "path";
import type { Language } from "@/contexts/LanguageContext";

// Cache for translation data
let translationsCache: Record<Language, any> = {} as any;

/**
 * Load translation data for a specific language
 */
export async function getTranslations(language: Language) {
  // Return cached data if available
  if (translationsCache[language]) {
    return translationsCache[language];
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "translations",
      `${language}.json`
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Cache the data
    translationsCache[language] = data;

    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to English if translation fails
    if (language !== "en") {
      return getTranslations("en");
    }
    return {};
  }
}

/**
 * Get translated name for a skin by its ID
 */
export function getTranslatedSkinName(
  skins: any[],
  paintId: number,
  weaponDefindex: number
): string {
  const skin = skins.find(
    (s) => s.paint_index === paintId && s.weapon_defindex === weaponDefindex
  );
  return skin?.name || "";
}

/**
 * Get translated name for an agent by its ID
 */
export function getTranslatedAgentName(agents: any[], agentId: string): string {
  const agent = agents.find((a) => a.id === agentId);
  return agent?.name || "";
}

/**
 * Get translated name for a music kit by its ID
 */
export function getTranslatedMusicKitName(
  musicKits: any[],
  kitId: number
): string {
  const kit = musicKits.find((k) => k.id === kitId);
  return kit?.name || "";
}

/**
 * Get translated weapon name by defindex
 */
export function getTranslatedWeaponName(
  baseWeapons: any[],
  defindex: number
): string {
  const weapon = baseWeapons.find((w) => w.defindex === defindex);
  return weapon?.name || "";
}

/**
 * Client-side hook to get translated game data
 * This should be used in client components
 */
export function useTranslatedData() {
  // This will be implemented as a React hook for client components
  // For now, we'll handle translations server-side
  return null;
}
