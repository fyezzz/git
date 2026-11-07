import { Card, PageHeader } from "@/components/ui";
import { AUTHORITY_POINTS, BUDGET_POINTS, NEED_KEYWORDS, TIER_THRESHOLDS, TIMELINE_POINTS } from "@/lib/domain/qualify";
import { RESPONSE_TEMPLATES } from "@/lib/domain/responder";

function Table({ rows }: { rows: Record<string, number> }) {
  return (
    <dl className="space-y-1 text-sm">
      {Object.entries(rows).map(([k, v]) => (<div key={k} className="flex justify-between rounded-md bg-panel-2 px-3 py-1.5"><dt className="text-muted">{k.replace(/_/g, " ")}</dt><dd className="font-mono text-neon">{v}</dd></div>))}
    </dl>
  );
}

export default function AgentPage() {
  return (
    <>
      <PageHeader title="AI Agent" subtitle="The live scoring rubric and response templates the agent uses on every captured lead. Edit them in lib/domain/." />
      <div className="mb-6 rounded-xl border border-warm/40 bg-warm/10 p-4 text-sm text-warm">Responses are deterministic templates today (instant, zero cost). No LLM provider is connected yet; swap composeFirstResponse in lib/domain/responder.ts to enable one.</div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Budget (25)"><Table rows={BUDGET_POINTS} /></Card>
        <Card title="Authority (25)"><Table rows={AUTHORITY_POINTS} /></Card>
        <Card title="Timeline (25)"><Table rows={TIMELINE_POINTS} /></Card>
        <Card title="Need (25)">
          <p className="mb-2 text-xs text-muted">Up to 10 for specificity (1 per 3 words) + 5 per intent keyword (max 15).</p>
          <div className="flex flex-wrap gap-1">{NEED_KEYWORDS.map((k) => <span key={k} className="rounded-md bg-panel-2 px-2 py-0.5 font-mono text-xs">{k}</span>)}</div>
        </Card>
      </div>
      <Card title="Tiers" className="mt-6"><p className="text-sm">Hot ≥ <span className="font-mono text-neon">{TIER_THRESHOLDS.hot}</span> → book call · Warm ≥ <span className="font-mono text-warm">{TIER_THRESHOLDS.warm}</span> → nurture · Cold → nurture or disqualify (budget under $1k)</p></Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {Object.entries(RESPONSE_TEMPLATES).map(([tier, t]) => (<Card key={tier} title={`${tier} reply`}><p className="text-sm leading-relaxed text-muted">{t}</p></Card>))}
      </div>
    </>
  );
}
