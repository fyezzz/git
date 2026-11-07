/**
 * AI lead attribution.
 *
 * Classifies every visit and lead into a channel and, when it came from an AI assistant, the engine.
 * Signals in priority order (highest confidence first):
 *   1. utm      — explicit UTM tags (ChatGPT appends utm_source=chatgpt.com to cited links)
 *   2. referrer — the HTTP referrer host of the first page in the session
 *   3. self     — "How did you hear about us?" answer, which recovers "dark" AI traffic that arrives
 *                 with no referrer (copy-pasted URLs, app webviews, voice assistants)
 * The first touch is kept forever; the last touch is updated on each new session.
 */

export const CHANNELS = ["ai_assistant", "organic_search", "paid", "social", "email", "referral", "direct"] as const;
export type Channel = (typeof CHANNELS)[number];

export const AI_ENGINES = ["chatgpt", "perplexity", "claude", "gemini", "copilot", "grok", "meta_ai", "deepseek", "mistral", "you", "phind", "poe", "other_ai"] as const;
export type AiEngine = (typeof AI_ENGINES)[number];

export type Confidence = "utm" | "referrer" | "self_reported" | "none";

export interface Touch {
  channel: Channel;
  engine: AiEngine | null;
  source: string;
  medium: string | null;
  campaign: string | null;
  landing: string | null;
  confidence: Confidence;
  at: string;
}

export const ENGINE_LABEL: Record<AiEngine, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
  gemini: "Gemini",
  copilot: "Microsoft Copilot",
  grok: "Grok",
  meta_ai: "Meta AI",
  deepseek: "DeepSeek",
  mistral: "Mistral Le Chat",
  you: "You.com",
  phind: "Phind",
  poe: "Poe",
  other_ai: "Other AI assistant",
};

export const CHANNEL_LABEL: Record<Channel, string> = {
  ai_assistant: "AI assistants",
  organic_search: "Organic search",
  paid: "Paid",
  social: "Social",
  email: "Email",
  referral: "Referral",
  direct: "Direct",
};

/** Host suffix → engine. Order matters: more specific hosts first. */
const AI_HOSTS: [string, AiEngine][] = [
  ["chatgpt.com", "chatgpt"],
  ["chat.openai.com", "chatgpt"],
  ["openai.com", "chatgpt"],
  ["perplexity.ai", "perplexity"],
  ["claude.ai", "claude"],
  ["anthropic.com", "claude"],
  ["gemini.google.com", "gemini"],
  ["bard.google.com", "gemini"],
  ["aistudio.google.com", "gemini"],
  ["copilot.microsoft.com", "copilot"],
  ["copilot.cloud.microsoft", "copilot"],
  ["grok.com", "grok"],
  ["x.ai", "grok"],
  ["meta.ai", "meta_ai"],
  ["chat.deepseek.com", "deepseek"],
  ["deepseek.com", "deepseek"],
  ["chat.mistral.ai", "mistral"],
  ["mistral.ai", "mistral"],
  ["you.com", "you"],
  ["phind.com", "phind"],
  ["poe.com", "poe"],
  ["kagi.com/assistant", "other_ai"],
  ["huggingface.co/chat", "other_ai"],
];

const SEARCH_HOSTS = ["google.", "bing.com", "duckduckgo.com", "search.yahoo.com", "yahoo.com", "baidu.com", "yandex.", "ecosia.org", "search.brave.com", "startpage.com", "kagi.com"];
const SOCIAL_HOSTS = ["facebook.com", "fb.com", "instagram.com", "linkedin.com", "lnkd.in", "t.co", "twitter.com", "x.com", "youtube.com", "tiktok.com", "reddit.com", "threads.net", "pinterest.", "skool.com", "discord.com", "whatsapp.com"];
const EMAIL_HOSTS = ["mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com"];
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paidsocial", "paid_social", "display", "cpm", "ads"];

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

const matches = (host: string, suffix: string) => {
  const h = host.split("/")[0]!;
  if (suffix.includes("/")) return host.startsWith(suffix) || host.includes(`.${suffix}`);
  return h === suffix || h.endsWith(`.${suffix}`) || (suffix.endsWith(".") && (h.startsWith(suffix) || h.includes(`.${suffix}`)));
};

/** Accepts a full URL or a bare "host/path". */
export function engineFromHost(input: string | null): AiEngine | null {
  const host = input && input.includes("://") ? hostOf(input) : input?.toLowerCase().replace(/^www\./, "") ?? null;
  if (!host) return null;
  for (const [suffix, engine] of AI_HOSTS) if (matches(host, suffix)) return engine;
  return null;
}

/** Map a UTM source value ("chatgpt.com", "perplexity", "claude") to an engine. */
export function engineFromSource(source: string | null | undefined): AiEngine | null {
  if (!source) return null;
  const s = source.toLowerCase().trim();
  const asHost = engineFromHost(`https://${s.replace(/^https?:\/\//, "")}`);
  if (asHost) return asHost;
  const words: [RegExp, AiEngine][] = [
    [/chat\s*gpt|openai|gpt-?\d/, "chatgpt"],
    [/perplexity/, "perplexity"],
    [/claude|anthropic/, "claude"],
    [/gemini|bard/, "gemini"],
    [/copilot|bing\s*chat/, "copilot"],
    [/grok|xai/, "grok"],
    [/meta\s*ai|llama/, "meta_ai"],
    [/deepseek/, "deepseek"],
    [/mistral|le\s*chat/, "mistral"],
    [/\byou\.com\b/, "you"],
    [/phind/, "phind"],
    [/\bpoe\b/, "poe"],
    [/\b(ai|llm|chatbot|assistant)\b/, "other_ai"],
  ];
  for (const [re, engine] of words) if (re.test(s)) return engine;
  return null;
}

