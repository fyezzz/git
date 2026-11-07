import { matchingRules } from "./domain/automations";
import { isSlotOpen, type Slot } from "./domain/booking";
import { qualify } from "./domain/qualify";
import { composeFirstResponse } from "./domain/responder";
import type { ActivityEvent, Booking, Budget, Lead, Message, Rep, Role, SalesNotification, Source, Stage, Timeline } from "./domain/types";

/**
 * In-memory store. Data resets on server restart. The Postgres-ready model lives in prisma/schema.prisma;
 * replacing this module with a Prisma-backed repository is the one change needed to persist.
 */
interface DB {
  leads: Lead[];
  messages: Message[];
  bookings: Booking[];
  notifications: SalesNotification[];
  activity: ActivityEvent[];
  reps: Rep[];
  rrCursor: number;
}

export const DEAL_VALUE: Record<Budget, number> = { under_1k: 750, "1k_5k": 3000, "5k_15k": 9500, "15k_plus": 22000 };

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export interface CaptureInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: Source;
  budget: Budget;
  timeline: Timeline;
  role: Role;
  need: string;
}

export interface CaptureResult {
  lead: Lead;
  reply: Message;
  notifications: SalesNotification[];
  responseMs: number;
}

function log(db: DB, leadId: string, type: ActivityEvent["type"], detail: string, at = new Date().toISOString()) {
  db.activity.unshift({ id: id("evt"), leadId, type, detail, at });
}

function notify(db: DB, lead: Lead, ruleId: string, summary: string, at?: string): SalesNotification {
  const n: SalesNotification = {
    id: id("ntf"),
    leadId: lead.id,
    repId: lead.ownerId ?? db.reps[0]!.id,
    ruleId,
    summary,
    createdAt: at ?? new Date().toISOString(),
  };
  db.notifications.unshift(n);
  log(db, lead.id, "notified", `Sales notified: ${summary}`, n.createdAt);
  return n;
}

function captureInto(db: DB, input: CaptureInput, now = new Date()): CaptureResult {
  const t0 = performance.now();
  const createdAt = now.toISOString();
  const qualification = qualify(input);
  const lead: Lead = {
    id: id("lead"),
    ...input,
    stage: "new",
    qualification,
    createdAt,
    dealValue: DEAL_VALUE[input.budget],
  };
  db.leads.unshift(lead);
  log(db, lead.id, "captured", `Captured from ${input.source.replace("_", " ")}`, createdAt);
  db.messages.push({ id: id("msg"), leadId: lead.id, direction: "inbound", author: "lead", body: input.need, sentAt: createdAt });

  const replyAt = new Date(now.getTime() + 1500).toISOString();
  const reply: Message = { id: id("msg"), leadId: lead.id, direction: "outbound", author: "ai_agent", body: composeFirstResponse(lead), sentAt: replyAt };
  db.messages.push(reply);
  lead.firstResponseAt = replyAt;
  lead.stage = "contacted";
  log(db, lead.id, "responded", "AI agent sent instant response", replyAt);
  log(db, lead.id, "qualified", `Scored ${qualification.score}/100 (${qualification.tier})`, replyAt);

  const notifications: SalesNotification[] = [];
  for (const rule of matchingRules("Lead captured", lead)) {
    if (rule.action === "assign_owner") {
      lead.ownerId = db.reps[db.rrCursor % db.reps.length]!.id;
      db.rrCursor++;
    } else if (rule.action === "advance_to_qualified") {
      lead.stage = "qualified";
      log(db, lead.id, "stage_changed", "Contacted → Qualified (auto)", replyAt);
    } else if (rule.action === "notify_sales") {
      notifications.push(notify(db, lead, rule.id, `${qualification.tier.toUpperCase()} lead ${lead.name} scored ${qualification.score}`, replyAt));
    }
  }
  return { lead, reply, notifications, responseMs: Math.round(performance.now() - t0) };
}

const SEED: (CaptureInput & { minutesAgo: number; stage?: Stage })[] = [
  { name: "Maya Thompson", email: "maya@peakroofing.co", company: "Peak Roofing", source: "google_ads", budget: "15k_plus", timeline: "now", role: "owner", need: "We get 200 leads a month but follow up is slow and we lose half to competitors. Need automated booking and a real CRM pipeline.", minutesAgo: 35, stage: "booked" },
  { name: "Derek Osei", email: "derek@brightsmiles.dental", company: "Bright Smiles Dental", source: "facebook_ads", budget: "5k_15k", timeline: "30_days", role: "executive", need: "Want more new patient appointments and to automate follow-up texts.", minutesAgo: 140 },
  { name: "Priya Nair", email: "priya@nairlaw.com", company: "Nair Law", source: "referral", budget: "5k_15k", timeline: "now", role: "owner", need: "Consult requests slip through the cracks. Need booking and sales handoff.", minutesAgo: 420, stage: "won" },
  { name: "Jonah Weiss", email: "jonah@gymlab.fit", company: "GymLab", source: "instagram", budget: "1k_5k", timeline: "90_days", role: "manager", need: "Looking at options for membership leads.", minutesAgo: 900 },
  { name: "Carla Ruiz", email: "carla@ruizhvac.com", company: "Ruiz HVAC", source: "website", budget: "15k_plus", timeline: "30_days", role: "owner", need: "Scale revenue past 3M, our sales pipeline is a spreadsheet and leads go cold.", minutesAgo: 1500 },
  { name: "Tom Becker", email: "tom@example.com", source: "other", budget: "under_1k", timeline: "exploring", role: "individual", need: "Just curious.", minutesAgo: 2600, stage: "lost" },
  { name: "Aisha Khan", email: "aisha@lumenmedspa.com", company: "Lumen Med Spa", source: "facebook_ads", budget: "5k_15k", timeline: "now", role: "owner", need: "Need to automate lead follow up and increase booking conversion from ads.", minutesAgo: 3100 },
  { name: "Ben Carter", email: "ben@cartersolar.io", company: "Carter Solar", source: "google_ads", budget: "1k_5k", timeline: "30_days", role: "executive", need: "Sales team wastes time on unqualified leads.", minutesAgo: 4300 },
];

function seed(): DB {
  const db: DB = {
    leads: [],
    messages: [],
    bookings: [],
    notifications: [],
    activity: [],
    reps: [
      { id: "rep_alex", name: "Alex Rivera", email: "alex@ffo.example" },
      { id: "rep_sam", name: "Sam Lee", email: "sam@ffo.example" },
    ],
    rrCursor: 0,
  };
  const now = Date.now();
  for (const s of [...SEED].reverse()) {
    const { minutesAgo, stage, ...input } = s;
    const { lead } = captureInto(db, input, new Date(now - minutesAgo * 60_000));
    if (stage === "booked" || stage === "won") {
      const start = new Date(now + 26 * 3600_000);
      start.setUTCMinutes(0, 0, 0);
      db.bookings.push({ id: id("bkg"), leadId: lead.id, repId: lead.ownerId!, start: start.toISOString(), end: new Date(start.getTime() + 30 * 60_000).toISOString(), createdAt: lead.createdAt });
    }
    if (stage) lead.stage = stage;
  }
  return db;
}

const g = globalThis as unknown as { __ffoDb?: DB };
export const db: DB = (g.__ffoDb ??= seed());

export function captureLead(input: CaptureInput): CaptureResult {
  return captureInto(db, input);
}

export function getLead(leadId: string): Lead | undefined {
  return db.leads.find((l) => l.id === leadId);
}

const STAGE_LABEL: Record<Stage, string> = { new: "New", contacted: "Contacted", qualified: "Qualified", booked: "Booked", won: "Won", lost: "Lost" };
export { STAGE_LABEL };

export function moveStage(leadId: string, stage: Stage): Lead {
  const lead = getLead(leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);
  if (lead.stage === stage) return lead;
  log(db, lead.id, "stage_changed", `${STAGE_LABEL[lead.stage]} → ${STAGE_LABEL[stage]}`);
  lead.stage = stage;
  return lead;
}

export function bookCall(leadId: string, slot: Slot): Booking {
  const lead = getLead(leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);
  const repId = lead.ownerId ?? db.reps[0]!.id;
  if (!isSlotOpen(slot, db.bookings, repId)) throw new Error("Slot is no longer available");
  const booking: Booking = { id: id("bkg"), leadId, repId, start: slot.start, end: slot.end, createdAt: new Date().toISOString() };
  db.bookings.push(booking);
  log(db, lead.id, "booked", `Call booked for ${new Date(slot.start).toUTCString()}`);
  if (lead.stage !== "won") lead.stage = "booked";
  for (const rule of matchingRules("Call booked", lead)) {
    if (rule.action === "notify_sales") notify(db, lead, rule.id, `${lead.name} booked a call`);
  }
  return booking;
}

export function repName(repId?: string): string {
  return db.reps.find((r) => r.id === repId)?.name ?? "Unassigned";
}

export function analytics() {
  const leads = db.leads;
  const total = leads.length;
  const count = (pred: (l: Lead) => boolean) => leads.filter(pred).length;
  const reached = (s: Stage[]) => count((l) => s.includes(l.stage));
  const responseTimes = leads.filter((l) => l.firstResponseAt).map((l) => (Date.parse(l.firstResponseAt!) - Date.parse(l.createdAt)) / 1000);
  const avgResponseSec = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
  const won = leads.filter((l) => l.stage === "won");
  const open = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const bySource = Object.entries(
    leads.reduce<Record<string, { leads: number; won: number }>>((acc, l) => {
      const row = (acc[l.source] ??= { leads: 0, won: 0 });
      row.leads++;
      if (l.stage === "won") row.won++;
      return acc;
    }, {}),
  ).sort((a, b) => b[1].leads - a[1].leads);

  return {
    total,
    hot: count((l) => l.qualification.tier === "hot"),
    avgScore: total ? Math.round(leads.reduce((a, l) => a + l.qualification.score, 0) / total) : 0,
    avgResponseSec,
    funnel: [
      { label: "Captured", value: total },
      { label: "Responded", value: count((l) => !!l.firstResponseAt) },
      { label: "Qualified", value: reached(["qualified", "booked", "won"]) },
      { label: "Booked", value: reached(["booked", "won"]) },
      { label: "Won", value: won.length },
    ],
    wonRevenue: won.reduce((a, l) => a + l.dealValue, 0),
    pipelineValue: open.reduce((a, l) => a + l.dealValue, 0),
    bySource,
  };
}
