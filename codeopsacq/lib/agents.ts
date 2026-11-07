import "server-only";
import { ENGINE_LABEL, type AiEngine } from "./attribution";
import { getAttributionReport, getFulfillment, getInvoices, getLeadReviews, getPipelineStats, getRevenue, getSequences, getSuppression, getTickets } from "./data";
import { duration, pct, STAGE_LABEL, usd } from "./format";

export interface Finding {
  agent: AgentId;
  headline: string;
  items: string[];
  severity: "ok" | "watch" | "act";
}

export const AGENTS = {
  pipeline: { name: "Pipeline analyst", focus: "Revenue risk & velocity", keywords: ["deal", "risk", "pipeline", "stalled", "stuck", "velocity", "health", "forecast"] },
  forecast: { name: "Revenue forecaster", focus: "Weighted pipeline & MRR", keywords: ["forecast", "revenue", "mrr", "arr", "target", "month", "health"] },
  leads: { name: "Lead quality agent", focus: "Evidence & fit scoring", keywords: ["lead", "score", "intake", "review", "fit", "new"] },
  attribution: { name: "Attribution analyst", focus: "AI & channel sources", keywords: ["source", "channel", "attribution", "chatgpt", "ai", "perplexity", "marketing", "where"] },
  profit: { name: "Profit controller", focus: "Cost and margin checks", keywords: ["profit", "margin", "leak", "cost", "price", "churn"] },
  delivery: { name: "Delivery reporter", focus: "Capacity & fulfillment", keywords: ["capacity", "delivery", "client", "ticket", "developer", "report", "weekly", "qa"] },
  outreach: { name: "Outreach compliance", focus: "Sequences & suppression", keywords: ["outreach", "sequence", "email", "suppression", "compliance"] },
  billing: { name: "Billing clerk", focus: "Invoices & collections", keywords: ["invoice", "billing", "collect", "payment", "cash", "weekly"] },
} as const;
export type AgentId = keyof typeof AGENTS;

export const PRESET_MISSIONS = [
  "Which deals are at risk this week?",
  "Summarize pipeline health",
  "Where are we leaking profit?",
  "Do we have capacity for 3 new clients?",
  "Score this week's new leads",
  "Which AI assistants are sending us pipeline?",
  "Draft the weekly delivery report",
];

/** Route a mission to only the agents it needs. Falls back to a full sweep when nothing matches. */
export function routeMission(mission: string): AgentId[] {
  const m = mission.toLowerCase();
  const hits = (Object.keys(AGENTS) as AgentId[]).filter((id) => AGENTS[id].keywords.some((k) => m.includes(k)));
  return hits.length ? hits : (Object.keys(AGENTS) as AgentId[]);
}

const STAGE_PROB: Record<string, number> = { lead: 0.05, contacted: 0.1, qualified: 0.25, proposal: 0.5 };

