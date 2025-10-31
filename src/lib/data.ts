import { promises as fs } from "node:fs";
import { Agent } from "@/types/agent";
import path from "node:path";
import { MusicKit } from "@/types/music-kit";
import { Skins } from "@/types/skins";
import { Sticker } from "@/types/sticker";
import { Keychain } from "@/types/keychain";

export async function getSkinsData(): Promise<Skins[]> {
  const filePath = path.join(process.cwd(), "data", "skins.json");
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

export async function getWeaponsForCategory(
  category: string
): Promise<string[]> {
  const data = await getSkinsData();
  const categoryData = data.filter(
    (skin) => skin.category.toLowerCase() === category.toLowerCase()
  );

  const uniqueNames = new Set<string>();

  for (const skin of categoryData) {
    uniqueNames.add(skin.weapon_name);
  }

  return Array.from(uniqueNames);
}

export async function getSkinsForWeapon(weaponKey: string): Promise<Skins[]> {
  const data = await getSkinsData();
  return data.filter(
    (skin) =>
      skin.weapon_name.toLowerCase() === weaponKey.toLowerCase() &&
      !skin.weapon_name.startsWith("sfui")
  );
}

export async function getSkinByPaintId(
  weaponKey: string,
  paintId: number
): Promise<Skins | null> {
  const skins = await getSkinsForWeapon(weaponKey);
  return skins.find((skin) => skin.paint === paintId) || null;
}

export async function getCategories(): Promise<Record<string, string[]>> {
  const filePath = path.join(process.cwd(), "data", "categories.json");
  const file = await fs.readFile(filePath, "utf8");

  return JSON.parse(file);
}

export async function getBaseWeapons() {
  const filePath = path.join(process.cwd(), "data", "base_weapons.json");
  const file = await fs.readFile(filePath, "utf8");

  return JSON.parse(file) as Record<string, Record<string, string>>;
}

export async function loadAgents(): Promise<Agent[]> {
  const agentsPath = path.resolve(process.cwd(), "data/agents.json");
  const raw = await fs.readFile(agentsPath, "utf-8");
  return JSON.parse(raw);
}

export function getAgentTeamsMap(): Record<string, string> {
  return {
    "counter-terrorists": "Counter-Terrorists",
    terrorists: "Terrorists",
  };
}

export async function getAgentsByTeam(): Promise<Record<string, Agent[]>> {
  const agents = await loadAgents();
  // Team numbers: 2 = T, 3 = CT
  const teamMap: Record<string, Agent[]> = {
    terrorists: [],
    "counter-terrorists": [],
  };

  for (const agent of agents) {
    if (agent.team === 2) {
      teamMap.terrorists.push(agent);
    } else {
      teamMap["counter-terrorists"].push(agent);
    }
  }

  return teamMap;
}

export async function getMusicKits(): Promise<MusicKit[]> {
  const kitsPath = path.join(process.cwd(), "data/music_kits.json");
  const raw = await fs.readFile(kitsPath, "utf-8");
  return JSON.parse(raw);
}

export async function getStickers(): Promise<Sticker[]> {
  const stickersPath = path.join(process.cwd(), "data/stickers.json");
  const raw = await fs.readFile(stickersPath, "utf-8");
  return JSON.parse(raw);
}

export async function getKeychains(): Promise<Keychain[]> {
  const keychainsPath = path.join(process.cwd(), "data/keychains.json");
  const raw = await fs.readFile(keychainsPath, "utf-8");
  return JSON.parse(raw);
}
