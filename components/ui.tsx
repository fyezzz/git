import type { Stage, Tier } from "@/lib/domain/types";

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-panel p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, accent = false }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={`mt-2 font-mono text-3xl font-semibold ${accent ? "text-neon" : "text-text"}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

const TIER_STYLE: Record<Tier, string> = {
  hot: "bg-neon-dim text-neon border-neon/40",
  warm: "bg-warm/10 text-warm border-warm/40",
  cold: "bg-cold/10 text-cold border-cold/40",
};

export function TierBadge({ tier, score }: { tier: Tier; score?: number }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase ${TIER_STYLE[tier]}`}>
      {tier}
      {score !== undefined && <span className="opacity-80">· {score}</span>}
    </span>
  );
}

const STAGE_STYLE: Record<Stage, string> = {
  new: "text-muted border-line",
  contacted: "text-cold border-cold/40",
  qualified: "text-warm border-warm/40",
  booked: "text-neon border-neon/40",
  won: "bg-neon text-ink border-neon",
  lost: "text-danger border-danger/40",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STAGE_STYLE[stage]}`}>{stage}</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Bar({ value, max, label, right }: { value: number; max: number; label: string; right?: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-text">{label}</span><span className="font-mono text-muted">{right ?? value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-panel-2"><div className="h-full rounded-full bg-neon transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });
