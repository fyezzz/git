export function Header({ title, subtitle, what, why, start, actions }: { title: string; subtitle: string; what: string; why: string; start: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <dl className="mt-5 grid overflow-hidden rounded-xl border border-line bg-panel sm:grid-cols-3">
        {[["What", what], ["Why", why], ["Start", start]].map(([k, v]) => (
          <div key={k} className="border-line px-4 py-3 sm:border-r last:border-r-0 max-sm:border-b max-sm:last:border-b-0">
            <dt className="kicker text-[10px]">{k}</dt>
            <dd className="mt-1 text-xs text-text">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

export function Card({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, delta, good }: { label: string; value: string; sub?: string; delta?: string; good?: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="kicker text-[10px]">{label}</p>
        {delta && <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${good ? "border-neon/40 text-neon" : "border-danger/40 text-danger"}`}>{delta}</span>}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Bar({ value, max, color = "bg-neon" }: { value: number; max: number; color?: string }) {
  const p = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return <div className="h-1.5 overflow-hidden rounded-full bg-panel-2"><div className={`h-full rounded-full ${color}`} style={{ width: `${p}%` }} /></div>;
}

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "neon" | "warm" | "cold" | "danger" | "muted" }) {
  const t = { neon: "border-neon/40 text-neon bg-neon-dim", warm: "border-warm/40 text-warm bg-warm/10", cold: "border-cold/40 text-cold bg-cold/10", danger: "border-danger/40 text-danger bg-danger/10", muted: "border-line text-muted" }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold ${t}`}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">{children}</p>;
}
