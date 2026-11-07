"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { STAGES, type Stage } from "@/lib/domain/types";

export function StageSelect({ leadId, stage }: { leadId: string; stage: Stage }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  async function change(next: Stage) {
    setError(null);
    const res = await fetch(`/api/leads/${leadId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ stage: next }) });
    if (!res.ok) return setError((await res.json()).error ?? "Update failed");
    start(() => router.refresh());
  }
  return (
    <div className="flex items-center gap-2">
      <select aria-label="Move stage" disabled={pending} value={stage} onChange={(e) => change(e.target.value as Stage)} className="rounded-lg border border-line bg-panel-2 px-2 py-1.5 text-xs uppercase tracking-wide text-text disabled:opacity-50">
        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </div>
  );
}