export interface TouchInput {
  url: string;
  referrer?: string | null;
  at?: string;
  ownHost?: string;
}

export function classifyVisit({ url, referrer, at = new Date().toISOString(), ownHost }: TouchInput): Touch {
  let params: URLSearchParams;
  let landing: string | null = null;
  try {
    const u = new URL(url);
    params = u.searchParams;
    landing = u.pathname;
  } catch {
    params = new URLSearchParams();
  }
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium")?.toLowerCase() ?? null;
  const campaign = params.get("utm_campaign");
  const refHost = hostOf(referrer);
  const internal = !!(refHost && ownHost && refHost.split("/")[0] === ownHost.replace(/^www\./, ""));
  const base = { medium: utmMedium, campaign, landing, at };

  // 1. UTM
  if (utmSource) {
    const engine = engineFromSource(utmSource);
    if (engine) return { ...base, channel: "ai_assistant", engine, source: utmSource, confidence: "utm" };
    if (utmMedium && PAID_MEDIUMS.includes(utmMedium)) return { ...base, channel: "paid", engine: null, source: utmSource, confidence: "utm" };
    if (utmMedium === "email" || utmMedium === "newsletter") return { ...base, channel: "email", engine: null, source: utmSource, confidence: "utm" };
    if (utmMedium === "social" || utmMedium === "organic_social") return { ...base, channel: "social", engine: null, source: utmSource, confidence: "utm" };
    if (utmMedium === "organic" || utmMedium === "seo") return { ...base, channel: "organic_search", engine: null, source: utmSource, confidence: "utm" };
    return { ...base, channel: "referral", engine: null, source: utmSource, confidence: "utm" };
  }
  if (params.get("gclid") || params.get("msclkid") || params.get("fbclid") && utmMedium) {
    return { ...base, channel: "paid", engine: null, source: params.get("gclid") ? "google" : params.get("msclkid") ? "bing" : "meta", confidence: "utm" };
  }
  if (params.get("gclid") || params.get("msclkid")) return { ...base, channel: "paid", engine: null, source: params.get("gclid") ? "google" : "bing", confidence: "utm" };

  // 2. Referrer
  if (refHost && !internal) {
    const engine = engineFromHost(referrer!);
    const host = refHost.split("/")[0]!;
    if (engine) return { ...base, channel: "ai_assistant", engine, source: host, confidence: "referrer" };
    if (EMAIL_HOSTS.some((h) => matches(refHost, h))) return { ...base, channel: "email", engine: null, source: host, confidence: "referrer" };
    if (SEARCH_HOSTS.some((h) => matches(refHost, h))) return { ...base, channel: "organic_search", engine: null, source: host, confidence: "referrer" };
    if (SOCIAL_HOSTS.some((h) => matches(refHost, h))) return { ...base, channel: "social", engine: null, source: host, confidence: "referrer" };
    return { ...base, channel: "referral", engine: null, source: host, confidence: "referrer" };
  }
  return { ...base, channel: "direct", engine: null, source: "(direct)", confidence: "none" };
}

export const HEARD_FROM_OPTIONS = [
  "ChatGPT",
  "Perplexity",
  "Claude",
  "Google Gemini",
  "Microsoft Copilot",
  "Grok",
  "Another AI assistant",
  "Google search",
  "YouTube",
  "LinkedIn",
  "Instagram / Facebook",
  "Skool / Discord community",
  "Referral from a friend or client",
  "Podcast / event",
  "Other",
] as const;

/**
 * Resolve the lead's final attribution. Self-reported AI answers upgrade a "direct"
 * (or unknown) touch to ai_assistant, recovering AI traffic that carried no referrer.
 * They never override a stronger signal that already identified an AI engine.
 */
export function resolveLeadAttribution(first: Touch | null, last: Touch | null, heardFrom: string | null): { channel: Channel; engine: AiEngine | null; confidence: Confidence; first: Touch | null; last: Touch | null; heardFrom: string | null } {
  const primary = first ?? last;
  const selfEngine = heardFrom ? engineFromSource(heardFrom) : null;
  if (primary && primary.channel === "ai_assistant") {
    return { channel: "ai_assistant", engine: primary.engine, confidence: primary.confidence, first, last, heardFrom };
  }
  if (last && last.channel === "ai_assistant") {
    return { channel: "ai_assistant", engine: last.engine, confidence: last.confidence, first, last, heardFrom };
  }
  if (selfEngine && (!primary || primary.channel === "direct" || primary.channel === "organic_search")) {
    // Organic search is included because AI Overviews / AI Mode clicks arrive as plain google.com referrals.
    return { channel: "ai_assistant", engine: selfEngine, confidence: "self_reported", first, last, heardFrom };
  }
  return { channel: primary?.channel ?? "direct", engine: null, confidence: primary?.confidence ?? "none", first, last, heardFrom };
}
