import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@solarisdk/browser",
    "patchright",
    "patchright-core",
    "chromium-bidi",
  ],
  outputFileTracingIncludes: {
    "/api/shipments/investigate": [
      "./node_modules/@solarisdk/browser/**/*",
      "./node_modules/patchright-core/**/*",
      "./node_modules/chromium-bidi/**/*",
    ],
    "/api/solari/verify": [
      "./node_modules/@solarisdk/browser/**/*",
      "./node_modules/patchright-core/**/*",
      "./node_modules/chromium-bidi/**/*",
    ],
  },
};

export default nextConfig;
