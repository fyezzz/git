"use client";

import { useOptimistic, useState } from "react";
import { ActionForm, Modal, useRun } from "@/components/app/actions-ui";
import { createDeal, deleteDeal, moveDeal, updateDeal } from "@/lib/actions";
import { ENGINE_LABEL, type AiEngine } from "@/lib/attribution";
import type { Deal } from "@/lib/data";
import { STAGE_LABEL, STAGES, usd, type Stage } from "@/lib/format";

type Member = { id: string; name: string; initials: string };

export function Board({ deals, members }: { deals: Deal[]; members: Member[] }) {
  const { run } = useRun();
  const [optimistic, setOptimistic] = useOptimistic(deals, (state, m: { id: string; stage: Stage }) => state.map((d) => (d.id === m.id ? { ...d, stage: m.stage } : d)));
  const [over, setOver] = useState<Stage | null>(null);
  const [q, setQ] = useState("");
  const visible = optimistic.filter((d) => !q || `${d.company} ${d.title} ${d.industry}`.toLowerCase().includes(q.toLowerCase()));

  const move = (id: string, stage: Stage) => run(async () => { setOptimistic({ id, stage }); return moveDeal(id, stage); });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className="input max-w-xs" placeholder="Filter deals…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter deals" />
        <Modal trigger="+ Capture lead" title="Capture lead">{(close) => <DealForm members={members} action={createDeal} onDone={close} />}</Modal>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const col = visible.filter((d) => d.stage === stage);
          return (
            <section
              key={stage}
              aria-label={STAGE_LABEL[stage]}
              onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, stage); }}
              className={`w-72 shrink-0 rounded-xl border p-3 transition ${over === stage ? "border-neon bg-neon-dim" : "border-line bg-panel"}`}
            >
              <header className="mb-3 flex items-baseline justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{STAGE_LABEL[stage]} <span className="text-text">{col.length}</span></h2>
                <span className="font-mono text-[11px] text-muted">{usd(col.reduce((a, d) => a + d.value_cents, 0))}</span>
              </header>
              <div className="min-h-16 space-y-2">
                {col.map((d) => (
                  <article key={d.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)} className="cursor-grab rounded-lg border border-line bg-panel-2 p-3 transition hover:border-neon/50 active:cursor-grabbing">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-muted">{d.industry}</p><p className="truncate font-medium">{d.company}</p></div>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] ${d.ai_score >= 85 ? "bg-neon-dim text-neon" : d.ai_score >= 70 ? "bg-warm/10 text-warm" : "bg-panel text-muted"}`}>AI {d.ai_score}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{d.title}{d.seats ? ` · ${d.seats} seats` : ""}</p>
                    {d.ai_engine && <p className="mt-2 inline-block rounded bg-neon-dim px-1.5 py-0.5 text-[10px] text-neon">via {ENGINE_LABEL[d.ai_engine as AiEngine]}</p>}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{usd(d.value_cents)}</span>
                      <span className="text-[11px] text-muted">{d.signal}</span>
                      <span className="grid size-6 place-items-center rounded-full bg-panel text-[10px]" title={d.owner_name ?? "Unassigned"}>{d.owner_initials ?? "—"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select aria-label={`Move ${d.company}`} value={d.stage} onChange={(e) => move(d.id, e.target.value as Stage)} className="input py-1 text-xs">
                        {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                      </select>
                      <Modal trigger="Edit" triggerClass="btn btn-ghost btn-sm" title={`Edit ${d.company}`}>{(close) => <DealForm members={members} deal={d} action={updateDeal.bind(null, d.id)} onDone={close} />}</Modal>
                    </div>
                  </article>
                ))}
                {col.length === 0 && <p className="px-1 py-3 text-xs text-muted">{stage === "fridge" ? "Park a lead for later review" : "Drop a deal here"}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function DealForm({ members, deal, action, onDone }: { members: Member[]; deal?: Deal; action: (fd: FormData) => Promise<import("@/lib/actions").ActionResult>; onDone: () => void }) {
  const { run } = useRun();
  return (
    <ActionForm action={action} onDone={onDone} className="grid gap-3 sm:grid-cols-2" reset={!deal}>
      <div><label className="label">Company</label><input className="input" name="company" required defaultValue={deal?.company} /></div>
      <div><label className="label">Opportunity</label><input className="input" name="title" required defaultValue={deal?.title} placeholder="Custom ops portal" /></div>
      <div><label className="label">Industry</label><input className="input" name="industry" defaultValue={deal?.industry ?? "Other"} /></div>
      <div><label className="label">Value (USD)</label><input className="input" name="value" type="number" min="0" step="100" required defaultValue={deal ? deal.value_cents / 100 : ""} /></div>
      <div><label className="label">Owner</label><select className="input" name="owner_id" defaultValue={deal?.owner_id ?? ""}><option value="">Unassigned</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
      <div><label className="label">AI fit score</label><input className="input" name="ai_score" type="number" min="0" max="100" defaultValue={deal?.ai_score ?? 60} /></div>
      <div><label className="label">Contact name</label><input className="input" name="contact_name" defaultValue={deal?.contact_name ?? ""} /></div>
      <div><label className="label">Contact email</label><input className="input" name="contact_email" type="email" defaultValue={deal?.contact_email ?? ""} /></div>
      <div className="sm:col-span-2"><label className="label">Next step</label><input className="input" name="next_step" defaultValue={deal?.next_step ?? ""} placeholder="Send proposal Thursday" /></div>
      <div className="flex justify-between gap-2 sm:col-span-2">
        {deal ? <button type="button" className="btn btn-danger btn-sm" onClick={() => confirm(`Delete ${deal.company}?`) && run(() => deleteDeal(deal.id), "Deal deleted", onDone)}>Delete</button> : <span />}
        <button className="btn btn-primary">{deal ? "Save" : "Add to Lead"}</button>
      </div>
    </ActionForm>
  );
}
