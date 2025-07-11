import { writeFile } from 'fs/promises';
// --- NEW: Import types from our central file ---
import type { Skin, SkinsData, ProcessedSkin } from '@/lib/types';

// The local type definitions have been removed.

async function fetchSkinsData(): Promise<Skin[]> { // Use imported Skin type
  const url = 'https://bymykel.com/CSGO-API/api/en/skins.json';
  console.log("Fetching data from API...");
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const data = await res.json() as Skin[];
  console.log(`Data fetched successfully. Found ${data.length} items.`);
  return data;
}

function filterOutHudItems(skins: Skin[]): Skin[] {
  return skins.filter(skin => !skin.weapon.id.startsWith('sfui_wpnhud_'));
}

function removeCratesFromSkins(skins: Skin[]): ProcessedSkin[] {
  return skins.map(skin => {
    // @ts-ignore
    const { crates, ...skinWithoutCrates } = skin;
    return skinWithoutCrates;
  });
}

function categorizeSkinsByClassAndWeapon(skins: ProcessedSkin[]): SkinsData { // Use imported SkinsData type
  return skins.reduce((accumulator, currentSkin) => {
    const weaponClass = currentSkin.category.name;
    const weaponId = currentSkin.weapon.id;

    if (!accumulator[weaponClass]) accumulator[weaponClass] = {};
    if (!accumulator[weaponClass][weaponId]) accumulator[weaponClass][weaponId] = [];

    accumulator[weaponClass][weaponId].push(currentSkin);
    return accumulator;
  }, {} as SkinsData);
}

async function main() {
  try {
    const rawSkinsData = await fetchSkinsData();
    const filteredSkins = filterOutHudItems(rawSkinsData);
    console.log(`Filtered out HUD items. Remaining items: ${filteredSkins.length}`);
    const processedSkins = removeCratesFromSkins(filteredSkins);
    console.log("'crates' property removed from all skin objects.");
    const categorizedSkins = categorizeSkinsByClassAndWeapon(processedSkins);
    console.log("Skins have been categorized by class and weapon.");
    const finalJsonString = JSON.stringify(categorizedSkins, null, 2);
    const outputPath = 'skins.json';
    await writeFile(outputPath, finalJsonString);
    console.log(`\n✅ Success! Categorized data has been written to ${outputPath}`);
  } catch (error) {
    console.error("❌ An error occurred during the process:", error);
  }
}

main();