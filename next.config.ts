import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate consistent build IDs to prevent Server Action mismatch errors
  generateBuildId: async () => {
    // Use git commit hash if available, otherwise timestamp
    return process.env.RAILWAY_GIT_COMMIT_SHA || Date.now().toString();
  },

  // Optimize cache headers to prevent stale JS bundles
  async headers() {
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
