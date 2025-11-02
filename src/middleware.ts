import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // If the user is not logged in and trying to access a protected route
  if (!session.steamId && request.nextUrl.pathname.startsWith("/")) {
    // Allow access to API routes and the root login page
    if (
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname === "/"
    ) {
      return NextResponse.next();
    }
    // Redirect all other requests to the login page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is logged in and tries to visit the login page, redirect them to the app
  if (session.steamId && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/gloves", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};
