import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get steamId from session
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { team, defIndex } = body;

    // Validate required fields
    if (!team || !defIndex) {
      return NextResponse.json(
        { error: "Missing required fields: team, defIndex" },
        { status: 400 }
      );
    }

    // Validate team value
    if (team !== "ct" && team !== "t") {
      return NextResponse.json(
        { error: "Invalid team value. Must be 'ct' or 't'" },
        { status: 400 }
      );
    }

    // Convert team to weapon_team values (2 = T, 3 = CT)
    const weaponTeam = team === "t" ? 2 : 3;

    // Convert defIndex to number
    const musicId = parseInt(defIndex);
    if (isNaN(musicId)) {
      return NextResponse.json(
        { error: "Invalid def_index. Must be a number." },
        { status: 400 }
      );
    }

    // Use upsert to either create or update the music kit configuration for the specific team
    const result = await prisma.wp_player_music.upsert({
      where: {
        steamid_weapon_team: {
          steamid: steamid,
          weapon_team: weaponTeam,
        },
      },
      update: {
        music_id: musicId,
      },
      create: {
        steamid: steamid,
        weapon_team: weaponTeam,
        music_id: musicId,
      },
    });

    console.log("Music kit configuration saved:", {
      steamid,
      team,
      weaponTeam,
      defIndex,
      musicId,
      result,
    });

    return NextResponse.json({
      success: true,
      message: "Music kit configuration saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving music kit configuration:", error);
    return NextResponse.json(
      { error: "Failed to save music kit configuration" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get steamId from session
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    // Get the current music kit configuration for both teams
    const musicConfigs = await prisma.wp_player_music.findMany({
      where: {
        steamid: steamid,
      },
    });

    return NextResponse.json({
      success: true,
      data: musicConfigs,
    });
  } catch (error) {
    console.error("Error fetching music kit configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch music kit configuration" },
      { status: 500 }
    );
  }
}
