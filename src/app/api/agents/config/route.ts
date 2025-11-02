import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for agent config validation
const agentConfigSchema = z.object({
  team: z.union([z.literal(2), z.literal(3)], {
    message: "Team must be 2 (Terrorist) or 3 (Counter-Terrorist)",
  }),
  modelPlayer: z.string().min(1, "Model player is required"),
});

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

    // Validate request body with Zod
    const validation = agentConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Agent configuration saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving agent configuration:", error);
    return NextResponse.json(
      { error: "Failed to save agent configuration" },
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
    return NextResponse.json(
      { error: "Failed to fetch agent configuration" },
      { status: 500 }
    );
  }
}
