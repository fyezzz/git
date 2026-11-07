import { Bar, Card, Header, Stat } from "@/components/app/ui";
import { getFulfillment } from "@/lib/data";
import { pct, TICKET_STAGE_LABEL } from "@/lib/format";

export default async function Fulfillment() {
  const f = await getFulfillment();
  const highQa = f.qa.filter((t) => t.priority !== "standard").length;
  return (
    <>
      <Header title="Fulfillment command" subtitle={`Delivery visibility across the ${f.devs.length}-developer team · ${pct(f.capacityPct, 0)} capacity.`} what="Delivery control" why="See every gate between sale and handoff." start="Review blockers before adding capacity." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Active builds" value={String(f.active.length)} sub={`Across ${new Set(f.active.map((t) => t.developer_id).filter(Boolean)).size} developers`} />
        <Stat label="On-time rate" value={f.onTimePct === null ? "—" : pct(f.onTimePct, 0)} sub="Delivered by due date" />
        <Stat label="QA queue" value={String(f.qa.length)} sub={`${highQa} high or urgent`} />
        <Stat label="Avg. cycle" value={f.avgCycleDays === null ? "—" : `${f.avgCycleDays.toFixed(1)}d`} sub="Ticket created → delivered" />
      </div>
      <Card title="Workstreams" className="mt-6">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted"><tr><th className="pb-2">Workstream</th><th>Developer</th><th>State</th><th>Due</th><th className="w-48">Progress</th></tr></thead>
          <tbody className="divide-y divide-line">{f.tickets.filter((t) => t.stage !== "delivered").map((t) => {
            const late = t.due_date && Date.parse(t.due_date) < Date.now();
            return <tr key={t.id}><td className="py-3"><span className="font-mono text-xs text-muted">{t.code}</span> {t.title}</td><td className="text-muted">{t.developer_label ?? "Unassigned"}</td><td>{TICKET_STAGE_LABEL[t.stage]}</td><td className={late ? "text-danger" : "text-muted"}>{t.due_date ?? "—"}{late ? " · late" : ""}</td><td><Bar value={t.progress} max={100} /></td></tr>;
          })}</tbody>
        </table></div>
      </Card>
    </>
  );
}
