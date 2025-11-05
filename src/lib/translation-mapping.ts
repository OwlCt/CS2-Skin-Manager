/**
 * Mapping utilities to match local game data with CSGO-API translations
 * Since the data structures differ, we need to create mappings based on identifiable fields
 */

/**
 * Create a mapping between local agent data and API translation data
 * Strategy: First load English translations to match names, then map to target language
 */
export async function createAgentTranslationMap(
  localAgents: any[],
  translatedAgents: any[],
  language: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  // If we're translating to English, no need for mapping
  if (language === "en") {
    for (const agent of localAgents) {
      map.set(agent.agent_name, agent.agent_name);
    }
    return map;
  }

  // Load English translations to use as reference
  let englishAgents: any[] = [];
  try {
    const response = await fetch("/data/translations/en.json");
    const data = await response.json();
    englishAgents = data.agents || [];
  } catch (error) {
    console.error("Failed to load English agent reference:", error);
    return map;
  }

  // Helper to normalize agent names for comparison
  const normalizeAgentName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/'/g, "'")  // Normalize quotes
      .replace(/"/g, "")
      .trim();
  };

  // Create mapping: local agent_name -> English API name -> translated name
  for (const localAgent of localAgents) {
    const localNameNormalized = normalizeAgentName(localAgent.agent_name);

    // Find matching English agent from API
    const englishAgent = englishAgents.find(
      (a: any) => normalizeAgentName(a.name) === localNameNormalized
    );

    if (englishAgent) {
      // Find corresponding translated agent with same ID
      const translatedAgent = translatedAgents.find(
        (a: any) => a.id === englishAgent.id
      );

      if (translatedAgent) {
        map.set(localAgent.agent_name, translatedAgent.name);
      }
    }
  }

  return map;
}

/**
 * Create a mapping between local music kit data and API translation data
 */
export function createMusicKitTranslationMap(
  localKits: any[],
  translatedKits: any[]
): Map<number, string> {
  const map = new Map<number, string>();

  for (const localKit of localKits) {
    // Music kits should match by ID
    const translatedKit = translatedKits.find((k: any) => k.id === localKit.id);
    if (translatedKit) {
      map.set(localKit.id, translatedKit.name);
    }
  }

  return map;
}

/**
 * Create a mapping between local keychain data and API translation data
 */
export function createKeychainTranslationMap(
  localKeychains: any[],
  translatedKeychains: any[]
): Map<string, any> {
  const map = new Map<string, any>();

  for (const localKeychain of localKeychains) {
    // Keychains match by ID (e.g., "keychain-1", "keychain-2")
    const translatedKeychain = translatedKeychains.find(
      (k: any) => k.id === localKeychain.id
    );

    if (translatedKeychain) {
      // Store full keychain data for rarity and collection translations
      map.set(localKeychain.id, {
        name: translatedKeychain.name,
        rarity: translatedKeychain.rarity?.name || localKeychain.rarity?.name,
        collections: translatedKeychain.collections || localKeychain.collections,
      });
    }
  }

  return map;
}

/**
 * Create a mapping between local sticker data and API translation data
 */
export function createStickerTranslationMap(
  localStickers: any[],
  translatedStickers: any[]
): Map<string, string> {
  const map = new Map<string, string>();

  for (const localSticker of localStickers) {
    // Stickers match by ID (e.g., "sticker-1", "sticker-2")
    const translatedSticker = translatedStickers.find(
      (s: any) => s.id === localSticker.id
    );

    if (translatedSticker) {
      map.set(localSticker.id, translatedSticker.name);
    }
  }

  return map;
}
