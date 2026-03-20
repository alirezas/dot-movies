import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: version,
  },
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
