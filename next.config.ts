import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

/**
 * Security headers on every response. The CSP is deliberately narrow: it
 * blocks framing (clickjacking), <base> hijacking, plugins and cross-site
 * form posts, but doesn't restrict scripts/connections — a full script CSP
 * needs per-request nonces and must be tested against Stripe's checkout.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an x-powered-by header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Defaults to serving both AVIF and WebP per size, which bills two
    // transformations for every image instead of one. WebP alone has near-
    // universal browser support and is already ~25-35% smaller than JPEG/PNG,
    // so this halves the transformation count with no real quality/format
    // regression for visitors.
    formats: ["image/webp"],
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

// Source maps are only uploaded when SENTRY_AUTH_TOKEN is set (optional:
// it makes browser stack traces readable). Without it the build skips upload.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  telemetry: false,
});
