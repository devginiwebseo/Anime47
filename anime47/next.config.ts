import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'anime47.onl',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
