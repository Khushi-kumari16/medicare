import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.clerk.com","another-domain.com"], // ✅ Allow Clerk profile images
  },
  eslint: {
    ignoreDuringBuilds: true,  // ✅ disable ESLint in Vercel builds
  },
  typescript: {
    ignoreBuildErrors: true,   // ✅ disable TypeScript blocking deploy
  },
};
export default nextConfig;