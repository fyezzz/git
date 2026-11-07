"use client";

import { useState } from "react";
import { useRun } from "@/components/app/actions-ui";
import { saveManualMetric } from "@/lib/actions";
import { ago } from "@/lib/format";

type Metric = { key: string; label: string; value: number; target: number; unit: string; better: string; updated_at: string };
const fmt = (v: number, unit: string) => (unit === "usd" ? `$${v.toLocaleString()}` : unit === "pct" ? `${v}%` : v.toLocaleString());

export function MetricEditor({ metric: m }: { metric: Metric }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(String(m.value));
  const [t, setT] = useState(String(m.target));
  const { run, pending } = useRun();
  const met = m.better === "up" ? m.value >= m.target : m.value <= m.target;
  return (
    <div className="rounded-xl border border-line bg-panel-2 p-4">
      <div className="flex justify-between gap-2"><p className="kicker text-[10px]">{m.label}</p><span className={`size-2 rounded-full ${met ? "bg-neon" : "bg-danger"}`} /></div>
      {edit ? (
        <div className="mt-2 grid gap-2">
          <input className="input py-1" type="number" step="any" value={v} onChange={(e) => setV(e.target.value)} aria-label={`${m.label} value`} />
          <input className="input py-1" type="number" step="any" value={t} onChange={(e) => setT(e.target.value)} aria-label={`${m.label} target`} />
          <div className="flex gap-2"><button className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => saveManualMetric(m.key, Number(v), Number(t)), "Saved", () => setEdit(false))}>Save</button><button className="btn btn-ghost btn-sm" onClick={() => setEdit(false)}>Cancel</button></div>
        </div>
      ) : (
        <>
          <p className="mt-2 font-mono text-2xl font-semibold">{fmt(m.value, m.unit)}</p>
          <p className="mt-1 flex items-center justify-between text-xs text-muted"><span>Target {m.better === "down" ? "< " : ""}{fmt(m.target, m.unit)} · {ago(m.updated_at)}</span><button className="text-neon hover:underline" onClick={() => setEdit(true)}>Edit</button></p>
        </>
      )}
    </div>
  );
}
