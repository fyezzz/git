export const STAGES = ["new", "contacted", "qualified", "booked", "won", "lost"] as const;
export type Stage = (typeof STAGES)[number];

export const SOURCES = ["website", "facebook_ads", "google_ads", "referral", "instagram", "other"] as const;
export type Source = (typeof SOURCES)[number];

export const BUDGETS = ["under_1k", "1k_5k", "5k_15k", "15k_plus"] as const;
export type Budget = (typeof BUDGETS)[number];

export const TIMELINES = ["now", "30_days", "90_days", "exploring"] as const;
export type Timeline = (typeof TIMELINES)[number];

export const ROLES = ["owner", "executive", "manager", "individual"] as const;
export type Role = (typeof ROLES)[number];

export type Tier = "hot" | "warm" | "cold";

export interface Qualification {
  score: number;
  tier: Tier;
  breakdown: { budget: number; authority: number; need: number; timeline: number };
  reasons: string[];
  nextAction: "book_call" | "nurture" | "disqualify";
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: Source;
  budget: Budget;
  timeline: Timeline;
  role: Role;
  need: string;
  stage: Stage;
  qualification: Qualification;
  createdAt: string;
  firstResponseAt?: string;
  ownerId?: string;
  dealValue: number;
}

export interface Message {
  id: string;
  leadId: string;
  direction: "inbound" | "outbound";
  author: "lead" | "ai_agent" | "rep";
  body: string;
  sentAt: string;
}

export interface Booking {
  id: string;
  leadId: string;
  start: string;
  end: string;
  repId: string;
  createdAt: string;
}

export interface Rep {
  id: string;
  name: string;
  email: string;
}

export interface SalesNotification {
  id: string;
  leadId: string;
  repId: string;
  ruleId: string;
  summary: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  leadId: string;
  type: "captured" | "responded" | "qualified" | "stage_changed" | "booked" | "notified";
  detail: string;
  at: string;
}
