import "server-only";
import { q } from "./db";
import type { Stage, TicketStage } from "./format";

export interface Deal {
  id: string;
  company: string;
  industry: string;
  title: string;
  seats: number | null;
  value_cents: number;
  stage: Stage;
  ai_score: number;
  signal: string;
  owner_id: string | null;
  owner_initials: string | null;
  owner_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  next_step: string | null;
  channel: string;
  ai_engine: string | null;
  attribution: Record<string, unknown>;
  created_at: string;
  stage_changed_at: string;
  first_response_at: string | null;
}

export const getSettings = async () =>
  (await q<{ workspace_name: string; timezone: string; mrr_target_cents: number; pipeline_target_cents: number; contact_email: string }>("SELECT * FROM settings WHERE id = 1"))[0]!;

export const getMembers = () => q<{ id: string; name: string; initials: string; title: string }>("SELECT * FROM members ORDER BY name");

export const getDeals = () =>
  q<Deal>(`SELECT d.*, m.initials AS owner_initials, m.name AS owner_name FROM deals d LEFT JOIN members m ON m.id = d.owner_id ORDER BY d.stage_changed_at DESC`);

export async function getRevenue() {
  const [r] = await q<{ mrr: number; churned: number; start_mrr: number; clients: number; prev_mrr: number }>(`SELECT
    coalesce(sum(mrr_cents) FILTER (WHERE status = 'active'), 0)::int AS mrr,
    coalesce(sum(mrr_cents) FILTER (WHERE status = 'cancelled' AND cancelled_at > now() - interval '30 days'), 0)::int AS churned,
    coalesce(sum(mrr_cents) FILTER (WHERE started_at < now() - interval '30 days' AND (cancelled_at IS NULL OR cancelled_at > now() - interval '30 days')), 0)::int AS start_mrr,
    count(*) FILTER (WHERE status = 'active')::int AS clients,
    coalesce(sum(mrr_cents) FILTER (WHERE started_at < now() - interval '30 days' AND (cancelled_at IS NULL OR cancelled_at > now() - interval '30 days')), 0)::int AS prev_mrr
    FROM subscriptions`);
  const [cost] = await q<{ cost: number; price: number }>(`SELECT coalesce(sum(cost_cents),0)::int AS cost, coalesce(sum(price_cents),0)::int AS price FROM tickets WHERE stage <> 'scoping'`);
  const mrr = r!.mrr;
  const churnPct = r!.start_mrr > 0 ? (r!.churned / r!.start_mrr) * 100 : 0;
  const growthPct = r!.prev_mrr > 0 ? ((mrr - r!.prev_mrr) / r!.prev_mrr) * 100 : 0;
  // Margin: delivery cost of active work vs its price when tickets carry pricing; otherwise a 58% configured baseline is not invented — we report null.
  const margin = cost!.price > 0 ? ((cost!.price - cost!.cost) / cost!.price) * 100 : null;
  return { mrr, arr: mrr * 12, churnPct, growthPct, clients: r!.clients, margin };
}

export async function getPipelineStats() {
  const deals = await getDeals();
  const open = deals.filter((d) => !["won", "lost", "fridge"].includes(d.stage));
  const won = deals.filter((d) => d.stage === "won");
  const reachedQualified = deals.filter((d) => ["qualified", "proposal", "won", "lost"].includes(d.stage));
  const responseTimes = deals.filter((d) => d.first_response_at).map((d) => (Date.parse(d.first_response_at!) - Date.parse(d.created_at)) / 1000);
  return {
    deals,
    openCount: open.length,
    pipelineValue: open.reduce((a, d) => a + d.value_cents, 0),
    wonValue: won.reduce((a, d) => a + d.value_cents, 0),
    wonCount: won.length,
    closeRate: reachedQualified.length ? (won.length / reachedQualified.length) * 100 : 0,
    avgDeal: won.length ? won.reduce((a, d) => a + d.value_cents, 0) / won.length : 0,
    speedToLeadSec: responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
    funnel: [
      { label: "Captured", value: deals.length },
      { label: "Contacted", value: deals.filter((d) => d.stage !== "lead").length },
      { label: "Qualified", value: reachedQualified.length },
      { label: "Proposal", value: deals.filter((d) => ["proposal", "won"].includes(d.stage)).length },
      { label: "Won", value: won.length },
    ],
  };
}

