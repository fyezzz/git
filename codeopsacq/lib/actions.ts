"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runMission, synthesize } from "./agents";
import { audit, one, q } from "./db";
import { STAGE_LABEL, STAGES, TICKET_STAGES, type Stage } from "./format";
import { requireSession } from "./session";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };
const ok = (message?: string): ActionResult => ({ ok: true, message });
const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : e instanceof Error ? e.message : String(e) });
const money = z.coerce.number().min(0).max(100_000_000).transform((d) => Math.round(d * 100));
const done = (...paths: string[]) => paths.forEach((p) => revalidatePath(p, "layout"));

async function guard<T>(fn: () => Promise<T>): Promise<ActionResult> {
  try {
    await requireSession();
    const r = await fn();
    return typeof r === "string" ? ok(r) : ok();
  } catch (e) {
    return fail(e);
  }
}

/* ---------- CRM ---------- */
export async function moveDeal(id: string, stage: Stage): Promise<ActionResult> {
  return guard(async () => {
    z.enum(STAGES).parse(stage);
    const d = await one<{ company: string; title: string; stage: Stage; value_cents: number; owner_id: string | null }>("SELECT company, title, stage, value_cents, owner_id FROM deals WHERE id = $1", [id]);
    if (d.stage === stage) return;
    await q(
      `UPDATE deals SET stage = $2, stage_changed_at = now(),
        first_response_at = CASE WHEN first_response_at IS NULL AND $2 <> 'lead' THEN now() ELSE first_response_at END,
        closed_at = CASE WHEN $2 IN ('won','lost') THEN now() ELSE NULL END WHERE id = $1`,
      [id, stage],
    );
    await audit("CRM", "Deal stage changed", `${d.company}: ${STAGE_LABEL[d.stage]} → ${STAGE_LABEL[stage]}`);
    if (stage === "won") {
      await q("INSERT INTO wins (deal_id, title, amount_cents, closed_by) VALUES ($1, $2, $3, $4) ON CONFLICT (deal_id) DO NOTHING", [id, `${d.company} · ${d.title}`, d.value_cents, d.owner_id ?? "unassigned"]);
      await audit("Wins", "Win logged from pipeline", `${d.company} closed for $${(d.value_cents / 100).toLocaleString()}`);
    } else if (d.stage === "won") {
      await q("DELETE FROM wins WHERE deal_id = $1", [id]);
      await audit("Wins", "Win reversed", `${d.company} moved out of Won`);
    }
    done("/app");
    return stage === "won" ? `${d.company} won. Win posted to the wins feed.` : undefined;
  });
}

const DealSchema = z.object({
  company: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  industry: z.string().trim().max(60).default("Other"),
  value: money,
  owner_id: z.string().optional().transform((v) => v || null),
  contact_name: z.string().trim().max(120).optional().transform((v) => v || null),
  contact_email: z.union([z.literal(""), z.string().trim().email()]).optional().transform((v) => v || null),
  next_step: z.string().trim().max(200).optional().transform((v) => v || null),
  ai_score: z.coerce.number().int().min(0).max(100).default(60),
});

export async function createDeal(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const d = DealSchema.parse(Object.fromEntries(fd));
    if (d.contact_email && (await q("SELECT 1 FROM suppression WHERE value = $1 OR value = split_part($1, '@', 2)", [d.contact_email.toLowerCase()])).length) {
      throw new Error(`${d.contact_email} is on the suppression list. The lead was not created.`);
    }
    await q(
      `INSERT INTO deals (company, title, industry, value_cents, owner_id, contact_name, contact_email, next_step, ai_score, signal, channel, attribution) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Manual entry','direct','{"first":{"channel":"direct","confidence":"none"}}')`,
      [d.company, d.title, d.industry, d.value, d.owner_id, d.contact_name, d.contact_email, d.next_step, d.ai_score],
    );
    await audit("CRM", "Lead captured", `${d.company} · ${d.title}`);
    done("/app");
    return `${d.company} added to Lead.`;
  });
}

export async function updateDeal(id: string, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const d = DealSchema.parse(Object.fromEntries(fd));
    await q(`UPDATE deals SET company=$2, title=$3, industry=$4, value_cents=$5, owner_id=$6, contact_name=$7, contact_email=$8, next_step=$9, ai_score=$10 WHERE id=$1`, [id, d.company, d.title, d.industry, d.value, d.owner_id, d.contact_name, d.contact_email, d.next_step, d.ai_score]);
    await audit("CRM", "Deal updated", d.company);
    done("/app");
    return "Saved.";
  });
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  return guard(async () => {
    const d = await one<{ company: string }>("DELETE FROM deals WHERE id = $1 RETURNING company", [id]);
    await audit("CRM", "Deal deleted", d.company);
    done("/app");
  });
}

