import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the dev server chrome-free: the floating Next.js dev-tools badge is
  // disabled so screenshots and screen shares show the real UI only.
  devIndicators: false,
};

export default nextConfig;