async function run(id: AgentId, mission: string): Promise<Finding> {
  switch (id) {
    case "pipeline": {
      const p = await getPipelineStats();
      const open = p.deals.filter((d) => STAGE_PROB[d.stage] !== undefined);
      const stale = open.filter((d) => (Date.now() - Date.parse(d.stage_changed_at)) / 86400000 > 5);
      const noNext = open.filter((d) => !d.next_step);
      const items = stale
        .sort((a, b) => b.value_cents - a.value_cents)
        .slice(0, 6)
        .map((d) => `${d.company} · ${usd(d.value_cents)} · ${STAGE_LABEL[d.stage]} for ${Math.floor((Date.now() - Date.parse(d.stage_changed_at)) / 86400000)}d · owner ${d.owner_name ?? "unassigned"}`);
      if (noNext.length) items.push(`${noNext.length} open deals have no next step recorded.`);
      return { agent: id, severity: stale.length > 2 ? "act" : stale.length ? "watch" : "ok", headline: `${stale.length} of ${open.length} open deals have not moved stage in 5+ days (${usd(stale.reduce((a, d) => a + d.value_cents, 0))} at risk).`, items };
    }
    case "forecast": {
      const p = await getPipelineStats();
      const r = await getRevenue();
      const weighted = p.deals.reduce((a, d) => a + d.value_cents * (STAGE_PROB[d.stage] ?? 0), 0);
      return {
        agent: id,
        severity: "ok",
        headline: `Weighted pipeline ${usd(weighted)} on ${usd(p.pipelineValue)} open. MRR ${usd(r.mrr)} (${r.growthPct >= 0 ? "+" : ""}${pct(r.growthPct)} vs 30 days ago).`,
        items: [`Close rate from qualified: ${pct(p.closeRate)}.`, `Average won deal: ${usd(p.avgDeal)}.`, `ARR run-rate: ${usd(r.arr)}.`, "Stage weights: lead 5%, contacted 10%, qualified 25%, proposal 50%."],
      };
    }
    case "leads": {
      const reviews = await getLeadReviews();
      const pending = reviews.filter((r) => r.status === "pending");
      const weekly = reviews.filter((r) => Date.now() - Date.parse(r.created_at) < 7 * 86400000);
      const items = pending.slice(0, 6).map((r) => `${r.name} · score ${r.score} · ${r.classification === "evidence" ? "evidence" : "hypothesis, verify before outreach"} · ${r.evidence}`);
      const hyp = pending.filter((r) => r.classification === "hypothesis").length;
      if (hyp) items.push(`${hyp} pending leads rest on hypotheses rather than evidence. Verify before approving.`);
      return { agent: id, severity: pending.length > 10 ? "act" : pending.length ? "watch" : "ok", headline: `${pending.length} leads waiting for review; ${weekly.length} new this week. Average pending score ${pending.length ? Math.round(pending.reduce((a, r) => a + r.score, 0) / pending.length) : 0}.`, items };
    }
    case "attribution": {
      const rep = await getAttributionReport(30);
      const totalLeads = rep.leads.reduce((a, r) => a + r.leads, 0);
      const ai = rep.leads.filter((r) => r.channel === "ai_assistant");
      const aiLeads = ai.reduce((a, r) => a + r.leads, 0);
      const aiPipe = ai.reduce((a, r) => a + r.pipeline + r.won, 0);
      const totalPipe = rep.leads.reduce((a, r) => a + r.pipeline + r.won, 0);
      const byEngine = ai.sort((a, b) => b.pipeline + b.won - (a.pipeline + a.won)).map((r) => `${ENGINE_LABEL[(r.ai_engine ?? "other_ai") as AiEngine]}: ${r.leads} leads · ${usd(r.pipeline + r.won)} pipeline+won`);
      return { agent: id, severity: "ok", headline: `AI assistants sourced ${aiLeads} of ${totalLeads} leads (${pct(totalLeads ? (aiLeads / totalLeads) * 100 : 0)}) and ${pct(totalPipe ? (aiPipe / totalPipe) * 100 : 0)} of pipeline + won value.`, items: byEngine };
    }
    case "profit": {
      const tickets = await getTickets();
      const priced = tickets.filter((t) => t.price_cents > 0);
      const thin = priced.filter((t) => (t.price_cents - t.cost_cents) / t.price_cents < 0.4);
      const unpriced = tickets.filter((t) => t.price_cents === 0 && t.stage !== "delivered");
      const r = await getRevenue();
      const items = thin.map((t) => `${t.code} ${t.title}: ${pct(((t.price_cents - t.cost_cents) / t.price_cents) * 100)} margin`);
      if (unpriced.length) items.push(`${unpriced.length} active tickets have no client price. Profit on them is unknown until priced.`);
      items.push(`Revenue churn last 30 days: ${pct(r.churnPct)}.`);
      return { agent: id, severity: thin.length || unpriced.length ? "act" : "ok", headline: r.margin === null ? "No priced delivery work yet, so blended margin can't be computed." : `Blended delivery margin ${pct(r.margin)}. ${thin.length} jobs under 40% margin.`, items };
    }
    case "delivery": {
      const f = await getFulfillment();
      const n = mission.match(/(\d+)\s+new\s+client/i)?.[1];
      const free = f.devs.reduce((a, d) => a + Math.max(0, d.slots - d.active), 0);
      const hot = f.devs.filter((d) => d.capacity >= 85).map((d) => `${d.label} (${d.specialty}) at ${d.capacity}%`);
      const overdue = f.active.filter((t) => t.due_date && Date.parse(t.due_date) < Date.now()).map((t) => `${t.code} ${t.title} overdue since ${t.due_date}`);
      const items = [...overdue, ...hot.map((h) => `Near capacity: ${h}`), `QA queue: ${f.qa.length}.`, f.avgCycleDays !== null ? `Average cycle: ${f.avgCycleDays.toFixed(1)} days.` : "No delivered tickets yet for cycle time."];
      if (n) items.unshift(Number(n) <= free ? `Yes: ${free} open build slots cover ${n} new clients at one build each.` : `No: ${n} new clients need ${n} slots; only ${free} are open. Add capacity or stagger starts.`);
      return { agent: id, severity: overdue.length || hot.length ? "watch" : "ok", headline: `Pod at ${pct(f.capacityPct, 0)} capacity with ${f.active.length} active builds and ${free} open slots.`, items };
    }
    case "outreach": {
      const seqs = await getSequences();
      const sup = await getSuppression();
      return { agent: id, severity: "ok", headline: `${seqs.filter((s) => s.status === "active").length} active sequences, ${seqs.reduce((a, s) => a + s.enrolled, 0)} enrolled. ${sup.length} suppressed contacts enforced.`, items: [...seqs.map((s) => `${s.name}: ${s.enrolled} enrolled · ${s.status}`), "All sends require a human action. Nothing is auto-sent."] };
    }
    case "billing": {
      const inv = await getInvoices();
      const open = inv.filter((i) => i.status !== "paid");
      const overdue = open.filter((i) => Date.parse(i.due_date) < Date.now());
      return { agent: id, severity: overdue.length ? "act" : "ok", headline: `${open.length} unpaid invoices (${usd(open.reduce((a, i) => a + i.total_cents, 0))}); ${overdue.length} overdue.`, items: overdue.map((i) => `${i.number} ${i.client} ${usd(i.total_cents)} due ${i.due_date}`) };
    }
  }
}

export async function runMission(mission: string): Promise<{ agents: AgentId[]; findings: Finding[] }> {
  const agents = routeMission(mission);
  const findings = await Promise.all(agents.map((a) => run(a, mission)));
  return { agents, findings };
}

/** Optional narrative synthesis with Claude. Returns null when no key is configured. */
export async function synthesize(mission: string, findings: Finding[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 700,
      system: "You are the orchestrator of an agency operating system. Write a tight operator briefing: 3-5 bullet actions ranked by revenue impact, each tied to a specific finding. Use only the numbers provided. No preamble.",
      messages: [{ role: "user", content: `Mission: ${mission}\n\nAgent findings (JSON):\n${JSON.stringify(findings, null, 1)}` }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
}
