import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dealer/login",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/dealer/login",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/dealer/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;