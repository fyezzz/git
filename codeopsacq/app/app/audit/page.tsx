import Link from "next/link";
import { Card, Empty, Header } from "@/components/app/ui";
import { getAudit } from "@/lib/data";
import { q } from "@/lib/db";
import { dateTime } from "@/lib/format";

export default async function Audit({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  const [rows, sources] = await Promise.all([getAudit(source), q<{ source: string }>("SELECT DISTINCT source FROM audit_log ORDER BY source")]);
  return (
    <>
      <Header title="Audit history" subtitle="Every change made in the workspace, newest first." what="Governance record" why="Accountability for who changed what, when." start="Filter by source, then export." actions={<a className="btn btn-ghost" href={`/app/audit/export${source ? `?source=${encodeURIComponent(source)}` : ""}`}>Export CSV</a>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/app/audit" className={`rounded-lg border px-3 py-1 text-xs ${!source ? "border-neon text-neon" : "border-line text-muted"}`}>All</Link>
        {sources.map((s) => <Link key={s.source} href={`/app/audit?source=${encodeURIComponent(s.source)}`} className={`rounded-lg border px-3 py-1 text-xs ${source === s.source ? "border-neon text-neon" : "border-line text-muted hover:text-text"}`}>{s.source}</Link>)}
      </div>
      <Card>
        {rows.length === 0 ? <Empty>No events.</Empty> : <ol className="divide-y divide-line">{rows.map((r) => <li key={r.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[200px_1fr_120px]"><span className="font-mono text-xs text-muted">{dateTime(r.at)}</span><span><span className="font-medium">{r.action}</span><span className="block text-muted">{r.detail}</span></span><span className="text-xs text-neon sm:text-right">{r.source}</span></li>)}</ol>}
      </Card>
    </>
  );
}
