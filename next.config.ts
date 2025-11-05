import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
