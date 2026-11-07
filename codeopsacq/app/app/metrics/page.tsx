import { MetricEditor } from "./editor";
import { Card, Header } from "@/components/app/ui";
import { getFulfillment, getManualMetrics, getPipelineStats, getRevenue, getSettings } from "@/lib/data";
import { duration, pct, usd } from "@/lib/format";

type M = { label: string; value: string; target: string; met: boolean; source: string };

export default async function Metrics() {
  const [r, p, f, manual, s] = await Promise.all([getRevenue(), getPipelineStats(), getFulfillment(), getManualMetrics(), getSettings()]);
  const mm = Object.fromEntries(manual.map((m) => [m.key, m]));
  const spend = mm.marketing_spend?.value ?? 0;
  const newClients = Math.max(1, p.wonCount);
  const cac = (spend * 100) / newClients;
  const arpa = r.clients ? r.mrr / r.clients : 0;
  const ltv = r.churnPct > 0 ? arpa / (r.churnPct / 100) : arpa * 24;
  const groups: { name: string; source: string; items: M[] }[] = [
    { name: "Revenue", source: "Subscriptions + tickets", items: [
      { label: "MRR", value: usd(r.mrr), target: `${usd(s.mrr_target_cents)} goal`, met: r.mrr >= s.mrr_target_cents, source: "computed" },
      { label: "ARR", value: usd(r.arr), target: `${usd(s.mrr_target_cents * 12)} goal`, met: r.arr >= s.mrr_target_cents * 12, source: "computed" },
      { label: "Revenue churn (30d)", value: pct(r.churnPct), target: "< 5.0%", met: r.churnPct < 5, source: "computed" },
      { label: "LTV", value: usd(ltv), target: "ARPA ÷ churn", met: true, source: "computed" },
      { label: "CAC", value: usd(cac), target: "< $6,000", met: cac < 600000, source: "spend ÷ won deals" },
      { label: "LTV:CAC", value: cac ? `${(ltv / cac).toFixed(1)}×` : "—", target: "≥ 3×", met: cac ? ltv / cac >= 3 : false, source: "computed" },
      { label: "Delivery margin", value: r.margin === null ? "—" : pct(r.margin), target: "60% goal", met: (r.margin ?? 0) >= 60, source: "priced tickets" },
    ] },
    { name: "Sales", source: "CRM", items: [
      { label: "Pipeline value", value: usd(p.pipelineValue), target: `${usd(s.pipeline_target_cents)} goal`, met: p.pipelineValue >= s.pipeline_target_cents, source: "computed" },
      { label: "Close rate", value: pct(p.closeRate), target: "25% goal", met: p.closeRate >= 25, source: "computed" },
      { label: "Average deal size", value: usd(p.avgDeal), target: "$25,000 goal", met: p.avgDeal >= 2500000, source: "computed" },
      { label: "Speed-to-lead", value: duration(p.speedToLeadSec), target: "< 5m", met: p.speedToLeadSec > 0 && p.speedToLeadSec < 300, source: "first stage move" },
    ] },
    { name: "Fulfillment", source: "Tickets + QA", items: [
      { label: "Active tickets", value: String(f.active.length), target: `≤ ${f.devs.reduce((a, d) => a + d.slots, 0)} capacity`, met: f.capacityPct <= 100, source: "computed" },
      { label: "Avg delivery time", value: f.avgCycleDays === null ? "—" : `${f.avgCycleDays.toFixed(1)}d`, target: "≤ 10d", met: (f.avgCycleDays ?? 99) <= 10, source: "computed" },
      { label: "On-time rate", value: f.onTimePct === null ? "—" : pct(f.onTimePct, 0), target: "≥ 95%", met: (f.onTimePct ?? 0) >= 95, source: "computed" },
      { label: "Pod capacity", value: pct(f.capacityPct, 0), target: "≤ 85%", met: f.capacityPct <= 85, source: "computed" },
    ] },
  ];
  return (
    <>
      <Header title="Metrics & KPI command center" subtitle="Computed from live workspace data, plus manually reported marketing and community numbers." what="KPI dictionary" why="Read each metric with its target and where it comes from." start="Red means off target. Update manual metrics below." />
      <div className="space-y-6">
        {groups.map((g) => (
          <Card key={g.name} title={g.name} subtitle={g.source}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {g.items.map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-panel-2 p-4">
                  <div className="flex justify-between gap-2"><p className="kicker text-[10px]">{m.label}</p><span className={`size-2 rounded-full ${m.met ? "bg-neon" : "bg-danger"}`} title={m.met ? "On target" : "Off target"} /></div>
                  <p className="mt-2 font-mono text-2xl font-semibold">{m.value}</p>
                  <p className="mt-1 text-xs text-muted">Target {m.target} · <span className="italic">{m.source}</span></p>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card title="Marketing & community" subtitle="Manually reported until analytics, email and community APIs are connected. Edit inline.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{manual.map((m) => <MetricEditor key={m.key} metric={m} />)}</div>
        </Card>
      </div>
    </>
  );
}
