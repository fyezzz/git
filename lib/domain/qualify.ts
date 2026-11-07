import type { Budget, Qualification, Role, Tier, Timeline } from "./types";

/**
 * Deterministic BANT scoring (Budget, Authority, Need, Timeline). Each pillar is 0-25, total 0-100.
 * The weights are the single source of truth for the AI Agent settings page.
 */
export const BUDGET_POINTS: Record<Budget, number> = { under_1k: 3, "1k_5k": 12, "5k_15k": 20, "15k_plus": 25 };
export const AUTHORITY_POINTS: Record<Role, number> = { owner: 25, executive: 22, manager: 14, individual: 6 };
export const TIMELINE_POINTS: Record<Timeline, number> = { now: 25, "30_days": 20, "90_days": 10, exploring: 3 };

export const NEED_KEYWORDS = [
  "leads",
  "sales",
  "revenue",
  "booking",
  "appointments",
  "crm",
  "pipeline",
  "follow up",
  "follow-up",
  "conversion",
  "scale",
  "automate",
  "automation",
] as const;

export const TIER_THRESHOLDS = { hot: 70, warm: 45 } as const;

export interface QualifyInput {
  budget: Budget;
  role: Role;
  timeline: Timeline;
  need: string;
}

export function scoreNeed(need: string): { points: number; matched: string[] } {
  const text = need.toLowerCase();
  const matched = NEED_KEYWORDS.filter((k) => text.includes(k));
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Specificity: up to 10 points for a described problem, up to 15 for matching revenue-intent keywords.
  const specificity = Math.min(10, Math.floor(words / 3));
  const intent = Math.min(15, matched.length * 5);
  return { points: specificity + intent, matched: [...matched] };
}

export function tierFor(score: number): Tier {
  if (score >= TIER_THRESHOLDS.hot) return "hot";
  if (score >= TIER_THRESHOLDS.warm) return "warm";
  return "cold";
}

export function qualify(input: QualifyInput): Qualification {
  const budget = BUDGET_POINTS[input.budget];
  const authority = AUTHORITY_POINTS[input.role];
  const timeline = TIMELINE_POINTS[input.timeline];
  const need = scoreNeed(input.need);
  const score = budget + authority + timeline + need.points;
  const tier = tierFor(score);

  const reasons: string[] = [];
  if (budget >= 20) reasons.push("Budget fits a core engagement");
  if (budget <= 3) reasons.push("Budget below minimum engagement");
  if (authority >= 22) reasons.push("Speaking with a decision maker");
  if (authority <= 6) reasons.push("Not the decision maker");
  if (timeline >= 20) reasons.push("Ready to start within 30 days");
  if (timeline <= 3) reasons.push("Still exploring, no timeline");
  if (need.matched.length > 0) reasons.push(`Revenue intent: ${need.matched.join(", ")}`);

  const nextAction = tier === "hot" ? "book_call" : tier === "warm" ? "nurture" : input.budget === "under_1k" ? "disqualify" : "nurture";

  return { score, tier, breakdown: { budget, authority, need: need.points, timeline }, reasons, nextAction };
}
