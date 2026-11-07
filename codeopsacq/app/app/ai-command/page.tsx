import { MissionConsole } from "./console";
import { Badge, Card, Empty, Header } from "@/components/app/ui";
import { AGENTS, PRESET_MISSIONS, type AgentId } from "@/lib/agents";
import { getAiRuns } from "@/lib/data";
import { ago } from "@/lib/format";

export default async function AiCommand({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  const { run } = await searchParams;
  const runs = await getAiRuns();
  const current = runs.find((r) => r.id === run) ?? runs[0];
  const active = new Set(current?.agents ?? []);
  return (
    <>
      <Header title="AI reporting command" subtitle="One orchestrator routes each mission to the specialists it needs. Findings come from live workspace data." what="Automation observability" why="Ask a question; get grounded findings and actions." start="Choose a preset or write a mission." />
      <MissionConsole presets={PRESET_MISSIONS} claude={!!process.env.ANTHROPIC_API_KEY} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(AGENTS) as AgentId[]).map((id) => {
          const f = current?.findings.find((x) => x.agent === id);
          return (
            <div key={id} className={`card p-4 transition ${active.has(id) ? "border-neon/50 shadow-[0_0_40px_-20px_#02ef7d]" : "opacity-60"}`}>
              <div className="flex items-center justify-between"><p className="font-semibold">{AGENTS[id].name}</p><span className={`size-2 rounded-full ${active.has(id) ? "animate-pulse bg-neon" : "bg-line"}`} /></div>
              <p className="text-xs text-muted">{AGENTS[id].focus}</p>
              {f && <p className="mt-2 text-xs"><Badge tone={(f as { severity?: string }).severity === "act" ? "danger" : (f as { severity?: string }).severity === "watch" ? "warm" : "neon"}>{(f as { severity?: string }).severity ?? "ok"}</Badge></p>}
            </div>
          );
        })}
      </div>
      {current ? (
        <Card title={`“${current.mission}”`} subtitle={`${current.agents.length} agents · ${ago(current.created_at)}`} className="mt-6">
          {current.narrative && <div className="mb-5 whitespace-pre-line rounded-xl border border-neon/30 bg-neon-dim p-4 text-sm"><p className="kicker mb-2 text-neon">Claude synthesis</p>{current.narrative}</div>}
          <div className="space-y-4">
            {current.findings.map((f) => (
              <section key={f.agent} className="rounded-xl border border-line bg-panel-2 p-4">
                <p className="kicker text-neon">{AGENTS[f.agent as AgentId]?.name ?? f.agent}</p>
                <p className="mt-1 font-medium">{f.headline}</p>
                {f.items.length > 0 && <ul className="mt-2 space-y-1 text-sm text-muted">{f.items.map((i) => <li key={i}>• {i}</li>)}</ul>}
              </section>
            ))}
          </div>
        </Card>
      ) : <div className="mt-6"><Empty>No missions run yet.</Empty></div>}
      {runs.length > 1 && <Card title="Recent missions" className="mt-6"><ul className="divide-y divide-line text-sm">{runs.map((r) => <li key={r.id} className="flex justify-between py-2"><a className="hover:text-neon" href={`/app/ai-command?run=${r.id}`}>{r.mission}</a><span className="text-xs text-muted">{r.agents.length} agents · {ago(r.created_at)}</span></li>)}</ul></Card>}
    </>
  );
}
