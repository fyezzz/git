import Link from "next/link";
import { StageSelect } from "@/components/stage-select";
import { money, PageHeader, TierBadge } from "@/components/ui";
import { STAGES } from "@/lib/domain/types";
import { db, STAGE_LABEL } from "@/lib/store";

export default function PipelinePage() {
  return (
    <>
      <PageHeader title="Pipeline" subtitle="Move deals between stages; every change is logged to the lead's activity." />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const leads = db.leads.filter((l) => l.stage === stage);
          return (
            <section key={stage} className="w-64 shrink-0 rounded-xl border border-line bg-panel p-3">
              <header className="mb-3 flex items-baseline justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{STAGE_LABEL[stage]} <span className="text-text">{leads.length}</span></h2>
                <span className="font-mono text-[11px] text-muted">{money(leads.reduce((a, l) => a + l.dealValue, 0))}</span>
              </header>
              <div className="space-y-2">
                {leads.map((l) => (
                  <article key={l.id} className="rounded-lg border border-line bg-panel-2 p-3 transition hover:border-neon/50">
                    <Link href={`/leads/${l.id}`} className="block text-sm font-medium hover:text-neon">{l.name}</Link>
                    <div className="mb-2 text-xs text-muted">{l.company ?? "—"} · {money(l.dealValue)}</div>
                    <div className="flex flex-wrap items-center justify-between gap-2"><TierBadge tier={l.qualification.tier} score={l.qualification.score} /><StageSelect leadId={l.id} stage={l.stage} /></div>
                  </article>
                ))}
                {leads.length === 0 && <p className="px-1 py-4 text-xs text-muted">Empty</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
