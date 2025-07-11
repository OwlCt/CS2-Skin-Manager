import { RelyingParty } from "openid";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
