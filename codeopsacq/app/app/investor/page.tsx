import Link from "next/link";
import { Card, Header, Stat } from "@/components/app/ui";
import { getCatalog, getDevelopers, getPipelineStats, getRevenue } from "@/lib/data";
import { pct, usd } from "@/lib/format";

export default async function Investor() {
  const [r, p, catalog, devs] = await Promise.all([getRevenue(), getPipelineStats(), getCatalog(), getDevelopers()]);
  return (
    <>
      <Header title="Investor view" subtitle="Agency software backed by the team that ships the work." what="Business case" why="Understand the model, moat and evidence still required." start="Read thesis, economics, then risks." actions={<Link className="btn btn-ghost" href="/app/catalog">Review business model</Link>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="MRR" value={usd(r.mrr)} delta={`${r.growthPct >= 0 ? "+" : ""}${pct(r.growthPct)}`} good={r.growthPct >= 0} />
        <Stat label="ARR run-rate" value={usd(r.arr)} />
        <Stat label="Delivery margin" value={r.margin === null ? "—" : pct(r.margin)} />
        <Stat label="Open pipeline" value={usd(p.pipelineValue)} sub={`${p.openCount} opportunities`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Investment thesis"><p className="text-lg font-semibold">Software creates leverage. Fulfillment creates the moat.</p><p className="mt-2 text-sm text-muted">Agencies sell through disconnected tools, then custom work hits a small delivery team. CodeOpsAcq connects acquisition, sales, scope, delivery, billing and community in one workspace, with a {devs.length}-developer pod for custom builds.</p></Card>
        <Card title="Three revenue layers"><ul className="space-y-3 text-sm"><li><b>SaaS</b> · $99 / $299 / $999 monthly plans</li><li><b>Incubator</b> · 50% of first eligible collected sale, 20% thereafter</li><li><b>High-ticket</b> · $25k–$500k custom builds and dedicated pods</li></ul><p className="mt-3 text-xs text-muted">Prices are the offer architecture, not reported revenue.</p></Card>
        <Card title="The fulfillment moat"><div className="grid grid-cols-2 gap-4 font-mono"><div><p className="text-3xl">{catalog.length}</p><p className="text-xs text-muted">priced catalog items</p></div><div><p className="text-3xl">{devs.length}</p><p className="text-xs text-muted">specialist developers</p></div><div><p className="text-3xl">5</p><p className="text-xs text-muted">delivery gates</p></div><div><p className="text-3xl">8</p><p className="text-xs text-muted">AI specialist agents</p></div></div></Card>
        <Card title="Roadmap & the ask"><ol className="space-y-2 text-sm text-muted"><li><b className="text-text">Now:</b> the full loop runs on durable Postgres data with audit history.</li><li><b className="text-text">Next:</b> credentialed integrations (Stripe, Discord, DocuSign), multi-tenant workspaces, SSO.</li><li><b className="text-text">Scale:</b> repeatable pod delivery and multi-pod capacity planning.</li></ol><p className="mt-3 text-sm">Seeking strategic investors and operators for distribution and enterprise introductions. Round size and terms are not set.</p></Card>
      </div>
    </>
  );
}
