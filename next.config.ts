import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'github.com',
      'images.unsplash.com',
      'example.com',
      'res.cloudinary.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'media.rawg.io',
      'shared.akamai.steamstatic.com',
      'cdn.akamai.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.61.15.91:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
