import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BUILD_VERSION: `v1.1 — ${new Date().toISOString().replace("T", " ").slice(0, 16)}`,
  },
};

export default nextConfig;
