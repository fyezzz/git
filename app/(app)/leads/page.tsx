import Link from "next/link";
import { ago, Card, money, PageHeader, StageBadge, TierBadge } from "@/components/ui";
import { db, repName } from "@/lib/store";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier } = await searchParams;
  const leads = tier ? db.leads.filter((l) => l.qualification.tier === tier) : db.leads;
  const filters = [undefined, "hot", "warm", "cold"] as const;
  return (
    <>
      <PageHeader title="Leads" subtitle={`${leads.length} leads`} />
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link key={f ?? "all"} href={f ? `/leads?tier=${f}` : "/leads"} className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-wide ${tier === f ? "border-neon bg-neon-dim text-neon" : "border-line text-muted hover:text-text"}`}>
            {f ?? "all"}
          </Link>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr><th className="pb-3">Lead</th><th>Source</th><th>Score</th><th>Stage</th><th>Owner</th><th>Value</th><th>Created</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-panel-2">
                  <td className="py-3"><Link href={`/leads/${l.id}`} className="font-medium hover:text-neon">{l.name}</Link><div className="text-xs text-muted">{l.email}</div></td>
                  <td className="text-muted">{l.source.replace("_", " ")}</td>
                  <td><TierBadge tier={l.qualification.tier} score={l.qualification.score} /></td>
                  <td><StageBadge stage={l.stage} /></td>
                  <td className="text-muted">{repName(l.ownerId)}</td>
                  <td className="font-mono">{money(l.dealValue)}</td>
                  <td className="text-muted">{ago(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p className="py-8 text-center text-sm text-muted">No leads match this filter.</p>}
        </div>
      </Card>
    </>
  );
}
