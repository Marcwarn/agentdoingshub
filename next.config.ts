import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native Vercel builds must not access the Sites-only Cloudflare binding.
  turbopack: {
    resolveAlias: {
      "cloudflare:workers": "./lib/cloudflare-workers-unavailable.ts",
    },
  },
};

export default nextConfig;
