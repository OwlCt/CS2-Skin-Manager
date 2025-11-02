import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Image proxy API route
 * Caches images from Steam CDN to local filesystem
 * Images are permanently cached and never deleted
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing 'url' parameter" },
        { status: 400 }
      );
    }

    // Validate URL is from Steam CDN
    const allowedHosts = [
      "community.akamai.steamstatic.com",
      "cdn.steamstatic.com",
      "raw.githubusercontent.com",
      "cdn.jsdelivr.net",
    ];

    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    if (!allowedHosts.includes(url.hostname)) {
      return NextResponse.json(
        { error: "URL hostname not allowed" },
        { status: 403 }
      );
    }

    // Generate cache filename using hash of full URL
    const urlHash = crypto.createHash("md5").update(imageUrl).digest("hex");
    const fileExtension = path.extname(url.pathname) || ".jpg";
    const cacheFileName = `${urlHash}${fileExtension}`;
    const cachePath = path.join(
      process.cwd(),
      "public",
      "cache",
      "images",
      cacheFileName
    );

    // Check if image is already cached
    try {
      await fs.access(cachePath);
      // Image exists in cache, serve it
      const cachedImage = await fs.readFile(cachePath);
      const contentType = getContentType(fileExtension);

      return new NextResponse(cachedImage, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        },
      });
    } catch {
      // Image not in cache, fetch from Steam CDN
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch image: ${response.status}` },
          { status: response.status }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save to cache (permanent storage)
      await fs.writeFile(cachePath, buffer);

      const contentType = response.headers.get("Content-Type") || getContentType(fileExtension);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };

  return contentTypes[extension.toLowerCase()] || "image/jpeg";
}
