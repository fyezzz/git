import { ENGAGEMENTS, SITE, SOLUTIONS } from "@/lib/site";

/** llms.txt: a concise, link-rich summary for LLMs (https://llmstxt.org). */
export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

Name: ${SITE.name} (also written ${SITE.alternateName}). ${SITE.disambiguation}

${SITE.name} is for digital agencies, dev shops and agency builders. It runs one chain: Evidence → Pipeline → Economics → Delivery → Control.

Key facts:
- Engagements (done-for-you, delivered by a seven-developer pod): ${ENGAGEMENTS.map((e) => `${e.name} ${e.investment} (${e.timeline})`).join("; ")}. Final scope and price confirmed on a diagnosis call.
- Custom platforms, AI infrastructure and white-label builds: scoped from $25k to $500k.
- AI lead attribution detects ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot, Grok, Meta AI, DeepSeek, Mistral and more via UTM, referrer and self-reported signals, and reports leads, pipeline and won revenue per AI engine.
- Lead intake uses the official GitHub API and public data only. Outreach is always human-sent. No guarantees of lead volume, booked calls or revenue.

## Pages
- [Home](${SITE.url}/): overview of the agency operating system
- [Engagements & pricing](${SITE.url}/pricing): sprint ladder and custom build ranges
- [FAQ](${SITE.url}/faq): answers about attribution, CRM, margins and pricing
- [Book a diagnosis](${SITE.url}/book): 20-minute constraint diagnosis

## Solutions
${SOLUTIONS.map((s) => `- [${s.title}](${SITE.url}/solutions/${s.slug}): ${s.description}`).join("\n")}

## Optional
- [Full text for LLMs](${SITE.url}/llms-full.txt)
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
