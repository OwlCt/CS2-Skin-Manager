import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { SkinsData, WeaponData, WeaponSkins } from "./types";

export const getSkinsData = cache(async (): Promise<SkinsData> => {
  const filePath = path.join(process.cwd(), "public", "skins.json");
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
});

export async function getCategories(): Promise<string[]> {
  const data = await getSkinsData();
  const skinCategories = Object.keys(data);

  return [
    ...skinCategories,
    "Counter-Terrorist Agents",
    "Terrorist Agents",
    "Music Kits",
  ];
}

export async function getWeaponsForCategory(
  category: string
): Promise<WeaponData | null> {
  // Handle Music Kits category specially - they don't have sub-weapons
  if (category.toLowerCase() === "music kits") {
    return null; // Music kits are handled directly in their own page
  }

  // Handle Agent categories specially
  if (category.toLowerCase().includes("agents")) {
    const agentsData = await getAgentsData();

    // Determine which team based on the category
    let teamName = "";
    if (category.toLowerCase().includes("counter-terrorist")) {
      teamName = "Counter-Terrorist";
    } else if (category.toLowerCase().includes("terrorist")) {
      teamName = "Terrorist";
    }

    if (teamName && agentsData[teamName]) {
      // Return agents as a single "weapon" for the category
      const agentsAsWeapons: any = {};
      const agents = agentsData[teamName] as any[];

      // Use the correct weapon key for routing
      let weaponKey = "";
      let displayName = "";
      if (teamName === "Terrorist") {
        weaponKey = "terrorist";
        displayName = "Terrorists";
      } else {
        weaponKey = "counter-terrorist";
        displayName = "Counter-Terrorists";
      }

      // Add the weapon property to each agent for display
      const agentsWithWeapon = agents.map((agent: any) => ({
        ...agent,
        weapon: {
          name: displayName,
        },
      }));

      agentsAsWeapons[weaponKey] = agentsWithWeapon;
      return agentsAsWeapons;
    }

    return null;
  }

  // Handle regular weapon categories
  const data = await getSkinsData();
  const correctKey = Object.keys(data).find(
    (key) => key.toLowerCase() === category.toLowerCase()
  );

  return correctKey ? data[correctKey] : null;
}

export async function getSkinsForWeapon(
  category: string,
  weapon: string
): Promise<WeaponSkins | null> {
  // Handle music kits category specially
  if (category.toLowerCase() === "music kits") {
    const musicKitsData = await getMusicKitsData();

    // Filter out music kits that only have an image property
    const validMusicKits = musicKitsData.filter(
      (kit: any) => kit.id && kit.name
    );

    // Transform music kit data to include weapon property
    const musicKits = validMusicKits.map((kit: any) => ({
      ...kit,
      weapon: {
        id: "music-kits",
        name: "Music Kits",
        type: "MusicKit",
      },
    }));
    return musicKits as any;
  }

  // Handle agents category specially
  if (category.toLowerCase().includes("agents")) {
    const agentsData = await getAgentsData();

    // Determine team based on weapon parameter
    let teamName = "";
    let displayName = "";
    if (weapon === "terrorist") {
      teamName = "Terrorist";
      displayName = "Terrorists";
    } else if (weapon === "counter-terrorist") {
      teamName = "Counter-Terrorist";
      displayName = "Counter-Terrorists";
    }

    if (teamName && agentsData[teamName]) {
      // Transform agent data to include weapon property
      const agents = agentsData[teamName].map((agent: any) => ({
        ...agent,
        weapon: {
          id: weapon,
          name: displayName,
          type: "Agent",
        },
      }));
      return agents as any;
    }
    return null;
  }

  // Handle regular weapon categories
  const data = await getSkinsData();
  const correctCategoryKey = Object.keys(data).find(
    (key) => key.toLowerCase() === category.toLowerCase()
  );

  if (correctCategoryKey) {
    const categoryData = data[correctCategoryKey];
    if (categoryData?.[weapon]) {
      return categoryData[weapon];
    }
  }
  return null;
}

export async function getAllSkinNames(): Promise<string[]> {
  const data = await getSkinsData();
  const skinNames: string[] = [];

  Object.values(data).forEach((category) => {
    Object.values(category).forEach((weaponSkins) => {
      weaponSkins.forEach((skin) => {
        skinNames.push(skin.name);
      });
    });
  });

  return [...new Set(skinNames)]; // Remove duplicates
}

export async function getAllSkinsForSearch(): Promise<
  Array<{
    name: string;
    image: string;
    category: string;
    weapon: string;
    rarity: string;
    rarityColor: string;
    id: string;
  }>
> {
  const data = await getSkinsData();
  const skins: Array<{
    name: string;
    image: string;
    category: string;
    weapon: string;
    rarity: string;
    rarityColor: string;
    id: string;
  }> = [];

  Object.entries(data).forEach(([categoryName, category]) => {
    Object.entries(category).forEach(([weaponName, weaponSkins]) => {
      weaponSkins.forEach((skin) => {
        skins.push({
          name: skin.name,
          image: skin.image,
          category: categoryName,
          weapon: weaponName,
          rarity: skin.rarity.name,
          rarityColor: skin.rarity.color,
          id: skin.id,
        });
      });
    });
  });

  return skins;
}

export async function searchSkins(
  query: string
): Promise<{ skin: any; category: string; weapon: string }[]> {
  const data = await getSkinsData();
  const results: { skin: any; category: string; weapon: string }[] = [];

  Object.entries(data).forEach(([categoryName, category]) => {
    Object.entries(category).forEach(([weaponName, weaponSkins]) => {
      weaponSkins.forEach((skin) => {
        if (skin.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            skin,
            category: categoryName,
            weapon: weaponName,
          });
        }
      });
    });
  });

  return results;
}

export const getAgentsData = cache(async () => {
  const filePath = path.join(process.cwd(), "public", "agents.json");
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
});

export const getMusicKitsData = cache(async () => {
  const filePath = path.join(process.cwd(), "public", "music_kits.json");
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
});

export async function getAgentTeams(): Promise<string[]> {
  const data = await getAgentsData();
  return Object.keys(data);
}

export async function getAgentsForTeam(team: string) {
  const data = await getAgentsData();
  const correctKey = Object.keys(data).find(
    (key) => key.toLowerCase() === team.toLowerCase()
  );

  return correctKey ? data[correctKey] : null;
}
