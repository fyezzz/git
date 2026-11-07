export const usd = (cents: number, opts: { compact?: boolean; exact?: boolean } = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.exact ? 2 : 0,
    minimumFractionDigits: opts.exact ? 2 : 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(cents / 100);

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
export const int = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

export function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

export function ago(d: string | Date): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const dateTime = (d: string | Date, tz?: string) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz });
export const shortDate = (d: string | Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" });

export const STAGES = ["lead", "contacted", "qualified", "proposal", "won", "lost", "fridge"] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABEL: Record<Stage, string> = { lead: "Lead", contacted: "Contacted", qualified: "Qualified", proposal: "Proposal made", won: "Won", lost: "Lost", fridge: "Fridge" };

export const TICKET_STAGES = ["scoping", "approved", "development", "qa", "delivered"] as const;
export type TicketStage = (typeof TICKET_STAGES)[number];
export const TICKET_STAGE_LABEL: Record<TicketStage, string> = { scoping: "Scoping", approved: "Requirements approved", development: "In development", qa: "QA review", delivered: "Delivered" };
