import type { MetadataRoute } from "next";
import { SITE_DOMAIN } from "@/lib/seo";

/**
 * Robots.txt configuration
 * Strictly complies with AGENTS.md rule 1.5 & 14.1:
 * - Never disallow pages that have `noindex` (such as /dat-xe/thanh-cong), so crawlers can read the noindex meta tag.
 * - Disallow all crawls on non-production/staging environments to avoid accidental indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  return isProd
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/"],
        },
        sitemap: `${SITE_DOMAIN}/sitemap.xml`,
      }
    : {
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      };
}

