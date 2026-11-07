import { describe, expect, it } from "vitest";
import { classifyVisit, engineFromSource, resolveLeadAttribution } from "./attribution";

const v = (url: string, referrer?: string) => classifyVisit({ url, referrer, ownHost: "codeopsacq.com", at: "2026-11-07T00:00:00Z" });

describe("classifyVisit", () => {
  it("detects ChatGPT's utm_source tag", () => {
    const t = v("https://codeopsacq.com/pricing?utm_source=chatgpt.com");
    expect(t).toMatchObject({ channel: "ai_assistant", engine: "chatgpt", confidence: "utm", landing: "/pricing" });
  });
  it.each([
    ["https://www.perplexity.ai/search/abc", "perplexity"],
    ["https://claude.ai/chat/123", "claude"],
    ["https://gemini.google.com/app", "gemini"],
    ["https://copilot.microsoft.com/", "copilot"],
    ["https://chat.openai.com/", "chatgpt"],
    ["https://grok.com/", "grok"],
    ["https://chat.deepseek.com/", "deepseek"],
  ])("detects AI referrer %s", (ref, engine) => {
    expect(v("https://codeopsacq.com/", ref)).toMatchObject({ channel: "ai_assistant", engine, confidence: "referrer" });
  });
  it("does not confuse google search with gemini", () => {
    expect(v("https://codeopsacq.com/", "https://www.google.com/")).toMatchObject({ channel: "organic_search", engine: null });
  });
  it("classifies paid, social, email, referral and direct", () => {
    expect(v("https://codeopsacq.com/?utm_source=google&utm_medium=cpc").channel).toBe("paid");
    expect(v("https://codeopsacq.com/?gclid=abc").channel).toBe("paid");
    expect(v("https://codeopsacq.com/", "https://www.linkedin.com/feed").channel).toBe("social");
    expect(v("https://codeopsacq.com/", "https://mail.google.com/").channel).toBe("email");
    expect(v("https://codeopsacq.com/", "https://someblog.io/post").channel).toBe("referral");
    expect(v("https://codeopsacq.com/").channel).toBe("direct");
  });
  it("ignores internal referrers", () => {
    expect(v("https://codeopsacq.com/pricing", "https://codeopsacq.com/").channel).toBe("direct");
  });
});

describe("engineFromSource", () => {
  it("parses free-text answers", () => {
    expect(engineFromSource("ChatGPT")).toBe("chatgpt");
    expect(engineFromSource("Google Gemini")).toBe("gemini");
    expect(engineFromSource("Another AI assistant")).toBe("other_ai");
    expect(engineFromSource("Google search")).toBeNull();
  });
});

describe("resolveLeadAttribution", () => {
  const direct = v("https://codeopsacq.com/");
  const google = v("https://codeopsacq.com/", "https://www.google.com/");
  const gpt = v("https://codeopsacq.com/", "https://chatgpt.com/");
  it("recovers dark AI traffic from the self-reported answer", () => {
    expect(resolveLeadAttribution(direct, direct, "Perplexity")).toMatchObject({ channel: "ai_assistant", engine: "perplexity", confidence: "self_reported" });
  });
  it("recovers AI Overviews clicks that arrive as google search", () => {
    expect(resolveLeadAttribution(google, google, "ChatGPT")).toMatchObject({ channel: "ai_assistant", engine: "chatgpt" });
  });
  it("keeps the measured engine over the self-reported one", () => {
    expect(resolveLeadAttribution(gpt, direct, "Claude")).toMatchObject({ engine: "chatgpt", confidence: "referrer" });
  });
  it("credits an AI last touch when first touch was something else", () => {
    expect(resolveLeadAttribution(google, gpt, null)).toMatchObject({ channel: "ai_assistant", engine: "chatgpt" });
  });
  it("does not invent AI attribution", () => {
    expect(resolveLeadAttribution(google, google, "LinkedIn")).toMatchObject({ channel: "organic_search", engine: null });
  });
});
