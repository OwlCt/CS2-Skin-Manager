import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

// Utility function to extract model path from model_player
const extractModelPath = (modelPlayer: string): string => {
  // Remove "characters/models/" prefix and ".vmdl" suffix
  const cleaned = modelPlayer
    .replace(/^characters\/models\//, "")
    .replace(/\.vmdl$/, "");
  return cleaned;
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

    const { team, modelPlayer } = body;

    // Validate required fields
    if (!team || !modelPlayer) {
      return NextResponse.json(
        {
          error: "Missing required fields: team, modelPlayer",
        },
        { status: 400 }
      );
    }

    // Validate team value
    if (team !== "ct" && team !== "t") {
      return NextResponse.json(
        {
          error: "Invalid team value. Must be 'ct' or 't'",
        },
        { status: 400 }
      );
    }

    // Extract the model path
    const agentModel = extractModelPath(modelPlayer);

    // Prepare the update data
    const updateData: any = {};
    if (team === "ct") {
      updateData.agent_ct = agentModel;
    } else {
      updateData.agent_t = agentModel;
    }

    // Use upsert to either create or update the agent configuration
    const result = await prisma.wp_player_agents.upsert({
      where: {
        steamid: steamid,
      },
      update: updateData,
      create: {
        steamid: steamid,
        agent_ct: team === "ct" ? agentModel : null,
        agent_t: team === "t" ? agentModel : null,
      },
    });

    console.log("Agent configuration saved:", {
      steamid,
      team,
      agentModel,
      result,
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
