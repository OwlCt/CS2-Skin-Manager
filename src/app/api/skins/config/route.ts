import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";
import {
  KNIFE_DEFINDEXES,
  GLOVE_DEFINDEXES,
  getKnifeName,
  getGloveName,
  isKnife,
  isGlove,
} from "@/lib/weapon-mappings";

const prisma = new PrismaClient();

// Utility function to convert team string to weapon_team numbers
const getWeaponTeams = (teamValue: string): number[] => {
  switch (teamValue) {
    case "ct":
      return [3]; // Counter-Terrorists only
    case "t":
      return [2]; // Terrorists only
    case "both":
      return [2, 3]; // Both teams (separate records)
    default:
      return [2, 3]; // Default: separate records for both teams
  }
};

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

    const {
      weaponDefindex,
      weaponPaintId,
      team,
      wear,
      seed,
      nametag,
      stattrak,
      stattrakCount,
    } = body;

    // Validate required fields (steamid no longer needed in body)
    if (!weaponDefindex || !weaponPaintId) {
      return NextResponse.json(
        {
          error: "Missing required fields: weaponDefindex, weaponPaintId",
        },
        { status: 400 }
      );
    }

    // Check if this is a knife or glove using imported functions
    const weaponDefindexNum = parseInt(weaponDefindex);
    const isKnifeWeapon = isKnife(weaponDefindexNum);
    const isGloveWeapon = isGlove(weaponDefindexNum);

    // Convert team string to weapon_team number (using utility function)
    const weaponTeams = getWeaponTeams(team);

    if (isKnifeWeapon) {
      // Handle knife change - knives go to wp_player_knife table
      const knifeResults = [];

      for (const weaponTeam of weaponTeams) {
        const knifeData = {
          steamid,
          weapon_team: weaponTeam,
          knife: getKnifeName(weaponDefindexNum), // Use proper knife name
        };

        const knifeResult = await prisma.wp_player_knife.upsert({
          where: {
            steamid_weapon_team: {
              steamid,
              weapon_team: weaponTeam,
            },
          },
          update: {
            knife: knifeData.knife,
          },
          create: knifeData,
        });

        knifeResults.push(knifeResult);
      }
    }

    if (isGloveWeapon) {
      // Handle glove change - gloves go to wp_player_gloves table
      const gloveResults = [];

      for (const weaponTeam of weaponTeams) {
        const gloveData = {
          steamid,
          weapon_team: weaponTeam,
          weapon_defindex: weaponDefindexNum,
        };

        const gloveResult = await prisma.wp_player_gloves.upsert({
          where: {
            steamid_weapon_team: {
              steamid,
              weapon_team: weaponTeam,
            },
          },
          update: {
            weapon_defindex: gloveData.weapon_defindex,
          },
          create: gloveData,
        });

        gloveResults.push(gloveResult);
      }
    }

    // Prepare the data for each team (using weaponTeams defined above)
    const operations = weaponTeams.map(async (weaponTeam) => {
      const skinData = {
        steamid,
        weapon_team: weaponTeam,
        weapon_defindex: parseInt(weaponDefindex),
        weapon_paint_id: parseInt(weaponPaintId),
        weapon_wear: parseFloat(wear) || 0.000001,
        weapon_seed: parseInt(seed) || 0,
        weapon_nametag: nametag || null,
        weapon_stattrak: Boolean(stattrak) || false,
        weapon_stattrak_count: parseInt(stattrakCount) || 0,
        // Keep default values for stickers and keychain
        weapon_sticker_0: "0;0;0;0;0;0;0",
        weapon_sticker_1: "0;0;0;0;0;0;0",
        weapon_sticker_2: "0;0;0;0;0;0;0",
        weapon_sticker_3: "0;0;0;0;0;0;0",
        weapon_sticker_4: "0;0;0;0;0;0;0",
        weapon_keychain: "0;0;0;0;0",
      };

      // Use upsert to either create or update the skin configuration
      return prisma.wp_player_skins.upsert({
        where: {
          steamid_weapon_team_weapon_defindex: {
            steamid,
            weapon_team: weaponTeam,
            weapon_defindex: parseInt(weaponDefindex),
          },
        },
        update: {
          weapon_paint_id: parseInt(weaponPaintId),
          weapon_wear: parseFloat(wear) || 0.000001,
          weapon_seed: parseInt(seed) || 0,
          weapon_nametag: nametag || null,
          weapon_stattrak: Boolean(stattrak) || false,
          weapon_stattrak_count: parseInt(stattrakCount) || 0,
        },
        create: skinData,
      });
    });

    // Execute all operations
    const results = await Promise.all(operations);

    return NextResponse.json(
      {
        message: "Skin configuration saved successfully",
        affectedTeams: weaponTeams,
        results: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving skin configuration:", error);
    return NextResponse.json(
      { error: "Failed to save skin configuration" },
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

    // Get all skin configurations for the user
    const skins = await prisma.wp_player_skins.findMany({
      where: {
        steamid,
      },
      orderBy: [{ weapon_team: "asc" }, { weapon_defindex: "asc" }],
    });

    // Get knife configurations for the user
    const knives = await prisma.wp_player_knife.findMany({
      where: {
        steamid,
      },
    });

    // Get glove configurations for the user
    const gloves = await prisma.wp_player_gloves.findMany({
      where: {
        steamid,
      },
    });

    return NextResponse.json({ skins, knives, gloves }, { status: 200 });
  } catch (error) {
    console.error("Error fetching skin configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch skin configurations" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { weaponDefindex, team } = body;

    if (!weaponDefindex) {
      return NextResponse.json(
        { error: "Missing required field: weaponDefindex" },
        { status: 400 }
      );
    }

    // Check if this is a knife or glove using imported functions
    const weaponDefindexNum = parseInt(weaponDefindex);
    const isKnifeWeapon = isKnife(weaponDefindexNum);
    const isGloveWeapon = isGlove(weaponDefindexNum);

    if (isKnifeWeapon) {
      // Delete knife configuration for specified teams (using utility function)
      const weaponTeams = getWeaponTeams(team);

      const deleteOperations = weaponTeams.map((weaponTeam: number) =>
        prisma.wp_player_knife.deleteMany({
          where: {
            steamid,
            weapon_team: weaponTeam,
          },
        })
      );

      const results = await Promise.all(deleteOperations);
      const totalDeleted = results.reduce(
        (sum: number, result: any) => sum + result.count,
        0
      );

      return NextResponse.json(
        {
          message: "Knife configuration deleted successfully",
          type: "knife",
          affectedTeams: weaponTeams,
          deletedCount: totalDeleted,
        },
        { status: 200 }
      );
    }

    if (isGloveWeapon) {
      // Delete glove configuration for specified teams (using utility function)
      const weaponTeams = getWeaponTeams(team);

      const deleteOperations = weaponTeams.map((weaponTeam: number) =>
        prisma.wp_player_gloves.deleteMany({
          where: {
            steamid,
            weapon_team: weaponTeam,
          },
        })
      );

      const results = await Promise.all(deleteOperations);
      const totalDeleted = results.reduce(
        (sum: number, result: any) => sum + result.count,
        0
      );

      return NextResponse.json(
        {
          message: "Glove configuration deleted successfully",
          type: "glove",
          affectedTeams: weaponTeams,
          deletedCount: totalDeleted,
        },
        { status: 200 }
      );
    }

    // Delete skin configurations for specified teams (using utility function)
    const weaponTeams = getWeaponTeams(team);
    const deleteOperations = weaponTeams.map((weaponTeam) =>
      prisma.wp_player_skins.deleteMany({
        where: {
          steamid,
          weapon_team: weaponTeam,
          weapon_defindex: parseInt(weaponDefindex),
        },
      })
    );

    const results = await Promise.all(deleteOperations);
    const totalDeleted = results.reduce((sum, result) => sum + result.count, 0);

    return NextResponse.json(
      {
        message: "Skin configuration deleted successfully",
        deletedCount: totalDeleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting skin configuration:", error);
    return NextResponse.json(
      { error: "Failed to delete skin configuration" },
      { status: 500 }
    );
  }
}
