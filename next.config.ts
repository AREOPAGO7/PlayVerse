import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'github.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'media.rawg.io',
      'shared.akamai.steamstatic.com'
    ],
  },
};

export default nextConfig;
