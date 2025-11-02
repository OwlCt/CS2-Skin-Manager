/**
 * Utility functions for image proxy and caching
 */

/**
 * Converts a Steam CDN URL to a proxied URL through our image cache API
 * @param originalUrl - The original Steam CDN URL
 * @returns Proxied URL that serves cached images
 */
export function getProxiedImageUrl(originalUrl: string): string {
  // Skip empty URLs
  if (!originalUrl) {
    return originalUrl;
  }

  // Check if URL is from a CDN that we want to proxy
  const shouldProxy = [
    "community.akamai.steamstatic.com",
    "cdn.steamstatic.com",
  ].some((host) => originalUrl.includes(host));

  if (!shouldProxy) {
    return originalUrl;
  }

  // Return proxied URL
  const encodedUrl = encodeURIComponent(originalUrl);
  return `/api/image-proxy?url=${encodedUrl}`;
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
    for (const [key, value] of Object.entries(data)) {
      if (key === "image" && typeof value === "string") {
        result[key] = getProxiedImageUrl(value);
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
