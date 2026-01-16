import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // The domain where your images are hosted
        port: "",
      },
    ],
  },
};

export default nextConfig;
