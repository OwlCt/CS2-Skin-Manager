import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
