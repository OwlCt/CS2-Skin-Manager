// Script to fetch Chinese and English translations from CSGO-API
const fs = require("fs");
const path = require("path");

const API_BASE = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api";

const endpoints = [
  { name: "skins", path: "skins.json" },
  { name: "agents", path: "agents.json" },
  { name: "music_kits", path: "music_kits.json" },
  { name: "base_weapons", path: "base_weapons.json" },
];

const languages = ["en", "zh-CN"];

async function fetchTranslations() {
  const translations = { en: {}, "zh-CN": {} };

  for (const lang of languages) {
    console.log(`\nFetching ${lang} translations...`);

    for (const endpoint of endpoints) {
      const url = `${API_BASE}/${lang}/${endpoint.path}`;
      console.log(`  - ${endpoint.name}...`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        translations[lang][endpoint.name] = data;
        console.log(`    ✓ Got ${data.length || Object.keys(data).length} items`);
      } catch (error) {
        console.error(`    ✗ Failed: ${error.message}`);
      }
    }
  }

  // Save translations to public directory (so Next.js can serve them)
  const dataDir = path.join(__dirname, "..", "public", "data", "translations");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const lang of languages) {
    const filePath = path.join(dataDir, `${lang}.json`);
    fs.writeFileSync(filePath, JSON.stringify(translations[lang], null, 2));
    console.log(`\n✓ Saved ${lang} translations to ${filePath}`);
  }

  console.log("\n✓ All translations fetched successfully!");
}

fetchTranslations().catch(console.error);
