import { NextRequest, NextResponse } from "next/server";
import { RelyingParty } from "openid";
import { getSession } from "@/lib/session";
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await getSession();

  try {
    // Rate limiting for callback attempts (5 per 15 minutes per IP)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = authRateLimiter.check(clientId);

    if (rateLimitResult.limited) {
      return NextResponse.redirect(
        new URL("/?error=rate_limit_exceeded", process.env.NEXT_PUBLIC_URL)
      );
    }
    const relyingParty = new RelyingParty(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/steam`,
      process.env.NEXT_PUBLIC_URL!,
      true,
      false,
      []
    );

    const result = await new Promise<{
      authenticated: boolean;
      claimedIdentifier?: string;
    }>((resolve, reject) => {
      relyingParty.verifyAssertion(req.url, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            result as { authenticated: boolean; claimedIdentifier?: string }
          );
        }
      });
    });

    if (!result.authenticated) {
      throw new Error("Steam authentication failed.");
    }

    const steamId = result.claimedIdentifier!.split("/").pop()!;

    // Use Steam API to get user details
    const userResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    const userData = await userResponse.json();
    const player = userData.response.players[0];

    // Save user data to the session
    session.steamId = player.steamid;
    session.username = player.personaname;
    session.avatar = player.avatarfull;
    await session.save();

    // Redirect to the main application
    return NextResponse.redirect(
      new URL("/gloves", process.env.NEXT_PUBLIC_URL)
    );
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=steam_callback_failed", process.env.NEXT_PUBLIC_URL)
    );
  }
}
