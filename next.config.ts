import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "api.escuelajs.co" },
    ],
  },

  allowedDevOrigins: ["192.168.0.231"],
};

export default nextConfig;