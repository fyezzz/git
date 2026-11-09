import { FAQ, PLANS, SITE, SOLUTIONS } from "@/lib/site";

export function GET() {
  const body = [
    `# ${SITE.name}: ${SITE.tagline}`,
    SITE.description,
    `Name: ${SITE.name} (also written ${SITE.alternateName}). ${SITE.disambiguation}`,
    "## Plans",
    ...PLANS.map((p) => `### ${p.name} ($${p.price}/month, $${p.annual.toLocaleString()}/year)\n${p.for}\n${p.features.map((f) => `- ${f}`).join("\n")}`),
    ...SOLUTIONS.map((s) => `## ${s.title}\nURL: ${SITE.url}/solutions/${s.slug}\n\n${s.intro}\n\n${s.points.map((p) => `### ${p.h}\n${p.p}`).join("\n\n")}${s.steps ? `\n\n### How it works\n${s.steps.map((x, i) => `${i + 1}. ${x}`).join("\n")}` : ""}${s.forWho ? `\n\n### Who it is for\n${s.forWho.map((x) => `- ${x}`).join("\n")}` : ""}${s.compare ? `\n\n### CodeOpsAcq vs the usual tool stack\n${s.compare.map(([a, t, c]) => `- ${a}: typical stack: ${t}; CodeOpsAcq: ${c}`).join("\n")}` : ""}\n\n${s.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}`),
    "## FAQ",
    ...FAQ.map((f) => `Q: ${f.q}\nA: ${f.a}`),
  ].join("\n\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
