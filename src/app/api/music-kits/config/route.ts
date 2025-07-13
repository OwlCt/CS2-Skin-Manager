import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for music kit config validation
const musicKitConfigSchema = z.object({
  team: z.union([z.literal(0), z.literal(2), z.literal(3)], {
    message: "Team must be 0 (both), 2 (Terrorist), or 3 (Counter-Terrorist)",
  }),
  defIndex: z.union([z.string(), z.number()]).transform((val) => {
    const parsed = typeof val === "string" ? parseInt(val) : val;
    if (isNaN(parsed)) {
      throw new Error("Invalid defIndex - must be a valid number");
    }
    return parsed;
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validation = musicKitConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { team, defIndex } = validation.data;

    const musicId = defIndex;

    if (team === 0) {
      const results = await Promise.all([
        prisma.wp_player_music.upsert({
          where: {
            steamid_weapon_team: {
              steamid: steamid,
              weapon_team: 2, // Terrorist
            },
          },
          update: { music_id: musicId },
          create: {
            steamid: steamid,
            weapon_team: 2,
            music_id: musicId,
          },
        }),
        prisma.wp_player_music.upsert({
          where: {
            steamid_weapon_team: {
              steamid: steamid,
              weapon_team: 3, // Counter-Terrorist
            },
          },
          update: { music_id: musicId },
          create: {
            steamid: steamid,
            weapon_team: 3,
            music_id: musicId,
          },
        }),
      ]);

      console.log("Music kit configuration saved for both teams:", {
        steamid,
        team,
        defIndex,
        musicId,
        results,
      });

      return NextResponse.json({
        success: true,
        message: "Music kit configuration saved successfully for both teams",
        data: results,
      });
    }

    const result = await prisma.wp_player_music.upsert({
      where: {
        steamid_weapon_team: {
          steamid: steamid,
          weapon_team: team,
        },
      },
      update: {
        music_id: musicId,
      },
      create: {
        steamid: steamid,
        weapon_team: team,
        music_id: musicId,
      },
    });

    console.log("Music kit configuration saved:", {
      steamid,
      team,
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

export async function GET() {
  try {
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

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
