import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.clerk.com","another-domain.com"], // ✅ Allow Clerk profile images
  },
};

export default nextConfig;
