/**
 * Utility functions for image proxy and caching
 */

/**
 * Checks if image caching is enabled via environment variable
 * @returns true if caching is enabled, false otherwise
 */
function isCacheEnabled(): boolean {
  // Default to true if not specified
  const cacheEnabled = process.env.ENABLE_IMAGE_CACHE;
  return cacheEnabled !== "false";
}

/**
 * Converts a Steam CDN URL to a proxied URL through our image cache API
 * @param originalUrl - The original Steam CDN URL
 * @param category - Optional category for organized cache storage
 * @param weapon - Optional weapon name for organized cache storage
 * @returns Proxied URL that serves cached images, or original URL if caching is disabled
 */
export function getProxiedImageUrl(
  originalUrl: string,
  category?: string,
  weapon?: string
): string {
  // Skip empty URLs
  if (!originalUrl) {
    return originalUrl;
  }

  // If caching is disabled, return original URL
  if (!isCacheEnabled()) {
    return originalUrl;
  }

  // Check if URL is from a CDN that we want to proxy
  const shouldProxy = [
    "community.akamai.steamstatic.com",
    "cdn.steamstatic.com",
    "cdn.jsdelivr.net",
  ].some((host) => originalUrl.includes(host));

  if (!shouldProxy) {
    return originalUrl;
  }

  // Build proxied URL with optional category and weapon parameters
  const encodedUrl = encodeURIComponent(originalUrl);
  let proxyUrl = `/api/image-proxy?url=${encodedUrl}`;

  if (category) {
    proxyUrl += `&category=${encodeURIComponent(category)}`;
  }

  if (weapon) {
    proxyUrl += `&weapon=${encodeURIComponent(weapon)}`;
  }

  return proxyUrl;
}

/**
 * Determines the cache category and subcategory for different data types
 * @param obj - The data object
 * @returns Object with category and subcategory for cache organization
 */
function getCacheLocation(obj: any): { category?: string; subcategory?: string } {
  // Weapon skins: category/weapon_name
  if (obj.category && obj.weapon_name) {
    return {
      category: obj.category,
      subcategory: obj.weapon_name,
    };
  }

  // Agents: agents/team (terrorists or counter-terrorists)
  if (obj.team !== undefined && obj.model) {
    const teamName = obj.team === 2 ? "terrorists" : obj.team === 3 ? "counter-terrorists" : "unknown";
    return {
      category: "agents",
      subcategory: teamName,
    };
  }

  // Music Kits: music-kits/
  if (obj.id && typeof obj.id === "string" && obj.id.startsWith("music_kit-")) {
    return {
      category: "music-kits",
      subcategory: undefined, // Flat structure for music kits
    };
  }

  // Keychains: keychains/collection_name
  if (obj.id && typeof obj.id === "string" && obj.id.startsWith("keychain-") && obj.collections && obj.collections.length > 0) {
    const collectionName = obj.collections[0].name
      .replace(/Charm Collection/gi, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    return {
      category: "keychains",
      subcategory: collectionName,
    };
  }

  // Stickers: stickers/tournament_name or stickers/type
  if (obj.id && typeof obj.id === "string" && obj.id.startsWith("sticker-")) {
    let subcategory = "other";

    if (obj.tournament && obj.tournament.name) {
      subcategory = obj.tournament.name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_");
    } else if (obj.type) {
      subcategory = obj.type.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    }

    return {
      category: "stickers",
      subcategory: subcategory,
    };
  }

  return {};
}

/**
 * Batch convert image URLs in an object or array
 * @param data - Data containing image URLs
 * @returns Data with proxied URLs
 */
export function proxyImageUrls<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => proxyImageUrls(item)) as T;
  }

  if (typeof data === "object" && data !== null) {
    const result: any = {};
    const obj = data as any;

    // Determine cache location based on data type
    const { category, subcategory } = getCacheLocation(obj);

    for (const [key, value] of Object.entries(data)) {
      if (key === "image" && typeof value === "string") {
        // Pass category and subcategory info for organized cache storage
        result[key] = getProxiedImageUrl(value, category, subcategory);
      } else if (typeof value === "object") {
        result[key] = proxyImageUrls(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return data;
}
