import { ago, Card, PageHeader } from "@/components/ui";
import { AUTOMATION_RULES } from "@/lib/domain/automations";
import { db, repName } from "@/lib/store";

export default function AutomationsPage() {
  return (
    <>
      <PageHeader title="Automations" subtitle="Rules run on every capture and booking. Defined in lib/domain/automations.ts." />
      <div className="grid gap-4 md:grid-cols-2">
        {AUTOMATION_RULES.map((r) => {
          const fired = db.notifications.filter((n) => n.ruleId === r.id).length;
          return (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-medium">{r.name}</h3><p className="mt-1 text-sm text-muted">{r.description}</p></div>
                <span className="rounded-md border border-neon/40 bg-neon-dim px-2 py-0.5 text-[11px] font-semibold uppercase text-neon">Active</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs"><span className="rounded bg-panel-2 px-2 py-1">WHEN {r.trigger}</span><span className="rounded bg-panel-2 px-2 py-1">DO {r.action}</span>{r.action === "notify_sales" && <span className="rounded bg-panel-2 px-2 py-1 text-neon">fired {fired}×</span>}</div>
            </Card>
          );
        })}
      </div>
      <Card title="Notification log" className="mt-6">
        <ul className="divide-y divide-line text-sm">
          {db.notifications.map((n) => (<li key={n.id} className="flex justify-between gap-3 py-2"><span>{n.summary}</span><span className="shrink-0 text-xs text-muted">{repName(n.repId)} · {ago(n.createdAt)}</span></li>))}
        </ul>
        <p className="mt-3 text-xs text-muted">Notifications are recorded in-app. No email/SMS provider is connected.</p>
      </Card>
    </>
  );
}
