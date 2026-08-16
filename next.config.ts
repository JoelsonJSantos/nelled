import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    qualities: [75, 100],
  },

  allowedDevOrigins: [
    "192.168.1.5",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;