"use client";

import { useState } from "react";
import { useRun } from "@/components/app/actions-ui";
import { updateTicket } from "@/lib/actions";
import { TICKET_STAGE_LABEL, TICKET_STAGES, type TicketStage } from "@/lib/format";

export function TicketControls({ id, stage, progress, developerId, devs }: { id: string; stage: TicketStage; progress: number; developerId: string | null; devs: { id: string; label: string }[] }) {
  const { run, pending } = useRun();
  const [p, setP] = useState(progress);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
      <select aria-label="Stage" className="input w-auto py-1 text-xs" value={stage} disabled={pending} onChange={(e) => run(() => updateTicket(id, { stage: e.target.value }), "Stage updated")}>
        {TICKET_STAGES.map((s) => <option key={s} value={s}>{TICKET_STAGE_LABEL[s]}</option>)}
      </select>
      <select aria-label="Developer" className="input w-auto py-1 text-xs" value={developerId ?? ""} disabled={pending} onChange={(e) => run(() => updateTicket(id, { developer_id: e.target.value || null }), "Reassigned")}>
        <option value="">Unassigned</option>
        {devs.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
      </select>
      <label className="flex items-center gap-2 text-xs text-muted">Progress
        <input type="range" min={0} max={100} step={5} value={p} disabled={pending || stage === "delivered"} onChange={(e) => setP(Number(e.target.value))} onPointerUp={() => p !== progress && run(() => updateTicket(id, { progress: p }))} onKeyUp={() => p !== progress && run(() => updateTicket(id, { progress: p }))} className="accent-[#02ef7d]" />
        <span className="w-8 font-mono">{p}%</span>
      </label>
    </div>
  );
}