export const getMonthlyWon = () =>
  q<{ month: string; total: number }>(`SELECT to_char(m, 'Mon') AS month, coalesce(sum(w.amount_cents), 0)::int AS total
    FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
    LEFT JOIN wins w ON date_trunc('month', w.created_at) = m GROUP BY m ORDER BY m`);

export interface Ticket {
  id: string;
  code: string;
  title: string;
  project_type: string;
  priority: "standard" | "high" | "urgent";
  requirements: string;
  stage: TicketStage;
  progress: number;
  developer_id: string | null;
  developer_label: string | null;
  deal_id: string | null;
  price_cents: number;
  cost_cents: number;
  due_date: string | null;
  created_at: string;
  delivered_at: string | null;
}
export const getTickets = () =>
  q<Ticket>(`SELECT t.*, d.label AS developer_label, to_char(t.due_date, 'YYYY-MM-DD') AS due_date FROM tickets t LEFT JOIN developers d ON d.id = t.developer_id ORDER BY t.created_at DESC, t.code DESC`);

export async function getDevelopers() {
  return q<{ id: string; label: string; initials: string; specialty: string; slots: number; active: number; capacity: number }>(`SELECT d.*,
    count(t.id) FILTER (WHERE t.stage IN ('approved','development','qa'))::int AS active,
    least(100, round(100.0 * count(t.id) FILTER (WHERE t.stage IN ('approved','development','qa')) / d.slots))::int AS capacity
    FROM developers d LEFT JOIN tickets t ON t.developer_id = d.id GROUP BY d.id ORDER BY d.label`);
}

export async function getFulfillment() {
  const tickets = await getTickets();
  const active = tickets.filter((t) => ["approved", "development", "qa"].includes(t.stage));
  const delivered = tickets.filter((t) => t.stage === "delivered" && t.delivered_at);
  const onTime = delivered.filter((t) => !t.due_date || Date.parse(t.delivered_at!) <= Date.parse(t.due_date) + 86400000);
  const cycles = delivered.map((t) => (Date.parse(t.delivered_at!) - Date.parse(t.created_at)) / 86400000);
  const devs = await getDevelopers();
  const totalSlots = devs.reduce((a, d) => a + d.slots, 0);
  return {
    tickets,
    active,
    qa: tickets.filter((t) => t.stage === "qa"),
    onTimePct: delivered.length ? (onTime.length / delivered.length) * 100 : null,
    avgCycleDays: cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : null,
    capacityPct: totalSlots ? (active.length / totalSlots) * 100 : 0,
    devs,
  };
}

export const getCatalog = () =>
  q<{ id: string; category: string; name: string; description: string; kind: string; price_cents: number | null; cost_cents: number; price_min_cents: number | null; price_max_cents: number | null }>(
    "SELECT * FROM catalog_items ORDER BY CASE category WHEN 'SaaS plans' THEN 0 WHEN 'Enterprise builds' THEN 2 ELSE 1 END, category, coalesce(price_cents, cost_cents, price_min_cents)",
  );

