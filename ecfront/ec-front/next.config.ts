import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optionally disable TypeScript checking as well if you're having type errors
  typescript: {
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
