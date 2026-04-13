import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Relative URL paths for every file under `public/` (e.g. `ttt.png`, `products/foo.png`). */
function listPublicUrlPaths(publicDir: string): string[] {
  const out: string[] = [];

  function walk(dir: string, rel: string) {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      if (fs.statSync(abs).isDirectory()) {
        walk(abs, r);
      } else {
        out.push(r.split(path.sep).join("/"));
      }
    }
  }

  if (fs.existsSync(publicDir)) {
    walk(publicDir, "");
  }
  return out;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    const destination = "/coming-soon";
    const publicPaths = listPublicUrlPaths(path.join(process.cwd(), "public"));
    const publicAlt = publicPaths.map(escapeRegex).join("|");
    const notPublicOrSystem = `(?!coming-soon$|coming-soon/|account(?:/|$)|checkout(?:/|$)|order-confirmation(?:/|$)|_next/|_next$|(?:${publicAlt})$)`;

    return [
      { source: "/", destination, permanent: false },
      { source: "/about", destination, permanent: false },
      { source: "/contact", destination, permanent: false },
      { source: "/wishlist", destination, permanent: false },
      { source: "/shop", destination, permanent: false },
      { source: "/shop/:slug*", destination, permanent: false },
      {
        source: `/:path(${notPublicOrSystem}.*)`,
        destination,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