/* ---------- Lead ops ---------- */
export async function reviewLead(id: string, decision: "approved" | "rejected"): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ name: string; category: string; score: number; evidence: string; source_url: string | null; status: string }>("SELECT * FROM lead_reviews WHERE id = $1", [id]);
    if (r.status !== "pending") throw new Error(`${r.name} was already ${r.status}.`);
    if (decision === "approved" && (await q("SELECT 1 FROM suppression WHERE lower(value) = lower($1)", [r.name])).length) throw new Error(`${r.name} is suppressed.`);
    await q("UPDATE lead_reviews SET status = $2 WHERE id = $1", [id, decision]);
    if (decision === "approved") {
      await q(
        `INSERT INTO deals (company, industry, title, ai_score, signal, stage, channel, attribution, value_cents) VALUES ($1,$2,'Discovery',$3,$4,'lead','referral',$5::jsonb,0)`,
        [r.name, r.category, r.score, r.evidence.slice(0, 60), JSON.stringify({ first: { channel: "referral", source: "github.com", confidence: "referrer", landing: r.source_url } })],
      );
    }
    await audit("Lead ops", decision === "approved" ? "Lead approved into Target" : "Lead rejected", `${r.name} ${decision === "approved" ? "moved from review queue to CRM Lead" : "removed from review queue"}`);
    done("/app");
    return decision === "approved" ? `${r.name} added to CRM as a Lead.` : `${r.name} rejected.`;
  });
}

