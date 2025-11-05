/**
 * API Security utilities for request validation and protection
 */

import { NextResponse } from "next/server";

/**
 * Validate request size to prevent large payload attacks
 * @param request The incoming request
 * @param maxSizeBytes Maximum allowed size in bytes (default: 100KB)
 * @returns NextResponse with error if size exceeded, null if valid
 */
export async function validateRequestSize(
  request: Request,
  maxSizeBytes = 100 * 1024 // 100KB default
): Promise<NextResponse | null> {
  const contentLength = request.headers.get("content-length");

  // Check Content-Length header if present
  if (contentLength) {
    const size = Number.parseInt(contentLength, 10);
    if (size > maxSizeBytes) {
      return NextResponse.json(
        {
          error: "Request payload too large",
          message: `Maximum allowed size is ${maxSizeBytes} bytes`,
          maxSize: maxSizeBytes,
          receivedSize: size,
        },
        { status: 413 } // 413 Payload Too Large
      );
    }
  }

  // For requests without Content-Length, we'll need to read the body
  // and check its size (this is a backup check)
  try {
    const clone = request.clone();
    const text = await clone.text();
    const actualSize = new Blob([text]).size;

    if (actualSize > maxSizeBytes) {
      return NextResponse.json(
        {
          error: "Request payload too large",
          message: `Maximum allowed size is ${maxSizeBytes} bytes`,
          maxSize: maxSizeBytes,
          receivedSize: actualSize,
        },
        { status: 413 }
      );
    }
  } catch (error) {
    // If we can't read the body, let it pass and fail later if needed
    console.error("Error checking request size:", error);
  }

  return null;
}

/**
 * Common response for rate limit exceeded
 */
export function rateLimitExceededResponse(
  remaining: number,
  resetAt: Date
): NextResponse {
  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      remaining,
      resetAt: resetAt.toISOString(),
      retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000), // seconds
    },
    {
      status: 429, // 429 Too Many Requests
      headers: {
        "Retry-After": String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": resetAt.toISOString(),
      },
    }
  );
}

/**
 * Add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetAt: Date
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", resetAt.toISOString());
  return response;
}

/**
 * Validate JSON body size after parsing
 * Useful for checking the actual parsed object size
 */
export function validateJsonSize(
  data: unknown,
  maxSizeBytes = 100 * 1024
): { valid: boolean; size: number; error?: string } {
  try {
    const jsonString = JSON.stringify(data);
    const size = new Blob([jsonString]).size;

    if (size > maxSizeBytes) {
      return {
        valid: false,
        size,
        error: `JSON payload too large: ${size} bytes (max: ${maxSizeBytes} bytes)`,
      };
    }

    return { valid: true, size };
  } catch (error) {
    return {
      valid: false,
      size: 0,
      error: "Failed to validate JSON size",
    };
  }
}

/**
 * Standard error response for unauthorized requests
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message,
    },
    { status: 401 }
  );
}

/**
 * Standard error response for bad requests
 */
export function badRequestResponse(
  message: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error: "Bad Request",
      message,
      ...(details && { details }),
    },
    { status: 400 }
  );
}

/**
 * Standard error response for server errors
 */
export function serverErrorResponse(
  message = "Internal Server Error",
  error?: unknown
): NextResponse {
  // Log error for debugging (only log in development)
  if (process.env.NODE_ENV === "development" && error) {
    console.error("Server Error:", error);
  }

  return NextResponse.json(
    {
      error: "Internal Server Error",
      message,
      // Only include error details in development
      ...(process.env.NODE_ENV === "development" &&
        error && { details: String(error) }),
    },
    { status: 500 }
  );
}
