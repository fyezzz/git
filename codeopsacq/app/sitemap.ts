import type { MetadataRoute } from "next";
import { SITE, SOLUTIONS } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/book`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    ...SOLUTIONS.map((s) => ({ url: `${SITE.url}/solutions/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
