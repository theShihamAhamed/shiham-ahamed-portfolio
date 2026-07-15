import type { MetadataRoute } from "next";

import { getCanonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === "production";

  return {
    rules: {
      userAgent: "*",
      allow: isProduction ? "/" : [],
      disallow: ["/api/", "/_next/"],
    },
    ...(isProduction
      ? { sitemap: getCanonicalUrl("/sitemap.xml").toString() }
      : {}),
  };
}
