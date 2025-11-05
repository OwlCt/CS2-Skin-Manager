import { RelyingParty } from "openid";
import { NextRequest, NextResponse } from "next/server";
import {
  rateLimitExceededResponse,
  serverErrorResponse,
} from "@/lib/api-security";
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for authentication attempts (5 per 15 minutes per IP)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = authRateLimiter.check(clientId);

    if (rateLimitResult.limited) {
      // For auth endpoints, redirect to home with error instead of JSON response
      return NextResponse.redirect(
        new URL(
          "/?error=rate_limit_exceeded",
          process.env.NEXT_PUBLIC_URL
        )
      );
    }
    const relyingParty = new RelyingParty(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/steam`, // Callback URL
      process.env.NEXT_PUBLIC_URL!, // Realm
      true, // Use stateless verification
      false, // Strict mode
      [] // Extensions
    );

    return new Promise((resolve) => {
      relyingParty.authenticate(
        "https://steamcommunity.com/openid",
        false,
        (err, authUrl) => {
          if (err || !authUrl) {
            console.error("Steam login error:", err);
            resolve(
              NextResponse.redirect(
                new URL(
                  "/?error=steam_login_failed",
                  process.env.NEXT_PUBLIC_URL
                )
              )
            );
          } else {
            resolve(NextResponse.redirect(authUrl));
          }
        }
      );
    });
  } catch (error) {
    console.error("Steam login error:", error);
    return NextResponse.redirect(
      new URL("/?error=steam_login_failed", process.env.NEXT_PUBLIC_URL)
    );
  }
}
