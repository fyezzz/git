import type { MetadataRoute } from "next";
import { AI_CRAWLERS, PRIVATE_PATHS, appUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = [...PRIVATE_PATHS];
  return {
    rules: [
      { userAgent: [...AI_CRAWLERS], allow: "/", disallow },
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: new URL("/sitemap.xml", appUrl()).toString(),
    host: appUrl().origin,
  };
}
