"use client";

import { useState } from "react";
import { Modal, useRun } from "@/components/app/actions-ui";
import { createInvoice } from "@/lib/actions";

type Line = { description: string; qty: number; unit: number };

export function InvoiceBuilder() {
  return <Modal trigger="Create invoice" title="New invoice">{(close) => <Builder close={close} />}</Modal>;
}

function Builder({ close }: { close: () => void }) {
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [due, setDue] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [lines, setLines] = useState<Line[]>([{ description: "", qty: 1, unit: 0 }]);
  const { run, pending } = useRun();
  const total = lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const set = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label">Client</label><input className="input" value={client} onChange={(e) => setClient(e.target.value)} /></div>
        <div><label className="label">Client email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Due date</label><input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_70px_110px_auto] gap-2">
          <input className="input" placeholder="Description" value={l.description} onChange={(e) => set(i, { description: e.target.value })} aria-label="Line description" />
          <input className="input" type="number" min={1} value={l.qty} onChange={(e) => set(i, { qty: Number(e.target.value) || 1 })} aria-label="Quantity" />
          <input className="input" type="number" min={0} step="0.01" value={l.unit} onChange={(e) => set(i, { unit: Number(e.target.value) || 0 })} aria-label="Unit price" />
          <button type="button" className="btn btn-ghost btn-sm" aria-label="Remove line" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => setLines((ls) => [...ls, { description: "", qty: 1, unit: 0 }])}>+ Line</button>
      <div className="flex items-center justify-between border-t border-line pt-3"><span className="font-mono text-lg">Total ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <button className="btn btn-primary" disabled={pending} onClick={() => run(() => createInvoice({ client, client_email: email, due_date: due, items: lines }), undefined, close)}>{pending ? "Saving…" : "Create invoice"}</button>
      </div>
    </div>
  );
}