export const getLeadReviews = () => q<{ id: string; name: string; category: string; contributors: number; evidence: string; classification: string; score: number; status: string; source_url: string | null; created_at: string }>("SELECT * FROM lead_reviews ORDER BY (status = 'pending') DESC, score DESC, created_at DESC");
export const getSuppression = () => q<{ id: string; value: string; reason: string; created_at: string }>("SELECT * FROM suppression ORDER BY created_at DESC");
export const getSequences = () => q<{ id: string; name: string; touches: number; enrolled: number; status: string }>("SELECT * FROM sequences ORDER BY name");
export const getTemplates = () => q<{ id: string; channel: string; name: string; summary: string; body: string; status: string }>("SELECT * FROM templates ORDER BY status, channel");
export const getRules = () => q<{ id: string; name: string; match: string; destination: string; sla_minutes: number; status: string }>("SELECT * FROM routing_rules ORDER BY sort, name");
export const getLegalTemplates = () => q<{ id: string; name: string; summary: string; body: string; updated_at: string }>("SELECT * FROM legal_templates ORDER BY name");
export const getInvoices = () => q<{ id: string; number: string; client: string; client_email: string | null; items: { description: string; qty: number; unit_cents: number }[]; total_cents: number; status: string; due_date: string; created_at: string }>("SELECT *, to_char(due_date,'YYYY-MM-DD') AS due_date FROM invoices ORDER BY created_at DESC");
export const getWins = () => q<{ id: string; title: string; amount_cents: number; closed_by: string; closer_name: string | null; created_at: string }>("SELECT w.*, m.name AS closer_name FROM wins w LEFT JOIN members m ON m.id = w.closed_by ORDER BY w.created_at DESC");
export const getLandingPages = () => q<{ id: string; title: string; path: string; kind: string; status: string }>("SELECT * FROM landing_pages ORDER BY kind, title");
export const getManualMetrics = () => q<{ key: string; grp: string; label: string; value: number; target: number; unit: string; better: string; updated_at: string }>("SELECT key, grp, label, value::float8 AS value, target::float8 AS target, unit, better, updated_at FROM manual_metrics ORDER BY grp, label");
export const getAudit = (source?: string) =>
  q<{ id: number; at: string; source: string; action: string; detail: string }>(
    source ? "SELECT * FROM audit_log WHERE source = $1 ORDER BY at DESC, id DESC LIMIT 300" : "SELECT * FROM audit_log ORDER BY at DESC, id DESC LIMIT 300",
    source ? [source] : [],
  );
export const getAiRuns = () => q<{ id: string; mission: string; agents: string[]; findings: { agent: string; headline: string; items: string[] }[]; narrative: string | null; created_at: string }>("SELECT * FROM ai_runs ORDER BY created_at DESC LIMIT 10");

/** AI attribution report: traffic → leads → pipeline → won by channel and AI engine. */
export async function getAttributionReport(days = 30) {
  const traffic = await q<{ channel: string; ai_engine: string | null; visitors: number; views: number }>(
    `SELECT channel, ai_engine, count(DISTINCT visitor_id)::int AS visitors, count(*)::int AS views FROM page_views WHERE at > now() - ($1::int * interval '1 day') GROUP BY 1, 2`,
    [days],
  );
  const leads = await q<{ channel: string; ai_engine: string | null; leads: number; pipeline: number; won: number; won_count: number; self_reported: number }>(
    `SELECT channel, ai_engine, count(*)::int AS leads,
      coalesce(sum(value_cents) FILTER (WHERE stage NOT IN ('won','lost','fridge')), 0)::int AS pipeline,
      coalesce(sum(value_cents) FILTER (WHERE stage = 'won'), 0)::int AS won,
      count(*) FILTER (WHERE stage = 'won')::int AS won_count,
      count(*) FILTER (WHERE attribution->>'confidence' = 'self_reported')::int AS self_reported
     FROM deals GROUP BY 1, 2`,
  );
  const daily = await q<{ day: string; ai: number; total: number }>(
    `SELECT to_char(d, 'MM-DD') AS day, count(*) FILTER (WHERE pv.channel = 'ai_assistant')::int AS ai, count(pv.id)::int AS total
     FROM generate_series(date_trunc('day', now()) - (($1::int - 1) * interval '1 day'), date_trunc('day', now()), interval '1 day') d
     LEFT JOIN page_views pv ON date_trunc('day', pv.at) = d GROUP BY d ORDER BY d`,
    [days],
  );
  const landing = await q<{ path: string; ai_views: number; views: number }>(
    `SELECT path, count(*) FILTER (WHERE channel = 'ai_assistant')::int AS ai_views, count(*)::int AS views FROM page_views WHERE at > now() - ($1::int * interval '1 day') GROUP BY path ORDER BY ai_views DESC LIMIT 8`,
    [days],
  );
  return { traffic, leads, daily, landing };
}