/** Official GitHub REST search, public data only. */
export async function runGithubIntake(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const topic = z.string().trim().min(2).max(60).parse(fd.get("query") || "crm agency");
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "codeopsacq-lead-ops", "X-GitHub-Api-Version": "2022-11-28" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(`${topic} in:description,readme stars:>20 pushed:>${new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)}`)}&sort=updated&per_page=15`, { headers, cache: "no-store" });
    if (res.status === 401) throw new Error("GitHub rejected GITHUB_TOKEN (401). Fix the token or remove it to use public rate limits.");
    if (res.status === 403 || res.status === 429) throw new Error("GitHub rate limit reached. Wait a minute, or set GITHUB_TOKEN to raise the limit.");
    if (!res.ok) throw new Error(`GitHub search failed (${res.status}).`);
    const data = (await res.json()) as { items: { owner: { login: string; type: string; html_url: string }; full_name: string; description: string | null; stargazers_count: number; forks_count: number; open_issues_count: number; topics?: string[]; html_url: string }[] };
    const suppressed = new Set((await q<{ value: string }>("SELECT lower(value) AS value FROM suppression")).map((s) => s.value));
    let added = 0;
    for (const repo of data.items) {
      if (repo.owner.type !== "Organization" || suppressed.has(repo.owner.login.toLowerCase())) continue;
      const evidence = repo.description ? `Public repo ${repo.full_name}: ${repo.description}`.slice(0, 160) : `Active public repo ${repo.full_name}`;
      const score = Math.min(99, 50 + Math.round(Math.log10(repo.stargazers_count + 1) * 10) + Math.min(15, repo.open_issues_count) + (repo.description ? 5 : 0));
      const r = await q(
        `INSERT INTO lead_reviews (name, category, contributors, evidence, classification, score, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (name) DO NOTHING RETURNING id`,
        [repo.owner.login, (repo.topics?.[0] ?? topic).slice(0, 40), repo.forks_count, evidence, repo.description ? "evidence" : "hypothesis", score, repo.html_url],
      );
      added += r.length;
    }
    await audit("Lead ops", "GitHub intake run", `"${topic}": ${data.items.length} repos scanned, ${added} new organizations queued`);
    done("/app");
    return `${added} new organizations added to the review queue (${data.items.length} repos scanned).`;
  });
}

export async function addSuppression(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const value = z.string().trim().toLowerCase().min(3).max(200).parse(fd.get("value"));
    const reason = z.string().trim().min(2).max(120).parse(fd.get("reason") || "Opted out");
    await q("INSERT INTO suppression (value, reason) VALUES ($1, $2) ON CONFLICT (value) DO UPDATE SET reason = EXCLUDED.reason", [value, reason]);
    await audit("Lead ops", "Suppression added", `${value} (${reason})`);
    done("/app");
  });
}
export async function removeSuppression(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ value: string }>("DELETE FROM suppression WHERE id = $1 RETURNING value", [id]);
    await audit("Lead ops", "Suppression removed", r.value);
    done("/app");
  });
}
export async function toggleSequence(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ name: string; status: string }>("UPDATE sequences SET status = CASE status WHEN 'active' THEN 'paused' ELSE 'active' END WHERE id = $1 RETURNING name, status", [id]);
    await audit("Outreach", r.status === "paused" ? "Sequence manually paused" : "Sequence resumed", r.name);
    done("/app");
  });
}

/* ---------- Tickets ---------- */
const TicketSchema = z.object({
  title: z.string().trim().min(3).max(160),
  project_type: z.enum(["Web application", "AI automation", "Integration", "Internal tool", "Mobile experience", "Automation"]),
  priority: z.enum(["standard", "high", "urgent"]),
  requirements: z.string().trim().min(10, "Describe the requirements (10+ characters)").max(4000),
  assignment: z.enum(["unassigned", "auto", "review"]),
  stage: z.enum(TICKET_STAGES).default("scoping"),
  price: money.default(0),
  cost: money.default(0),
  due_date: z.string().optional().transform((v) => v || null),
});

export async function createTicket(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const t = TicketSchema.parse(Object.fromEntries(fd));
    let dev: string | null = null;
    if (t.assignment === "auto") {
      const [best] = await q<{ id: string }>(`SELECT d.id FROM developers d LEFT JOIN tickets x ON x.developer_id = d.id AND x.stage IN ('approved','development','qa') GROUP BY d.id, d.slots ORDER BY count(x.id)::float / d.slots, d.id LIMIT 1`);
      dev = best?.id ?? null;
    }
    const r = await one<{ code: string }>(
      `INSERT INTO tickets (title, project_type, priority, requirements, stage, developer_id, price_cents, cost_cents, due_date, progress) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING code`,
      [t.title, t.project_type, t.priority, `${t.requirements}${t.assignment === "review" ? "\n\n[Needs technical review]" : ""}`, t.stage, dev, t.price, t.cost, t.due_date, t.stage === "approved" ? 5 : t.stage === "development" ? 15 : 0],
    );
    await audit("Fulfillment", "Software ticket created", `${r.code} ${t.title}${dev ? ` routed to ${dev.replace("dev-", "Developer ").toUpperCase().replace("DEVELOPER ", "Developer ")}` : ""}`);
    done("/app");
    return `${r.code} created${dev ? " and routed to the least-loaded developer" : ""}.`;
  });
}

export async function updateTicket(id: string, patch: { stage?: string; progress?: number; developer_id?: string | null }): Promise<ActionResult> {
  return guard(async () => {
    const p = z.object({ stage: z.enum(TICKET_STAGES).optional(), progress: z.number().int().min(0).max(100).optional(), developer_id: z.string().nullable().optional() }).parse(patch);
    const cur = await one<{ code: string; stage: string; progress: number; developer_id: string | null }>("SELECT code, stage, progress, developer_id FROM tickets WHERE id = $1", [id]);
    const stage = p.stage ?? cur.stage;
    const progress = stage === "delivered" ? 100 : p.progress ?? cur.progress;
    await q(`UPDATE tickets SET stage=$2, progress=$3, developer_id=$4, delivered_at = CASE WHEN $2 = 'delivered' THEN coalesce(delivered_at, now()) ELSE NULL END WHERE id=$1`, [id, stage, progress, p.developer_id === undefined ? cur.developer_id : p.developer_id]);
    await audit("Fulfillment", "Ticket updated", `${cur.code}: ${stage} · ${progress}%`);
    done("/app");
  });
}

/** Turn the catalog cart into a scoped ticket. */
export async function ticketFromCart(items: { name: string; qty: number; price_cents: number; cost_cents: number }[], client: string): Promise<ActionResult> {
  return guard(async () => {
    const parsed = z.array(z.object({ name: z.string().min(1).max(160), qty: z.number().int().min(1).max(99), price_cents: z.number().int().min(0), cost_cents: z.number().int().min(0) })).min(1, "Add at least one catalog item").parse(items);
    const name = z.string().trim().min(2, "Enter the client name").max(120).parse(client);
    const price = parsed.reduce((a, i) => a + i.price_cents * i.qty, 0);
    const cost = parsed.reduce((a, i) => a + i.cost_cents * i.qty, 0);
    if (price === 0) throw new Error("Set a client price on at least one item before creating the ticket.");
    const r = await one<{ code: string }>(
      `INSERT INTO tickets (title, project_type, priority, requirements, stage, price_cents, cost_cents) VALUES ($1,'Web application','standard',$2,'scoping',$3,$4) RETURNING code`,
      [`${name}: ${parsed[0]!.name}${parsed.length > 1 ? ` + ${parsed.length - 1} more` : ""}`, parsed.map((i) => `- ${i.qty} × ${i.name} @ $${(i.price_cents / 100).toFixed(2)}`).join("\n"), price, cost],
    );
    await audit("Catalog", "Dev ticket created from cart", `${r.code} for ${name}: $${(price / 100).toLocaleString()} at ${(((price - cost) / price) * 100).toFixed(1)}% margin`);
    done("/app");
    return `${r.code} created in Scoping.`;
  });
}

/* ---------- Templates, routing ---------- */
export async function saveTemplate(id: string | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const t = z.object({ channel: z.string().trim().min(2).max(40), name: z.string().trim().min(2).max(80), summary: z.string().trim().min(5).max(240), body: z.string().trim().min(10).max(4000), status: z.enum(["active", "draft"]) }).parse(Object.fromEntries(fd));
    if (id) await q("UPDATE templates SET channel=$2, name=$3, summary=$4, body=$5, status=$6 WHERE id=$1", [id, t.channel, t.name, t.summary, t.body, t.status]);
    else await q("INSERT INTO templates (channel, name, summary, body, status) VALUES ($1,$2,$3,$4,$5)", [t.channel, t.name, t.summary, t.body, t.status]);
    await audit("Outreach", id ? "Template updated" : "Template created", t.name);
    done("/app");
  });
}
export async function deleteTemplate(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ name: string }>("DELETE FROM templates WHERE id = $1 RETURNING name", [id]);
    await audit("Outreach", "Template deleted", r.name);
    done("/app");
  });
}
export async function saveRule(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const r = z.object({ name: z.string().trim().min(2).max(80), match: z.string().trim().min(2).max(120), destination: z.string().trim().min(2).max(80), sla_minutes: z.coerce.number().int().min(5).max(10080) }).parse(Object.fromEntries(fd));
    await q("INSERT INTO routing_rules (name, match, destination, sla_minutes, sort) VALUES ($1,$2,$3,$4,(SELECT coalesce(max(sort),0)+1 FROM routing_rules))", [r.name, r.match, r.destination, r.sla_minutes]);
    await audit("Admin", "Routing rule added", `${r.name} → ${r.destination}`);
    done("/app");
  });
}
export async function toggleRule(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ name: string; status: string }>("UPDATE routing_rules SET status = CASE status WHEN 'active' THEN 'standby' ELSE 'active' END WHERE id = $1 RETURNING name, status", [id]);
    await audit("Admin", "Routing rule toggled", `${r.name} → ${r.status}`);
    done("/app");
  });
}
export async function deleteRule(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ name: string }>("DELETE FROM routing_rules WHERE id = $1 RETURNING name", [id]);
    await audit("Admin", "Routing rule deleted", r.name);
    done("/app");
  });
}

/* ---------- Legal & invoices ---------- */
export async function saveLegalTemplate(id: string | null, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const t = z.object({ name: z.string().trim().min(2).max(120), summary: z.string().trim().min(5).max(240), body: z.string().trim().min(20).max(50000) }).parse(Object.fromEntries(fd));
    if (id) await q("UPDATE legal_templates SET name=$2, summary=$3, body=$4, updated_at=now() WHERE id=$1", [id, t.name, t.summary, t.body]);
    else await q("INSERT INTO legal_templates (name, summary, body) VALUES ($1,$2,$3)", [t.name, t.summary, t.body]);
    await audit("Legal", id ? "Contract template edited" : "Contract template added", t.name);
    done("/app");
    return "Template saved.";
  });
}

export async function createInvoice(input: { client: string; client_email: string; due_date: string; items: { description: string; qty: number; unit: number }[] }): Promise<ActionResult> {
  return guard(async () => {
    const v = z
      .object({
        client: z.string().trim().min(2).max(120),
        client_email: z.union([z.literal(""), z.string().trim().email()]),
        due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
        items: z.array(z.object({ description: z.string().trim().min(1).max(200), qty: z.number().positive().max(10000), unit: z.number().min(0).max(10_000_000) })).min(1, "Add a line item"),
      })
      .parse(input);
    const items = v.items.map((i) => ({ description: i.description, qty: i.qty, unit_cents: Math.round(i.unit * 100) }));
    const total = items.reduce((a, i) => a + Math.round(i.qty * i.unit_cents), 0);
    const r = await one<{ number: string }>("INSERT INTO invoices (client, client_email, items, total_cents, due_date) VALUES ($1,$2,$3::jsonb,$4,$5) RETURNING number", [v.client, v.client_email || null, JSON.stringify(items), total, v.due_date]);
    await audit("Legal", "Invoice created", `${r.number} ${v.client} $${(total / 100).toLocaleString()}`);
    done("/app");
    return `${r.number} created.`;
  });
}
export async function setInvoiceStatus(id: string, status: "draft" | "sent" | "paid"): Promise<ActionResult> {
  return guard(async () => {
    z.enum(["draft", "sent", "paid"]).parse(status);
    const r = await one<{ number: string }>("UPDATE invoices SET status=$2 WHERE id=$1 RETURNING number", [id, status]);
    await audit("Legal", "Invoice status changed", `${r.number} → ${status}`);
    done("/app");
  });
}

/* ---------- Wins ---------- */
export async function logWin(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const w = z.object({ title: z.string().trim().min(2).max(160), amount: money, closed_by: z.string().min(1) }).parse(Object.fromEntries(fd));
    await q("INSERT INTO wins (title, amount_cents, closed_by) VALUES ($1,$2,$3)", [w.title, w.amount, w.closed_by]);
    await audit("Wins", "Win celebrated", `${w.title} $${(w.amount / 100).toLocaleString()}`);
    done("/app");
    return "Win logged.";
  });
}

/* ---------- Marketing ---------- */
export async function saveLandingPage(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const p = z.object({ title: z.string().trim().min(2).max(120), path: z.string().trim().min(1).max(120), kind: z.enum(["web", "email"]) }).parse(Object.fromEntries(fd));
    await q("INSERT INTO landing_pages (title, path, kind) VALUES ($1,$2,$3)", [p.title, p.path, p.kind]);
    await audit("Marketing", "Landing page created", `${p.title} (${p.path})`);
    done("/app");
  });
}
export async function toggleLandingPage(id: string): Promise<ActionResult> {
  return guard(async () => {
    const r = await one<{ title: string; status: string }>("UPDATE landing_pages SET status = CASE status WHEN 'draft' THEN 'published' ELSE 'draft' END WHERE id=$1 RETURNING title, status", [id]);
    await audit("Marketing", r.status === "published" ? "Landing page published" : "Landing page unpublished", r.title);
    done("/app");
  });
}

/* ---------- Settings & metrics ---------- */
export async function saveSettings(fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const s = z.object({ workspace_name: z.string().trim().min(2).max(60), timezone: z.string().refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), "Unknown timezone"), mrr_target: money, pipeline_target: money, contact_email: z.string().trim().email() }).parse(Object.fromEntries(fd));
    await q("UPDATE settings SET workspace_name=$1, timezone=$2, mrr_target_cents=$3, pipeline_target_cents=$4, contact_email=$5 WHERE id=1", [s.workspace_name, s.timezone, s.mrr_target, s.pipeline_target, s.contact_email]);
    await audit("Admin", "Settings updated", `Workspace "${s.workspace_name}", ${s.timezone}`);
    done("/app");
    return "Settings saved.";
  });
}
export async function saveManualMetric(key: string, value: number, target: number): Promise<ActionResult> {
  return guard(async () => {
    const v = z.object({ value: z.number().finite(), target: z.number().finite() }).parse({ value, target });
    const r = await one<{ label: string }>("UPDATE manual_metrics SET value=$2, target=$3, updated_at=now() WHERE key=$1 RETURNING label", [key, v.value, v.target]);
    await audit("Metrics", "Manual metric updated", `${r.label}: ${v.value} (target ${v.target})`);
    done("/app");
  });
}

/* ---------- AI command ---------- */
export async function runMissionAction(mission: string): Promise<ActionResult & { runId?: string }> {
  try {
    await requireSession();
    const m = z.string().trim().min(4, "Describe the mission").max(400).parse(mission);
    const { agents, findings } = await runMission(m);
    let narrative: string | null = null;
    let note: string | undefined;
    try {
      narrative = await synthesize(m, findings);
    } catch (e) {
      note = `Agent findings are ready. Claude synthesis failed: ${(e as Error).message}`;
    }
    const r = await one<{ id: string }>("INSERT INTO ai_runs (mission, agents, findings, narrative) VALUES ($1,$2,$3::jsonb,$4) RETURNING id", [m, agents, JSON.stringify(findings), narrative]);
    await audit("AI command", "Mission run", `"${m}" → ${agents.length} agents`);
    done("/app/ai-command");
    return { ok: true, runId: r.id, message: note };
  } catch (e) {
    return fail(e);
  }
}
