/** Public base URL. APP_URL is required in production (Part 11); localhost is the dev default. */
export function appUrl(): URL {
  return new URL(process.env.APP_URL ?? "http://localhost:3000");
}

/** Crawlers explicitly allowed on public pages, including AI assistants. */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
] as const;

/** Public routes listed in the sitemap. Authenticated /app and /api routes are never listed. */
export const PUBLIC_ROUTES = ["/", "/pricing", "/signup", "/login"] as const;

/** Paths no crawler may index. */
export const PRIVATE_PATHS = ["/app/", "/api/", "/billing/"] as const;
