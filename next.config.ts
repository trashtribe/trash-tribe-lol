import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Trimmed from Next's defaults (8 deviceSizes, 7 imageSizes) to match the
    // actual breakpoints this site's <Image sizes="..."> props use (mobile
    // ~640, tablet ~828, desktop ~1200/1920; thumbnails at 64/96/180/260px).
    // Every extra entry here is another width Vercel can be asked to
    // transform for the same photo, and each first request for a given
    // size/format combo is a billed "Image Optimization Transformation" —
    // fewer, well-chosen sizes means far fewer combinations without any
    // visible quality loss (Next always picks the closest size ≥ what's
    // needed). See https://vercel.com/docs/image-optimization/managing-image-optimization-costs.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 96, 128, 256],
    // Product photos rarely change more than once a month (and when they
    // do, Printify serves them from a new URL anyway) — per Vercel's own
    // guidance, bumping this from the 4h default to 31 days cuts down on
    // repeat "STALE" transformations for images that get revisited after
    // the cache window without actually needing a re-optimize.
    minimumCacheTTL: 2678400,
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
