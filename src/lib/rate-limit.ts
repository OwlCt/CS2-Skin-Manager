/**
 * Simple in-memory rate limiter using sliding window algorithm
 * Suitable for single-server deployments
 *
 * For multi-server deployments, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional: Clean up old entries every N minutes (default: 10)
   */
  cleanupIntervalMinutes?: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;

    // Set up periodic cleanup to prevent memory leaks
    const cleanupIntervalMs = (options.cleanupIntervalMinutes || 10) * 60 * 1000;
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier Unique identifier (e.g., IP address, user ID, Steam ID)
   * @returns { limited: boolean, remaining: number, resetAt: Date }
   */
  check(identifier: string): {
    limited: boolean;
    remaining: number;
    resetAt: Date;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create entry
    let entry = this.store.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(identifier, entry);
    }

    // Remove timestamps outside the window (sliding window)
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    const currentCount = entry.timestamps.length;
    const limited = currentCount >= this.maxRequests;

    if (!limited) {
      // Add current timestamp
      entry.timestamps.push(now);
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, this.maxRequests - currentCount - (limited ? 0 : 1));
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetAt = new Date(oldestTimestamp + this.windowMs);

    return {
      limited,
      remaining,
      resetAt,
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, entry] of this.store.entries()) {
      // Remove timestamps outside the window
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

      // If no timestamps left, delete the entry
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current store size (for debugging)
   */
  getStoreSize(): number {
    return this.store.size;
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Pre-configured rate limiters for different use cases

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  cleanupIntervalMinutes: 30,
});

/**
 * Moderate rate limiter for write operations (config saves)
 * 30 requests per 1 minute per user
 */
export const writeRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  cleanupIntervalMinutes: 10,
});

/**
 * Lenient rate limiter for read operations (search, image proxy)
 * 100 requests per 1 minute per user/IP
 */
export const readRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  cleanupIntervalMinutes: 10,
});

/**
 * Helper function to get client identifier from request
 * Tries to get real IP from various headers (for reverse proxy scenarios)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Return first available identifier
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  // Fallback to a generic identifier if no IP found
  return "unknown";
}

export { RateLimiter };
export type { RateLimitOptions };
