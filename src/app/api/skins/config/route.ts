import { getSession } from "@/lib/session";
import { getKnifeName, isGlove, isKnife } from "@/lib/weapons";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    const configSchema = z.object({
      weaponDefindex: z.int().min(1),
      weaponPaintId: z.int(),
      weaponTeam: z.union([z.literal(0), z.literal(2), z.literal(3)]),
      wear: z.float32().min(0).max(1),
      seed: z.string().min(1).max(1000),
      nametag: z.string().optional().nullable(),
      stattrak: z.union([z.string(), z.boolean()]).optional(),
      stattrakCount: z.string().optional(),
      stickers: z.array(z.string()).length(5).optional(),
      keychain: z.string().optional(),
    });

    const parseResult = configSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }
    const {
      weaponDefindex,
      weaponPaintId,
      weaponTeam,
      wear,
      seed,
      nametag,
      stattrak,
      stattrakCount,
      stickers,
      keychain,
    } = parseResult.data;

    const isKnifeWeapon = isKnife(weaponDefindex);
    const isGloveWeapon = isGlove(weaponDefindex);

    const teams = weaponTeam === 0 ? [2, 3] : [weaponTeam];

    if (isKnifeWeapon) {
      for (const team of teams) {
        const knifeData = {
          steamid,
          weapon_team: team,
          knife: getKnifeName(weaponDefindex),
        };
        await prisma.wp_player_knife.upsert({
          where: {
            steamid_weapon_team: {
              steamid,
              weapon_team: team,
            },
          },
          update: knifeData,
          create: knifeData,
        });
      }
    }

    if (isGloveWeapon) {
      for (const team of teams) {
        const gloveData = {
          steamid,
          weapon_team: team,
          weapon_defindex: weaponDefindex,
        };
        await prisma.wp_player_gloves.upsert({
          where: {
            steamid_weapon_team: {
              steamid,
              weapon_team: team,
            },
          },
          update: gloveData,
          create: gloveData,
        });
      }
    }

    for (const team of teams) {
      const skinData = {
        steamid,
        weapon_team: team,
        weapon_defindex: weaponDefindex,
        weapon_paint_id: weaponPaintId,
        weapon_wear: wear,
        weapon_seed: parseInt(seed) || 0,
        weapon_nametag: nametag || null,
        weapon_stattrak: Boolean(stattrak) || false,
        weapon_stattrak_count: parseInt(stattrakCount ?? "0") || 0,
        weapon_sticker_0: stickers?.[0] || "0;0;0;0;0;0;0",
        weapon_sticker_1: stickers?.[1] || "0;0;0;0;0;0;0",
        weapon_sticker_2: stickers?.[2] || "0;0;0;0;0;0;0",
        weapon_sticker_3: stickers?.[3] || "0;0;0;0;0;0;0",
        weapon_sticker_4: stickers?.[4] || "0;0;0;0;0;0;0",
        weapon_keychain: keychain || "0;0;0;0;0",
      };

      await prisma.wp_player_skins.upsert({
        where: {
          steamid_weapon_team_weapon_defindex: {
            steamid,
            weapon_team: team,
            weapon_defindex: weaponDefindex,
          },
        },
        update: {
          weapon_paint_id: weaponPaintId,
          weapon_wear: wear,
          weapon_seed: parseInt(seed) || 0,
          weapon_nametag: nametag || null,
          weapon_stattrak: Boolean(stattrak) || false,
          weapon_stattrak_count: parseInt(stattrakCount ?? "0") || 0,
          weapon_sticker_0: stickers?.[0] || "0;0;0;0;0;0;0",
          weapon_sticker_1: stickers?.[1] || "0;0;0;0;0;0;0",
          weapon_sticker_2: stickers?.[2] || "0;0;0;0;0;0;0",
          weapon_sticker_3: stickers?.[3] || "0;0;0;0;0;0;0",
          weapon_sticker_4: stickers?.[4] || "0;0;0;0;0;0;0",
          weapon_keychain: keychain || "0;0;0;0;0",
        },
        create: skinData,
      });
    }

    return NextResponse.json(
      {
        message: "Skin configuration saved successfully",
        affectedTeams: teams,
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

    const [skins, knives, gloves] = await Promise.all([
      prisma.wp_player_skins.findMany({
        where: { steamid },
        orderBy: [{ weapon_team: "asc" }, { weapon_defindex: "asc" }],
      }),
      prisma.wp_player_knife.findMany({ where: { steamid } }),
      prisma.wp_player_gloves.findMany({ where: { steamid } }),
    ]);

    return NextResponse.json({ skins, knives, gloves }, { status: 200 });
  } catch (error) {
    console.error("Error fetching skin configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch skin configurations" },
      { status: 500 }
    );
  }
}
