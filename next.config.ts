import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static generation for pages that need env vars
  output: 'standalone',
  
  // External packages for server components
  serverExternalPackages: ['stripe'],
};

export default nextConfig;
