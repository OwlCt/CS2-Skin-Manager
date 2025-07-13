import { Skins } from "@/types/skins";
import { promises as fs } from "fs";
import path from "path";

async function getSkinsData(): Promise<Skins[]> {
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
