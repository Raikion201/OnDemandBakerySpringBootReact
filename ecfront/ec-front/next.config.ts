import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optionally disable TypeScript checking as well if you're having type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Added output configuration for static exports
  output: 'standalone',
  // Environment variables that will be available to the browser
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  }
};

export default nextConfig;
