import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { AI_CRAWLERS, PRIVATE_PATHS } from "@/lib/site";
import { cn } from "@/lib/utils";

describe("foundation", () => {
  it("allows every listed AI crawler on public pages and blocks private paths", () => {
    const { rules } = robots();
    const list = Array.isArray(rules) ? rules : [rules];
    const ai = list.find((r) => Array.isArray(r.userAgent) && r.userAgent.includes("GPTBot"));
    expect(ai).toBeDefined();
    for (const bot of ["GPTBot", "PerplexityBot", "ClaudeBot", "anthropic-ai"]) expect(AI_CRAWLERS).toContain(bot);
    for (const rule of list) expect(rule.disallow).toEqual(expect.arrayContaining([...PRIVATE_PATHS]));
  });

  it("lists only public routes in the sitemap", () => {
    const urls = sitemap().map((e) => new URL(e.url).pathname);
    expect(urls).toContain("/");
    expect(urls).toContain("/pricing");
    expect(urls.some((u) => u.startsWith("/app") || u.startsWith("/api"))).toBe(false);
  });

  it("merges Tailwind classes with the later class winning", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });
});
