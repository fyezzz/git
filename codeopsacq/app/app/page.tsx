import Link from "next/link";
import { Bar, Card, Header, Stat } from "@/components/app/ui";
import { getLeadReviews, getMonthlyWon, getPipelineStats, getRevenue, getSettings } from "@/lib/data";
import { int, pct, usd } from "@/lib/format";

export default async function Dashboard() {
  const [p, r, s, months, reviews] = await Promise.all([getPipelineStats(), getRevenue(), getSettings(), getMonthlyWon(), getLeadReviews()]);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const ai = p.deals.filter((d) => d.channel === "ai_assistant");
  const pending = reviews.filter((x) => x.status === "pending").length;
  const pts = months.map((m, i) => `${(i / Math.max(1, months.length - 1)) * 100},${100 - (m.total / maxMonth) * 90}`).join(" ");
  return (
    <>
      <Header title="Revenue command center" subtitle={`MRR is ${usd(r.mrr)}, ${r.growthPct >= 0 ? "up" : "down"} ${pct(Math.abs(r.growthPct))} on 30 days ago${r.margin !== null ? `, at a ${pct(r.margin)} delivery margin` : ""}.`} what="Operating snapshot" why="See the current operating state before choosing a workflow." start="Start with Pipeline or AI Command." actions={<><Link className="btn btn-ghost" href="/app/crm">Open pipeline ↗</Link><Link className="btn btn-primary" href="/app/lead-ops">Run lead ops ↗</Link></>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Pipeline value" value={usd(p.pipelineValue)} sub={`Across ${p.openCount} open opportunities`} />
        <Stat label="MRR" value={usd(r.mrr)} sub={`${usd(s.mrr_target_cents)} target · ${pct((r.mrr / s.mrr_target_cents) * 100, 0)}`} delta={`${r.growthPct >= 0 ? "+" : ""}${pct(r.growthPct)}`} good={r.growthPct >= 0} />
        <Stat label="Won value" value={usd(p.wonValue)} sub={`${p.wonCount} won deals · avg ${usd(p.avgDeal)}`} />
        <Stat label="Close rate" value={pct(p.closeRate)} sub={`${p.wonCount} wins from qualified`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue trajectory" subtitle="Won value by month · last 6 months" className="xl:col-span-2">
          <div className="relative h-56">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Won revenue by month">
              <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#02ef7d" stopOpacity=".35" /><stop offset="1" stopColor="#02ef7d" stopOpacity="0" /></linearGradient></defs>
              <polygon points={`0,100 ${pts} 100,100`} fill="url(#g)" />
              <polyline points={pts} fill="none" stroke="#02ef7d" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-6 text-center font-mono text-[11px] text-muted">{months.map((m) => <div key={m.month}><div>{m.month.toUpperCase()}</div><div className="text-text">{usd(m.total, { compact: true })}</div></div>)}</div>
        </Card>
        <Card title="Conversion funnel" subtitle="Lead-to-win velocity">
          <div className="space-y-3">{p.funnel.map((f) => <div key={f.label}><div className="mb-1 flex justify-between text-sm"><span>{f.label}</span><span className="font-mono">{f.value}</span></div><Bar value={f.value} max={p.funnel[0]!.value} /></div>)}</div>
          <div className="mt-5 border-t border-line pt-4"><div className="mb-1 flex justify-between text-xs text-muted"><span>Monthly MRR target</span><span>{usd(r.mrr)} / {usd(s.mrr_target_cents)}</span></div><Bar value={r.mrr} max={s.mrr_target_cents} /></div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/app/lead-ops" className="card p-5 transition hover:border-neon/50"><p className="kicker">Pending review</p><p className="mt-2 font-mono text-3xl">{pending}</p><p className="text-xs text-muted">Lead ops queue →</p></Link>
        <Link href="/app/attribution" className="card p-5 transition hover:border-neon/50"><p className="kicker">AI-sourced pipeline</p><p className="mt-2 font-mono text-3xl text-neon">{usd(ai.filter((d) => !["lost", "fridge"].includes(d.stage)).reduce((a, d) => a + d.value_cents, 0))}</p><p className="text-xs text-muted">{ai.length} leads from AI assistants →</p></Link>
        <Link href="/app/metrics" className="card p-5 transition hover:border-neon/50"><p className="kicker">Speed to lead</p><p className="mt-2 font-mono text-3xl">{p.speedToLeadSec ? `${Math.round(p.speedToLeadSec / 60)}m` : "—"}</p><p className="text-xs text-muted">{int(p.deals.length)} deals tracked →</p></Link>
      </div>
    </>
  );
}
