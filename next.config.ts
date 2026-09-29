import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    domains: ['localhost'],
  }
};

export default nextConfig;
