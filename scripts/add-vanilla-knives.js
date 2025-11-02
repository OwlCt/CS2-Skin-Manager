#!/usr/bin/env node

/**
 * This script adds vanilla (unpainted) knife options to the existing skins.json
 */

const fs = require('fs');
const path = require('path');

// Knife name mapping for vanilla (unpainted) knives
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
 * Load base weapons data to get knife images
 */
function loadBaseWeapons() {
  const baseWeaponsPath = path.join(__dirname, '..', 'data', 'base_weapons.json');
  return JSON.parse(fs.readFileSync(baseWeaponsPath, 'utf-8'));
}

function main() {
  console.log("🔪 Adding vanilla knife options to skins.json...\n");

  // Load base weapons data for knife images
  const baseWeapons = loadBaseWeapons();
  console.log("✓ Loaded base weapons data");

  // Read the existing skins.json
  const skinsPath = path.join(__dirname, '..', 'data', 'skins.json');
  console.log(`Reading: ${skinsPath}`);

  const skinsData = JSON.parse(fs.readFileSync(skinsPath, 'utf-8'));
  console.log(`Found ${skinsData.length} existing skins`);

  // Check if vanilla knives already exist
  const existingVanillaKnives = skinsData.filter(s => s.paint === 0 && VANILLA_KNIFE_NAMES[s.weapon_defindex]);
  if (existingVanillaKnives.length > 0) {
    console.log(`\n⚠️  Found ${existingVanillaKnives.length} vanilla knives already in the data.`);
    console.log("Removing existing vanilla knives before adding new ones...");
    const filteredSkins = skinsData.filter(s => !(s.paint === 0 && VANILLA_KNIFE_NAMES[s.weapon_defindex]));
    console.log(`Removed ${skinsData.length - filteredSkins.length} vanilla knives`);
    skinsData.length = 0;
    skinsData.push(...filteredSkins);
  }

  // Collect all existing knife types to get their weapon_name
  const existingKnives = new Map();
  for (const skin of skinsData) {
    const defindex = skin.weapon_defindex;
    if (VANILLA_KNIFE_NAMES[defindex] && !existingKnives.has(defindex)) {
      existingKnives.set(defindex, skin.weapon_name);
    }
  }

  console.log(`\nFound ${existingKnives.size} knife types in the data:`);
  for (const [defindex, weaponName] of existingKnives) {
    console.log(`  - ${defindex}: ${weaponName} (${VANILLA_KNIFE_NAMES[defindex]})`);
  }

  // Create vanilla knife entries
  const vanillaKnives = [];
  for (const [defindex, weaponName] of existingKnives) {
    // Get the image from base_weapons.json
    const baseWeaponData = baseWeapons[weaponName];
    const image = baseWeaponData?.image || '';

    if (!image) {
      console.warn(`  ⚠️  Warning: No base image found for ${weaponName}`);
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

  console.log(`\n✅ Created ${vanillaKnives.length} vanilla knife entries`);

  // Combine vanilla knives at the beginning with existing skins
  const updatedSkins = [...vanillaKnives, ...skinsData];

  console.log(`\nTotal skins after adding vanilla knives: ${updatedSkins.length}`);

  // Write the updated data back to skins.json
  fs.writeFileSync(skinsPath, JSON.stringify(updatedSkins, null, 2), 'utf-8');
  console.log(`\n✅ Successfully updated ${skinsPath}`);
  console.log("\n🎉 Done! Vanilla knife options have been added.");
}

main();
