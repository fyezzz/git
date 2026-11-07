import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Explicitly welcome search and AI crawlers so the site can be indexed and cited by LLMs. */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "Meta-ExternalAgent", "DuckAssistBot", "cohere-ai", "MistralAI-User", "YouBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/api", "/login"] }, ...AI_BOTS.map((ua) => ({ userAgent: ua, allow: "/", disallow: ["/app", "/api", "/login"] }))],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
