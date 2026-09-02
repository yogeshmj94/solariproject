import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@solarisdk/browser",
    "patchright",
    "patchright-core",
    "chromium-bidi",
  ],
};

export default nextConfig;
