import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, appUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return PUBLIC_ROUTES.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
