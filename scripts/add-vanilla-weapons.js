#!/usr/bin/env node

/**
 * This script adds vanilla (unpainted) weapon options to the existing skins.json
 * for all weapons except knives and gloves
 */

const fs = require('fs');
const path = require('path');

/**
 * Load categories to get weapon lists
 */
function loadCategories() {
  const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');
  return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
}

/**
 * Load base weapons data to get weapon images and names
 */
function loadBaseWeapons() {
  const baseWeaponsPath = path.join(__dirname, '..', 'data', 'base_weapons.json');
  return JSON.parse(fs.readFileSync(baseWeaponsPath, 'utf-8'));
}

function main() {
  console.log("🔫 Adding vanilla weapon options to skins.json...\n");

  // Load categories and base weapons
  const categories = loadCategories();
  const baseWeapons = loadBaseWeapons();
  console.log("✓ Loaded categories and base weapons data");

  // Read the existing skins.json
  const skinsPath = path.join(__dirname, '..', 'data', 'skins.json');
  console.log(`Reading: ${skinsPath}`);

  const skinsData = JSON.parse(fs.readFileSync(skinsPath, 'utf-8'));
  console.log(`Found ${skinsData.length} existing skins`);

  // Categories to process (exclude Knives and Gloves)
  const categoriesToProcess = Object.entries(categories).filter(
    ([category]) => category !== 'Knives' && category !== 'Gloves'
  );

  console.log(`\nProcessing categories: ${categoriesToProcess.map(([cat]) => cat).join(', ')}`);

  // Collect weapon information from existing skins
  const weaponInfo = new Map();
  for (const skin of skinsData) {
    const weaponName = skin.weapon_name;
    if (!weaponInfo.has(weaponName)) {
      weaponInfo.set(weaponName, {
        defindex: skin.weapon_defindex,
        category: skin.category,
        weaponName: weaponName
      });
    }
  }

  // Check if vanilla weapons already exist
  const existingVanillaWeapons = skinsData.filter(s => {
    const info = weaponInfo.get(s.weapon_name);
    return s.paint === 0 && info && info.category !== 'Knives' && info.category !== 'Gloves';
  });

  if (existingVanillaWeapons.length > 0) {
    console.log(`\n⚠️  Found ${existingVanillaWeapons.length} vanilla weapons already in the data.`);
    console.log("Removing existing vanilla weapons before adding new ones...");
    const filteredSkins = skinsData.filter(s => {
      const info = weaponInfo.get(s.weapon_name);
      return !(s.paint === 0 && info && info.category !== 'Knives' && info.category !== 'Gloves');
    });
    console.log(`Removed ${skinsData.length - filteredSkins.length} vanilla weapons`);
    skinsData.length = 0;
    skinsData.push(...filteredSkins);
  }

  // Create vanilla weapon entries
  const vanillaWeapons = [];

  for (const [categoryName, weaponNames] of categoriesToProcess) {
    console.log(`\n📦 Processing category: ${categoryName}`);

    for (const weaponName of weaponNames) {
      const info = weaponInfo.get(weaponName);

      if (!info) {
        console.warn(`  ⚠️  Warning: No weapon info found for ${weaponName}, skipping`);
        continue;
      }

      // Get the image and display name from base_weapons.json
      const baseWeaponData = baseWeapons[weaponName];
      const image = baseWeaponData?.image || '';
      const displayName = baseWeaponData?.name || weaponName;

      if (!image) {
        console.warn(`  ⚠️  Warning: No base image found for ${weaponName}`);
      }

      console.log(`  ✓ Adding vanilla for ${displayName} (${weaponName})`);

      vanillaWeapons.push({
        weapon_defindex: info.defindex,
        weapon_name: weaponName,
        paint: 0,
        image: image,
        paint_name: displayName,
        legacy_model: false,
        team: 0,
        category: categoryName,
      });
    }
  }

  console.log(`\n✅ Created ${vanillaWeapons.length} vanilla weapon entries`);

  // Combine vanilla weapons at the beginning with existing skins
  // Keep vanilla knives first, then add vanilla weapons, then everything else
  const vanillaKnives = skinsData.filter(s => {
    const info = weaponInfo.get(s.weapon_name);
    return s.paint === 0 && info && info.category === 'Knives';
  });

  const otherSkins = skinsData.filter(s => {
    const info = weaponInfo.get(s.weapon_name);
    return !(s.paint === 0 && info && info.category === 'Knives');
  });

  const updatedSkins = [...vanillaKnives, ...vanillaWeapons, ...otherSkins];

  console.log(`\nTotal skins after adding vanilla weapons: ${updatedSkins.length}`);
  console.log(`  - Vanilla knives: ${vanillaKnives.length}`);
  console.log(`  - Vanilla weapons: ${vanillaWeapons.length}`);
  console.log(`  - Other skins: ${otherSkins.length}`);

  // Write the updated data back to skins.json
  fs.writeFileSync(skinsPath, JSON.stringify(updatedSkins, null, 2), 'utf-8');
  console.log(`\n✅ Successfully updated ${skinsPath}`);
  console.log("\n🎉 Done! Vanilla weapon options have been added.");
}

main();
