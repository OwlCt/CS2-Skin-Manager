#!/usr/bin/env bun

import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const fs = { readFile };

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
 * Converts team string ID to numeric ID
 * @param {string} teamId - "both", "t", "ct", etc.
 * @returns {number} - 0 for both, 2 for T, 3 for CT
 */
function convertTeamId(teamId) {
  if (!teamId || teamId === "both") return 0;
  if (teamId === "t") return 2;
  if (teamId === "ct") return 3;
  return 0;
}

/**
 * Knife name mapping for vanilla (unpainted) knives
 */
const VANILLA_KNIFE_NAMES = {
  500: "★ Bayonet",
  503: "★ Classic Knife",
  505: "★ Flip Knife",
  506: "★ Gut Knife",
  507: "★ Karambit",
  508: "★ M9 Bayonet",
  509: "★ Huntsman Knife",
  512: "★ Falchion Knife",
  514: "★ Bowie Knife",
  515: "★ Butterfly Knife",
  516: "★ Shadow Daggers",
  517: "★ Paracord Knife",
  518: "★ Survival Knife",
  519: "★ Ursus Knife",
  520: "★ Navaja Knife",
  521: "★ Nomad Knife",
  522: "★ Stiletto Knife",
  523: "★ Talon Knife",
  525: "★ Skeleton Knife",
  526: "★ Kukri Knife",
};

/**
 * Transforms API skin data to match the app's expected format
 */
function transformSkinsData(apiSkins) {
  return apiSkins
    .filter((skin) => !skin.weapon.id.startsWith("sfui_wpnhud_")) // Filter out HUD items
    .map((skin) => ({
      weapon_defindex: Number(skin.weapon.weapon_id || skin.id),
      weapon_name: skin.weapon.id,
      paint: skin.paint_index !== null ? Number(skin.paint_index) : null,
      image: skin.image,
      paint_name: skin.name,
      legacy_model: Boolean(skin.legacy_model),
      team: convertTeamId(skin.team?.id),
      category: skin.category?.name || "Unknown",
      ...(skin.phase && { phase: skin.phase }),
    }));
}

/**
 * Adds vanilla (unpainted) knife options to the skin data
 */
async function addVanillaKnives(transformedSkins) {
  console.log("[Phase 1.5] Adding vanilla (unpainted) knife options...");

  // Load base weapons data to get knife images
  const baseWeaponsPath = join(process.cwd(), "data", "base_weapons.json");
  let baseWeapons = {};
  try {
    const baseWeaponsData = await fs.readFile(baseWeaponsPath, "utf-8");
    baseWeapons = JSON.parse(baseWeaponsData);
    console.log("[Phase 1.5] Loaded base weapons data for knife images");
  } catch (error) {
    console.warn("[Phase 1.5] Warning: Could not load base_weapons.json, vanilla knives will have no images");
  }

  const vanillaKnives = [];
  const existingKnives = new Map();

  // First, collect all existing knife types to get their weapon_name
  for (const skin of transformedSkins) {
    const defindex = skin.weapon_defindex;
    if (VANILLA_KNIFE_NAMES[defindex] && !existingKnives.has(defindex)) {
      existingKnives.set(defindex, skin.weapon_name);
    }
  }

  // Create vanilla knife entries for each knife type found
  for (const [defindex, weaponName] of existingKnives) {
    // Get the image from base_weapons.json
    const baseWeaponData = baseWeapons[weaponName];
    const image = baseWeaponData?.image || '';

    if (!image) {
      console.warn(`[Phase 1.5] Warning: No base image found for ${weaponName}`);
    }

    vanillaKnives.push({
      weapon_defindex: defindex,
      weapon_name: weaponName,
      paint: 0,
      image: image,
      paint_name: VANILLA_KNIFE_NAMES[defindex],
      legacy_model: false,
      team: 0,
      category: "Knives",
    });
  }

  console.log(`[Phase 1.5] Added ${vanillaKnives.length} vanilla knife options.`);

  // Return the combined array with vanilla knives at the beginning
  return [...vanillaKnives, ...transformedSkins];
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
 * Generates and writes the weapon-mappings.ts file from skin data.
 */
async function generateMappings(skins) {
  console.log("[Phase 2] Starting weapon mapping generation...");

  const knifeMap = new Map();
  const gloveMap = new Map();
  const weaponMap = new Map();

  // Process each skin to build mappings
  for (const skin of skins) {
    const weaponId = skin.weapon_name;
    const weaponDefindex = skin.weapon_defindex;
    const weaponName = skin.paint_name;

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
  }

  // Convert Maps to sorted Objects for consistent file output
  const toSortedObject = (map) =>
    Object.fromEntries(Array.from(map.entries()).sort((a, b) => a[0] - b[0]));

  const knifeMapping = toSortedObject(knifeMap);
  const gloveMapping = toSortedObject(gloveMap);
  const weaponMapping = toSortedObject(weaponMap);

  // --- Generate TypeScript file content ---
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
    // --- PHASE 1: Fetch and transform skin data ---
    const rawSkinsData = await fetchSkinsData();
    const transformedSkins = transformSkinsData(rawSkinsData);
    console.log(
      `[Phase 1] Transformed ${transformedSkins.length} skins to app format.`
    );

    // --- PHASE 1.5: Add vanilla (unpainted) knife options ---
    const skinsWithVanillaKnives = addVanillaKnives(transformedSkins);
    console.log(
      `[Phase 1.5] Total skins including vanilla knives: ${skinsWithVanillaKnives.length}`
    );

    // Write the skins.json file as a flat array
    const finalJsonString = JSON.stringify(skinsWithVanillaKnives, null, 2);
    const skinsOutputPath = join(process.cwd(), "data", "skins.json");
    await writeFile(skinsOutputPath, finalJsonString);
    console.log(
      `[Phase 1] ✅ Success! Skins data written to ${skinsOutputPath}`
    );

    console.log("\n--------------------------------------------------\n");

    // --- PHASE 2: Generate mappings from the processed data ---
    await generateMappings(skinsWithVanillaKnives);

    console.log("\n🎉 All tasks completed successfully!");
  } catch (error) {
    console.error("❌ An error occurred during the process:", error);
    process.exit(1);
  }
}

main();
