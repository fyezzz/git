import type { Lead } from "./types";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: (lead: Lead) => boolean;
  action: "notify_sales" | "assign_owner" | "advance_to_qualified";
  description: string;
}

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "hot-lead-alert",
    name: "Hot lead alert",
    trigger: "Lead captured",
    condition: (l) => l.qualification.tier === "hot",
    action: "notify_sales",
    description: "Score 70+ notifies the assigned rep immediately with the qualification summary.",
  },
  {
    id: "auto-qualify",
    name: "Auto-qualify",
    trigger: "Lead captured",
    condition: (l) => l.qualification.tier !== "cold",
    action: "advance_to_qualified",
    description: "Hot and warm leads move straight to Qualified after the instant response.",
  },
  {
    id: "round-robin",
    name: "Round-robin owner",
    trigger: "Lead captured",
    condition: () => true,
    action: "assign_owner",
    description: "Every lead gets an owner so nothing sits unassigned.",
  },
  {
    id: "booking-alert",
    name: "Booked call handoff",
    trigger: "Call booked",
    condition: () => true,
    action: "notify_sales",
    description: "A booked call sends the rep the lead dossier and conversation history.",
  },
];

export function matchingRules(trigger: string, lead: Lead): AutomationRule[] {
  return AUTOMATION_RULES.filter((r) => r.trigger === trigger && r.condition(lead));
}
