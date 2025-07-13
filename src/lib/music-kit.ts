import path from "path";
import fs from "fs";
import { MusicKit } from "@/types/music-kit";

export function getMusicKits(): MusicKit[] {
  const kitsPath = path.resolve(process.cwd(), "data/music_kits.json");
  const raw = fs.readFileSync(kitsPath, "utf-8");
  return JSON.parse(raw);
}
