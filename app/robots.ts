import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private pages (account, checkout, wishlist...) are kept out of the
      // index with a noindex meta tag instead of a Disallow here: a blocked
      // page can't be crawled, so Google never sees its noindex and may still
      // list the bare URL.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
