import Link from "next/link";
import { Badge, Bar, Card, Empty, Header, Stat } from "@/components/app/ui";
import { CHANNEL_LABEL, ENGINE_LABEL, type AiEngine, type Channel } from "@/lib/attribution";
import { getAttributionReport, getDeals } from "@/lib/data";
import { ago, int, pct, usd } from "@/lib/format";

export default async function Attribution({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = [7, 30, 90].includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 30;
  const [rep, deals] = await Promise.all([getAttributionReport(days), getDeals()]);
  const byChannel = new Map<string, { visitors: number; leads: number; pipeline: number; won: number }>();
  for (const t of rep.traffic) { const r = byChannel.get(t.channel) ?? { visitors: 0, leads: 0, pipeline: 0, won: 0 }; r.visitors += t.visitors; byChannel.set(t.channel, r); }
  for (const l of rep.leads) { const r = byChannel.get(l.channel) ?? { visitors: 0, leads: 0, pipeline: 0, won: 0 }; r.leads += l.leads; r.pipeline += l.pipeline; r.won += l.won; byChannel.set(l.channel, r); }
  const engines = new Map<string, { visitors: number; leads: number; pipeline: number; won: number; self: number }>();
  for (const t of rep.traffic.filter((x) => x.channel === "ai_assistant")) { const k = t.ai_engine ?? "other_ai"; const r = engines.get(k) ?? { visitors: 0, leads: 0, pipeline: 0, won: 0, self: 0 }; r.visitors += t.visitors; engines.set(k, r); }
  for (const l of rep.leads.filter((x) => x.channel === "ai_assistant")) { const k = l.ai_engine ?? "other_ai"; const r = engines.get(k) ?? { visitors: 0, leads: 0, pipeline: 0, won: 0, self: 0 }; r.leads += l.leads; r.pipeline += l.pipeline; r.won += l.won; r.self += l.self_reported; engines.set(k, r); }
  const tot = [...byChannel.values()].reduce((a, r) => ({ visitors: a.visitors + r.visitors, leads: a.leads + r.leads, value: a.value + r.pipeline + r.won }), { visitors: 0, leads: 0, value: 0 });
  const ai = byChannel.get("ai_assistant") ?? { visitors: 0, leads: 0, pipeline: 0, won: 0 };
  const aiCvr = ai.visitors ? (ai.leads / ai.visitors) * 100 : 0;
  const allCvr = tot.visitors ? (tot.leads / tot.visitors) * 100 : 0;
  const maxDay = Math.max(1, ...rep.daily.map((d) => d.total));
  const recent = deals.filter((d) => d.channel === "ai_assistant").slice(0, 8);
  return (
    <>
      <Header title="AI lead attribution" subtitle="Traffic → leads → pipeline → revenue by channel and AI assistant." what="Source of revenue" why="AI assistants recommend vendors before anyone searches. Know which ones send you money." start="Compare AI share of leads vs share of traffic, then open the engine table."
        actions={<div className="flex gap-1 rounded-lg border border-line p-1">{[7, 30, 90].map((d) => <Link key={d} href={`/app/attribution?days=${d}`} className={`rounded-md px-3 py-1 text-xs ${d === days ? "bg-neon text-ink" : "text-muted hover:text-text"}`}>{d}d</Link>)}</div>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="AI share of visitors" value={pct(tot.visitors ? (ai.visitors / tot.visitors) * 100 : 0)} sub={`${int(ai.visitors)} of ${int(tot.visitors)} visitors · ${days}d`} />
        <Stat label="AI share of leads" value={pct(tot.leads ? (ai.leads / tot.leads) * 100 : 0)} sub={`${ai.leads} of ${tot.leads} leads (all time)`} />
        <Stat label="AI pipeline + won" value={usd(ai.pipeline + ai.won)} sub={`${pct(tot.value ? ((ai.pipeline + ai.won) / tot.value) * 100 : 0)} of all value`} />
        <Stat label="AI visitor → lead" value={pct(aiCvr, 2)} sub={`vs ${pct(allCvr, 2)} all channels`} delta={aiCvr >= allCvr ? "higher intent" : "lower"} good={aiCvr >= allCvr} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card title="By AI assistant" subtitle="Visitors in window; leads, pipeline and won all-time" className="xl:col-span-3">
          {engines.size === 0 ? <Empty>No AI-assistant traffic yet. Share a page in ChatGPT with ?utm_source=chatgpt.com to test.</Empty> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted"><tr><th className="pb-2">Engine</th><th>Visitors</th><th>Leads</th><th>Pipeline</th><th>Won</th><th>Self-reported</th></tr></thead>
              <tbody className="divide-y divide-line">{[...engines.entries()].sort((a, b) => b[1].pipeline + b[1].won - (a[1].pipeline + a[1].won) || b[1].visitors - a[1].visitors).map(([k, r]) => (
                <tr key={k}><td className="py-2.5 font-medium">{ENGINE_LABEL[k as AiEngine] ?? k}</td><td className="font-mono">{int(r.visitors)}</td><td className="font-mono">{r.leads}</td><td className="font-mono">{usd(r.pipeline)}</td><td className="font-mono text-neon">{usd(r.won)}</td><td className="font-mono text-muted">{r.self}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </Card>
        <Card title="By channel" className="xl:col-span-2">
          <div className="space-y-3">{[...byChannel.entries()].sort((a, b) => b[1].visitors - a[1].visitors).map(([c, r]) => (
            <div key={c}><div className="mb-1 flex justify-between text-sm"><span className={c === "ai_assistant" ? "text-neon" : ""}>{CHANNEL_LABEL[c as Channel] ?? c}</span><span className="font-mono text-xs text-muted">{int(r.visitors)} visitors · {r.leads} leads · {usd(r.pipeline + r.won, { compact: true })}</span></div><Bar value={r.visitors} max={tot.visitors} color={c === "ai_assistant" ? "bg-neon" : "bg-cold"} /></div>
          ))}</div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Daily traffic" subtitle="Neon = AI assistants">
          <div className="flex h-40 items-end gap-[2px]" role="img" aria-label="Daily visits with AI share">
            {rep.daily.map((d) => <div key={d.day} title={`${d.day}: ${d.ai} AI / ${d.total} total`} className="relative flex-1 rounded-t bg-panel-2" style={{ height: `${(d.total / maxDay) * 100}%` }}><div className="absolute inset-x-0 bottom-0 rounded-t bg-neon" style={{ height: `${d.total ? (d.ai / d.total) * 100 : 0}%` }} /></div>)}
          </div>
        </Card>
        <Card title="Pages AI assistants land on" subtitle="Optimize these for citations">
          <ul className="divide-y divide-line text-sm">{rep.landing.map((l) => <li key={l.path} className="flex justify-between py-2"><span className="font-mono">{l.path}</span><span className="text-muted"><span className="text-neon">{l.ai_views}</span> / {l.views} views</span></li>)}</ul>
        </Card>
      </div>
      <Card title="Latest AI-sourced leads" className="mt-6">
        {recent.length === 0 ? <Empty>None yet.</Empty> : <ul className="divide-y divide-line text-sm">{recent.map((d) => {
          const conf = String((d.attribution as { confidence?: string; first?: { confidence?: string } }).confidence ?? (d.attribution as { first?: { confidence?: string } }).first?.confidence ?? "—");
          return <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span><span className="font-medium">{d.company}</span> <span className="text-muted">· {d.title}</span></span><span className="flex items-center gap-2"><Badge tone="neon">{ENGINE_LABEL[(d.ai_engine ?? "other_ai") as AiEngine]}</Badge><Badge>{conf}</Badge><span className="font-mono">{usd(d.value_cents)}</span><span className="text-xs text-muted">{ago(d.created_at)}</span></span></li>;
        })}</ul>}
      </Card>
      <Card title="How attribution is decided" className="mt-6">
        <ol className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <li><b className="text-text">1. UTM</b> — utm_source matching an AI engine (ChatGPT tags links with chatgpt.com).</li>
          <li><b className="text-text">2. Referrer</b> — 20+ AI hosts: chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com…</li>
          <li><b className="text-text">3. Self-reported</b> — the book-a-call answer upgrades direct or Google-search leads (AI Overviews) to the named assistant. Never overrides a measured engine.</li>
        </ol>
      </Card>
    </>
  );
}
