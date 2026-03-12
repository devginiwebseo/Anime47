import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'anime47.tv',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
