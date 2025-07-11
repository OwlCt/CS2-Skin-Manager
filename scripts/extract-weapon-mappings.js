#!/usr/bin/env bun

import { writeFile } from "fs/promises";
import { join } from "path";

// =================================================================
// --- PART 1: DATA PROCESSING ---
// =================================================================
async function fetchSkinsData() {
  // Using the direct GitHub URL for stability
  const url =
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";
  console.log(`[Phase 1] Fetching data from ${url}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  console.log(
    `[Phase 1] Data fetched successfully. Found ${data.length} items.`
  );
  return data;
}

/**
 * Filters out items that are internal HUD elements and not actual skins.
 * @param {ApiSkin[]} skins - The raw array of skin objects from the API.
 * @returns {ApiSkin[]} A new array of skin objects with HUD items removed.
 */
function filterOutHudItems(skins) {
  // This correctly removes vanilla weapon entries by checking the weapon's own ID
  return skins.filter((skin) => !skin.weapon.id.startsWith("sfui_wpnhud_"));
}

/**
 * Removes the 'crates' property from an array of skins.
 * @param {ApiSkin[]} skins
 * @returns {ProcessedSkin[]}
 */
function removeCratesFromSkins(skins) {
  return skins.map((skin) => {
    const { crates, ...skinWithoutCrates } = skin;
    return skinWithoutCrates;
  });
}

/**
 * Categorizes skins into a nested object by class and then by weapon ID.
 * @param {ProcessedSkin[]} skins
 * @returns {SuperCategorizedSkins}
 */
function categorizeSkinsByClassAndWeapon(skins) {
  return skins.reduce((accumulator, currentSkin) => {
    const weaponClass = currentSkin.category.name; // e.g., "Rifle", "Pistol", "Gloves"
    const weaponId = currentSkin.weapon.id; // e.g., "weapon_ak47", "weapon_glock"

    if (!accumulator[weaponClass]) {
      accumulator[weaponClass] = {};
    }

    if (!accumulator[weaponClass][weaponId]) {
      accumulator[weaponClass][weaponId] = [];
    }

    accumulator[weaponClass][weaponId].push(currentSkin);
    return accumulator;
  }, {});
}

// =================================================================
// --- PART 2: WEAPON MAPPING GENERATION ---
// =================================================================

/**
 * Determines if a weapon is a knife, glove, or standard weapon.
 * @param {string} weaponId
 * @param {string} weaponName
 * @returns {'knife' | 'glove' | 'weapon'}
 */
function categorizeWeapon(weaponId, weaponName) {
  const lowerName = weaponName.toLowerCase();
  const lowerID = weaponId.toLowerCase();

  // Knife detection
  if (
    lowerName.includes("knife") ||
    lowerName.includes("bayonet") ||
    lowerName.includes("karambit") ||
    lowerName.includes("butterfly") ||
    lowerName.includes("shadow daggers") ||
    lowerID.includes("knife")
  ) {
    return "knife";
  }

  // Glove detection
  if (
    lowerName.includes("gloves") ||
    lowerName.includes("wraps") ||
    lowerID.includes("gloves") ||
    lowerID.includes("handwraps")
  ) {
    return "glove";
  }

  return "weapon";
}

/**
 * Generates and writes the weapon-mappings.ts file from categorized skin data.
 * @param {SuperCategorizedSkins} categorizedSkins - The processed, nested skin data object.
 */
async function generateMappings(categorizedSkins) {
  console.log("[Phase 2] Starting weapon mapping generation...");

  const knifeMap = new Map();
  const gloveMap = new Map();
  const weaponMap = new Map();

  // Iterate through the categorized data structure
  Object.values(categorizedSkins).forEach((weaponIdGroup) => {
    Object.values(weaponIdGroup).forEach((skinsArray) => {
      if (skinsArray.length === 0) return;

      // All skins in this array share the same weapon, so we only need the first one.
      const firstItem = skinsArray[0];
      const weaponId = firstItem.weapon.id;
      const weaponDefindex = firstItem.weapon.weapon_id;
      const weaponName = firstItem.weapon.name;

      const weaponType = categorizeWeapon(weaponId, weaponName);

      // Add to the appropriate map, ensuring no duplicates
      switch (weaponType) {
        case "knife":
          if (!knifeMap.has(weaponDefindex))
            knifeMap.set(weaponDefindex, weaponId);
          break;
        case "glove":
          if (!gloveMap.has(weaponDefindex))
            gloveMap.set(weaponDefindex, weaponId);
          break;
        default:
          if (!weaponMap.has(weaponDefindex))
            weaponMap.set(weaponDefindex, weaponId);
          break;
      }
    });
  });

  // Convert Maps to sorted Objects for consistent file output
  const toSortedObject = (map) =>
    Object.fromEntries(Array.from(map.entries()).sort((a, b) => a[0] - b[0]));

  const knifeMapping = toSortedObject(knifeMap);
  const gloveMapping = toSortedObject(gloveMap);
  const weaponMapping = toSortedObject(weaponMap);

  // --- Generate TypeScript file content ---
  // Note: The OUTPUT is a .ts file, so it correctly contains TypeScript syntax.
  const tsContent = `// Auto-generated weapon mappings from CS:GO API
// Generated on: ${new Date().toISOString()}

// --- KNIVES ---
export const KNIFE_DEFINDEXES: number[] = [${Object.keys(knifeMapping).join(
    ", "
  )}];

export const KNIFE_MAPPING: Record<number, string> = {
${Object.entries(knifeMapping)
  .map(([defindex, id]) => `  ${defindex}: "${id}",`)
  .join("\n")}
};

// --- GLOVES ---
export const GLOVE_DEFINDEXES: number[] = [${Object.keys(gloveMapping).join(
    ", "
  )}];

export const GLOVE_MAPPING: Record<number, string> = {
${Object.entries(gloveMapping)
  .map(([defindex, id]) => `  ${defindex}: "${id}",`)
  .join("\n")}
};

// --- WEAPONS ---
export const WEAPON_DEFINDEXES: number[] = [${Object.keys(weaponMapping).join(
    ", "
  )}];

export const WEAPON_MAPPING: Record<number, string> = {
${Object.entries(weaponMapping)
  .map(([defindex, id]) => `  ${defindex}: "${id}",`)
  .join("\n")}
};

// --- HELPER FUNCTIONS ---
export const getKnifeName = (defindex: number): string | undefined => KNIFE_MAPPING[defindex];
export const getGloveName = (defindex: number): string | undefined => GLOVE_MAPPING[defindex];
export const getWeaponName = (defindex: number): string | undefined => WEAPON_MAPPING[defindex];

export const isKnife = (defindex: number): boolean => KNIFE_DEFINDEXES.includes(defindex);
export const isGlove = (defindex: number): boolean => GLOVE_DEFINDEXES.includes(defindex);
`;

  // --- Write the TypeScript file ---
  const outputPath = join(process.cwd(), "src", "lib", "weapon-mappings.ts");
  await writeFile(outputPath, tsContent, "utf-8");
  console.log(`[Phase 2] Generated TypeScript mappings at: ${outputPath}`);

  console.log(`\n📊 Summary:`);
  console.log(`   - ${knifeMap.size} knives mapped`);
  console.log(`   - ${gloveMap.size} gloves mapped`);
  console.log(`   - ${weaponMap.size} weapons mapped`);
}

// =================================================================
// --- MAIN EXECUTION ---
// =================================================================

async function main() {
  try {
    // --- PHASE 1: Process raw skin data ---
    const rawSkinsData = await fetchSkinsData();
    const filteredSkins = filterOutHudItems(rawSkinsData);
    console.log(
      `[Phase 1] Filtered out HUD items. Remaining items: ${filteredSkins.length}`
    );
    const processedSkins = removeCratesFromSkins(filteredSkins);
    console.log("[Phase 1] 'crates' property removed from all skin objects.");
    const categorizedSkins = categorizeSkinsByClassAndWeapon(processedSkins);
    console.log("[Phase 1] Skins have been categorized by class and weapon.");

    // Write the cleaned and categorized skins.json file
    const finalJsonString = JSON.stringify(categorizedSkins, null, 2);
    const skinsOutputPath = join(process.cwdwd(), "public", "skins.json");
    await writeFile(skinsOutputPath, finalJsonString);
    console.log(
      `[Phase 1] ✅ Success! Cleaned data written to ${skinsOutputPath}`
    );

    console.log("\n--------------------------------------------------\n");

    // --- PHASE 2: Generate mappings from the processed data ---
    await generateMappings(categorizedSkins);

    console.log("\n🎉 All tasks completed successfully!");
  } catch (error) {
    console.error("❌ An error occurred during the process:", error);
    process.exit(1);
  }
}

main();
