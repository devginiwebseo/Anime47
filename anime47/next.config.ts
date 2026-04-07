import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
     
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anime.datatruyen.online',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
