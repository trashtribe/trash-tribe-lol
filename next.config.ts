import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.printify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-api.printify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "printify-production-uploads.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "printify-production-uploads.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
