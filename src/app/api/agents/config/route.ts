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

// Zod schema for agent config validation
const agentConfigSchema = z.object({
  team: z.union([z.literal(2), z.literal(3)], {
    message: "Team must be 2 (Terrorist) or 3 (Counter-Terrorist)",
  }),
  modelPlayer: z.string().min(1, "Model player is required"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request size (max 50KB)
    const sizeError = await validateRequestSize(request, 50 * 1024);
    if (sizeError) {
      return sizeError;
    }

    // 2. Get steamId from session
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

    const validation = agentConfigSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse("Invalid request data", validation.error.issues);
    }

    const { team, modelPlayer } = validation.data;

    const updateData: any = {};

    if (team === 3) {
      updateData.agent_ct = modelPlayer;
    } else {
      updateData.agent_t = modelPlayer;
    }

    const result = await prisma.wp_player_agents.upsert({
      where: {
        steamid: steamid,
      },
      update: updateData,
      create: {
        steamid: steamid,
        agent_ct: team === 3 ? modelPlayer : null,
        agent_t: team === 2 ? modelPlayer : null,
      },
    });

    // Return success response with rate limit headers
    const response = NextResponse.json({
      success: true,
      message: "Agent configuration saved successfully",
      data: result,
    });

    return addRateLimitHeaders(
      response,
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );
  } catch (error) {
    console.error("Error saving agent configuration:", error);
    return serverErrorResponse("Failed to save agent configuration", error);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const steamid = session?.steamId;

    if (!steamid) {
      return unauthorizedResponse("Not authenticated. Please log in.");
    }

    // Get the current agent configuration
    const agentConfig = await prisma.wp_player_agents.findUnique({
      where: {
        steamid: steamid,
      },
    });

    return NextResponse.json({
      success: true,
      data: agentConfig,
    });
  } catch (error) {
    console.error("Error fetching agent configuration:", error);
    return serverErrorResponse("Failed to fetch agent configuration", error);
  }
}
