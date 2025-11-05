import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable gzip compression for all responses (reduces translation file size by ~80%)
  compress: true,
  images: {
    remotePatterns: [
      {
        hostname: "raw.githubusercontent.com",
      },
      {
        hostname: "cdn.jsdelivr.net",
      },
      {
        hostname: "community.akamai.steamstatic.com",
      },
      {
        hostname: "cdn.steamstatic.com",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
