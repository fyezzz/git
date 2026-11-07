import { Bar, Card, money, PageHeader, Stat } from "@/components/ui";
import { analytics } from "@/lib/store";

export default function AnalyticsPage() {
  const a = analytics();
  const top = a.funnel[0]!.value;
  const winRate = top ? Math.round((a.funnel[4]!.value / top) * 100) : 0;
  return (
    <>
      <PageHeader title="Analytics" subtitle="Computed live from the store." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Avg score" value={String(a.avgScore)} />
        <Stat label="Win rate" value={`${winRate}%`} accent />
        <Stat label="Pipeline" value={money(a.pipelineValue)} />
        <Stat label="Speed to lead" value={`${a.avgResponseSec.toFixed(1)}s`} accent />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Funnel"><div className="space-y-4">{a.funnel.map((f) => <Bar key={f.label} label={f.label} value={f.value} max={top} right={`${f.value} · ${top ? Math.round((f.value / top) * 100) : 0}%`} />)}</div></Card>
        <Card title="By source"><div className="space-y-4">{a.bySource.map(([src, row]) => <Bar key={src} label={src.replace("_", " ")} value={row.leads} max={a.bySource[0]![1].leads} right={`${row.leads} leads · ${row.won} won`} />)}</div></Card>
      </div>
    </>
  );
}
