import { getSkinsData } from "@/lib/data";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    const skins = await getSkinsData();

    // If no query parameter, return all skins (for initial load)
    if (!query) {
      return NextResponse.json(skins);
    }

    // Filter skins based on query
    const filteredSkins = skins
      .filter(
        (skin) =>
          (skin.paint_name &&
            skin.paint_name.toLowerCase().includes(query.toLowerCase())) ||
          (skin.weapon_name &&
            skin.weapon_name.toLowerCase().includes(query.toLowerCase())) ||
          (skin.category &&
            skin.category.toLowerCase().includes(query.toLowerCase()))
      )
      .map((skin) => ({
        ...skin,
        name: skin.paint_name || "Unknown Skin",
      }));

    return NextResponse.json(filteredSkins);
  } catch (error) {
    console.error("Failed to fetch skins for search:", error);
    return NextResponse.json(
      { error: "Failed to fetch skins for search" },
      { status: 500 }
    );
  }
}
