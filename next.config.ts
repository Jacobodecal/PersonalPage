import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate consistent build IDs to prevent Server Action mismatch errors
  generateBuildId: async () => {
    // Use git commit hash if available (Cloudflare Workers Builds), otherwise timestamp
    return process.env.WORKERS_CI_COMMIT_SHA || Date.now().toString();
  },

  // www.jacobodecal.com -> jacobodecal.com (both routed to the Worker)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.jacobodecal.com' }],
        destination: 'https://jacobodecal.com/:path*',
        permanent: true,
      },
    ];
  },

  // Optimize cache headers to prevent stale JS bundles in production.
  // Scoped to production only: in dev this same header made browsers hold
  // onto old chunks across server restarts, causing "Cannot read properties
  // of undefined (reading 'call')" module-mismatch errors.
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Exposes Cloudflare bindings (D1, secrets) to `next dev` via getCloudflareContext
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
