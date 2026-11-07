import Link from "next/link";
import { ago, Card, money, PageHeader, Stat, TierBadge } from "@/components/ui";
import { analytics, db, repName } from "@/lib/store";

export default function Dashboard() {
  const a = analytics();
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Lead → instant response → qualification → booking → CRM → sales handoff" action={<Link href="/capture" className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink hover:brightness-110">Capture a test lead</Link>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Leads" value={String(a.total)} hint={`${a.hot} hot`} />
        <Stat label="Speed to lead" value={`${a.avgResponseSec.toFixed(1)}s`} hint="avg first response" accent />
        <Stat label="Pipeline" value={money(a.pipelineValue)} hint="open deal value" />
        <Stat label="Won" value={money(a.wonRevenue)} hint="closed revenue" accent />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Latest leads" className="lg:col-span-2" action={<Link href="/leads" className="text-xs text-neon hover:underline">All leads →</Link>}>
          <ul className="divide-y divide-line">
            {db.leads.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link href={`/leads/${l.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-neon">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{l.name} <span className="text-muted">· {l.company ?? "—"}</span></div>
                    <div className="text-xs text-muted">{repName(l.ownerId)} · {ago(l.createdAt)}</div>
                  </div>
                  <TierBadge tier={l.qualification.tier} score={l.qualification.score} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Sales notifications">
          <ul className="space-y-3">
            {db.notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="rounded-lg border border-line bg-panel-2 p-3">
                <div className="text-sm">{n.summary}</div>
                <div className="mt-1 text-xs text-muted">→ {repName(n.repId)} · {ago(n.createdAt)}</div>
              </li>
            ))}
            {db.notifications.length === 0 && <li className="text-sm text-muted">No notifications yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
