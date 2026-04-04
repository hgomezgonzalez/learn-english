import type { NextConfig } from "next";

const buildDate = new Date().toLocaleString("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const nextConfig: NextConfig = {
  env: {
    BUILD_VERSION: `v1.1 — ${buildDate}`,
  },
};

export default nextConfig;
