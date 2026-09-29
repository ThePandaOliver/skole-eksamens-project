import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: "http://localhost:3001/assets/:path*",
      },
    ];
  },
};

export default nextConfig;
