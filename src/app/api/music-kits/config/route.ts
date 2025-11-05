import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";
import {
  validateRequestSize,
  rateLimitExceededResponse,
  addRateLimitHeaders,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-security";
import { writeRateLimiter } from "@/lib/rate-limit";

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
    // 1. Validate request size (max 50KB)
    const sizeError = await validateRequestSize(request, 50 * 1024);
    if (sizeError) {
      return sizeError;
    }

    // 2. Get session and check authentication
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return unauthorizedResponse("Not authenticated. Please log in.");
    }

    // 3. Rate limiting (30 requests per minute per user)
    const rateLimitResult = writeRateLimiter.check(steamid);
    if (rateLimitResult.limited) {
      return rateLimitExceededResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetAt
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();

    const validation = musicKitConfigSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse("Invalid request data", validation.error.issues);
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

      // Return success response with rate limit headers (both teams)
      const response = NextResponse.json({
        success: true,
        message: "Music kit configuration saved successfully for both teams",
        data: results,
      });

      return addRateLimitHeaders(
        response,
        rateLimitResult.remaining,
        rateLimitResult.resetAt
      );
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

    // Return success response with rate limit headers
    const response = NextResponse.json({
      success: true,
      message: "Music kit configuration saved successfully",
      data: result,
    });

    return addRateLimitHeaders(
      response,
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  } catch (error) {
    console.error("Error saving music kit configuration:", error);
    return serverErrorResponse("Failed to save music kit configuration", error);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return unauthorizedResponse("Not authenticated. Please log in.");
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
    return serverErrorResponse("Failed to fetch music kit configuration", error);
  }
}
