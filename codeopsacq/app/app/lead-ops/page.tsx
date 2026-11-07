import { ActionButton, ActionForm } from "@/components/app/actions-ui";
import { Badge, Card, Empty, Header } from "@/components/app/ui";
import { addSuppression, removeSuppression, reviewLead, runGithubIntake, toggleSequence } from "@/lib/actions";
import { getLeadReviews, getSequences, getSuppression } from "@/lib/data";
import { ago } from "@/lib/format";

export default async function LeadOps() {
  const [reviews, seqs, sup] = await Promise.all([getLeadReviews(), getSequences(), getSuppression()]);
  const pending = reviews.filter((r) => r.status === "pending");
  const decided = reviews.filter((r) => r.status !== "pending").slice(0, 8);
  return (
    <>
      <Header title="Lead ops workspace" subtitle="Compliant public-source intake, evidence review, suppression and human-sent outreach." what="Demand control" why="Inspect intake quality before anything reaches the CRM." start="Run intake, then approve or reject the queue." />
      <p className="mb-6 rounded-xl border border-cold/30 bg-cold/5 p-4 text-sm text-cold">Official GitHub REST API only. Public organization and repository fields. No private email discovery, LinkedIn scraping, Google scraping or email scraping.</p>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`Review queue · ${pending.length}`} subtitle="Approve sends the lead to CRM → Lead" className="xl:col-span-2"
          action={<ActionForm action={runGithubIntake} className="flex gap-2" reset={false}><input className="input w-44 py-1.5" name="query" defaultValue="crm agency" aria-label="Intake topic" /><button className="btn btn-primary btn-sm">Run intake</button></ActionForm>}>
          {pending.length === 0 ? <Empty>Queue is clear. Run intake to pull active organizations from GitHub.</Empty> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted"><tr><th className="pb-2">Lead</th><th>Evidence</th><th>Class</th><th>Score</th><th className="text-right">Review</th></tr></thead>
              <tbody className="divide-y divide-line">{pending.map((r) => (
                <tr key={r.id}>
                  <td className="py-3"><p className="font-medium">{r.source_url ? <a href={r.source_url} target="_blank" rel="noreferrer" className="hover:text-neon">{r.name} ↗</a> : r.name}</p><p className="text-xs text-muted">{r.category} · {r.contributors} contributors · {ago(r.created_at)}</p></td>
                  <td className="max-w-xs text-xs text-muted">{r.evidence}</td>
                  <td><Badge tone={r.classification === "evidence" ? "neon" : "warm"}>{r.classification}</Badge></td>
                  <td className="font-mono">{r.score}</td>
                  <td className="text-right"><div className="flex justify-end gap-2"><ActionButton action={reviewLead.bind(null, r.id, "approved")} className="btn btn-primary btn-sm">Approve</ActionButton><ActionButton action={reviewLead.bind(null, r.id, "rejected")} className="btn btn-danger btn-sm">Reject</ActionButton></div></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
          {decided.length > 0 && <div className="mt-4 border-t border-line pt-3 text-xs text-muted">Recently decided: {decided.map((r) => `${r.name} (${r.status})`).join(" · ")}</div>}
        </Card>
        <div className="space-y-6">
          <Card title="Three-touch sequences" subtitle="Every send needs a human">
            <ul className="space-y-2">{seqs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm">
                <span><span className="font-medium">{s.name}</span><span className="block text-xs text-muted">{s.touches} touches · {s.enrolled} enrolled</span></span>
                <ActionButton action={toggleSequence.bind(null, s.id)} className={`btn btn-sm ${s.status === "active" ? "btn-ghost" : "btn-primary"}`}>{s.status === "active" ? "Pause" : "Activate"}</ActionButton>
              </li>
            ))}</ul>
          </Card>
          <Card title={`Suppression list · ${sup.length}`} subtitle="Enforced on intake, manual entry and inbound forms">
            <ActionForm action={addSuppression} className="mb-3 grid gap-2">
              <input className="input" name="value" required placeholder="email, domain or org name" aria-label="Value to suppress" />
              <div className="flex gap-2"><input className="input" name="reason" placeholder="Reason (Opted out)" aria-label="Reason" /><button className="btn btn-ghost btn-sm">Add</button></div>
            </ActionForm>
            <ul className="divide-y divide-line text-sm">{sup.map((s) => <li key={s.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><span className="block truncate font-mono text-xs">{s.value}</span><span className="text-xs text-muted">{s.reason}</span></span><ActionButton action={removeSuppression.bind(null, s.id)} className="btn btn-ghost btn-sm" confirm={`Remove ${s.value} from suppression?`}>Remove</ActionButton></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}
