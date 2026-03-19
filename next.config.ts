import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "artworks.thetvdb.com",
      },
      {
        protocol: "https",
        hostname: "*.thetvdb.com",
      },
    ],
  },
};

export default nextConfig;
