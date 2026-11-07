import type { Lead } from "./types";

/**
 * Instant first response. Deterministic templates keyed by tier, so every lead gets a reply in
 * milliseconds without an LLM dependency. Swap `composeFirstResponse` for a model call when one is wired.
 */
export const RESPONSE_TEMPLATES = {
  hot: "Hi {first}, thanks for reaching out about {need_short}. You're a strong fit, so let's skip the back-and-forth: grab a 30-minute strategy call below and we'll map out exactly how to hit your number.",
  warm: "Hi {first}, thanks for the details on {need_short}. A couple of quick questions so we point you at the right plan: what's your monthly lead volume today, and what's the biggest leak between lead and closed deal?",
  cold: "Hi {first}, thanks for your interest. We're sending you our free Revenue Leak Audit checklist so you can spot the quick wins first. When the timing is right, reply here and we'll pick it up.",
} as const;

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function shortNeed(need: string): string {
  const clean = need.trim().replace(/\s+/g, " ");
  if (clean.length <= 60) return clean.toLowerCase().replace(/[.!?]+$/, "");
  return `${clean.slice(0, 57).toLowerCase().trimEnd()}...`;
}

export function composeFirstResponse(lead: Pick<Lead, "name" | "need" | "qualification">): string {
  return RESPONSE_TEMPLATES[lead.qualification.tier]
    .replace("{first}", firstName(lead.name))
    .replace("{need_short}", shortNeed(lead.need));
}
