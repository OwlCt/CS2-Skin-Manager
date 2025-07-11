import { getAllSkinsForSearch } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const skins = await getAllSkinsForSearch();
    return NextResponse.json(skins);
  } catch (error) {
    console.error("Failed to fetch skins for search:", error);
    return NextResponse.json(
      { error: "Failed to fetch skins for search" },
      { status: 500 }
    );
  }
}
