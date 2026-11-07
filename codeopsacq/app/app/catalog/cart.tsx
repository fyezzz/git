"use client";

import { useMemo, useState } from "react";
import { useRun } from "@/components/app/actions-ui";
import { ticketFromCart } from "@/lib/actions";
import { pct, usd } from "@/lib/format";

type Item = { id: string; category: string; name: string; description: string; kind: string; price_cents: number | null; cost_cents: number; price_min_cents: number | null; price_max_cents: number | null };
type Line = { id: string; name: string; qty: number; price_cents: number; cost_cents: number };

export function Cart({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>("SaaS plans");
  const [lines, setLines] = useState<Line[]>([]);
  const [client, setClient] = useState("");
  const { run, pending } = useRun();
  const cats = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const match = (i: Item) => !q || `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q.toLowerCase());

  const add = (i: Item) =>
    setLines((ls) => {
      const ex = ls.find((l) => l.id === i.id);
      if (ex) return ls.map((l) => (l.id === i.id ? { ...l, qty: l.qty + 1 } : l));
      const price = i.price_cents ?? i.price_min_cents ?? 0;
      return [...ls, { id: i.id, name: i.name, qty: 1, price_cents: price, cost_cents: i.cost_cents }];
    });
  const upd = (id: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const price = lines.reduce((a, l) => a + l.price_cents * l.qty, 0);
  const cost = lines.reduce((a, l) => a + l.cost_cents * l.qty, 0);
  const gp = price - cost;
  const margin = price > 0 ? (gp / price) * 100 : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <input className="input mb-4" placeholder={`Search all ${items.length} offers…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search catalog" />
        <div className="space-y-2">
          {cats.map((c) => {
            const list = items.filter((i) => i.category === c && match(i));
            if (!list.length) return null;
            const isOpen = open === c || !!q;
            return (
              <section key={c} className="card overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen && !q ? null : c)} className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-panel-2" aria-expanded={isOpen}>
                  <span><span className="font-semibold">{c}</span><span className="ml-2 text-xs text-muted">{list.length} items</span></span>
                  <span className="text-neon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <ul className="divide-y divide-line border-t border-line">
                    {list.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0"><p className="font-medium">{i.name}</p><p className="text-xs text-muted">{i.description}</p></div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-right font-mono text-xs">
                            {i.kind === "plan" ? `${usd(i.price_cents!)}/mo` : i.kind === "enterprise" ? `${usd(i.price_min_cents!, { compact: true })}–${usd(i.price_max_cents!, { compact: true })}` : <>cost {usd(i.cost_cents)}</>}
                          </span>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => add(i)}>Add</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
      <aside className="card h-fit p-5 xl:sticky xl:top-20">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Deal profit</h2>{lines.length > 0 && <button type="button" className="text-xs text-muted hover:text-danger" onClick={() => setLines([])}>Clear cart</button>}</div>
        <p className="mt-1 text-xs text-muted">{lines.length} items. Modules start at delivery cost; set the client price to model margin.</p>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="rounded-lg border border-line bg-panel-2 p-3 text-sm">
              <div className="flex justify-between gap-2"><span className="font-medium">{l.name}</span><button type="button" className="text-muted hover:text-danger" aria-label={`Remove ${l.name}`} onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}>✕</button></div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <label className="text-[10px] uppercase text-muted">Qty<input className="input mt-1 py-1" type="number" min={1} value={l.qty} onChange={(e) => upd(l.id, { qty: Math.max(1, Number(e.target.value) || 1) })} /></label>
                <label className="text-[10px] uppercase text-muted">Price $<input className="input mt-1 py-1" type="number" min={0} value={l.price_cents / 100} onChange={(e) => upd(l.id, { price_cents: Math.round((Number(e.target.value) || 0) * 100) })} /></label>
                <label className="text-[10px] uppercase text-muted">Cost $<input className="input mt-1 py-1" type="number" min={0} value={l.cost_cents / 100} onChange={(e) => upd(l.id, { cost_cents: Math.round((Number(e.target.value) || 0) * 100) })} /></label>
              </div>
            </li>
          ))}
          {lines.length === 0 && <li className="rounded-lg border border-dashed border-line p-4 text-center text-xs text-muted">Add a catalog item to see the margin.</li>}
        </ul>
        <dl className="mt-4 space-y-1.5 font-mono text-sm">
          <div className="flex justify-between"><dt className="text-muted">Client price</dt><dd>{usd(price, { exact: true })}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery cost</dt><dd>{usd(cost, { exact: true })}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Gross profit</dt><dd className={gp < 0 ? "text-danger" : "text-neon"}>{usd(gp, { exact: true })}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Blended margin</dt><dd className={margin < 0 ? "text-danger" : margin < 40 ? "text-warm" : "text-neon"}>{pct(margin)}</dd></div>
        </dl>
        {price > 0 && margin < 40 && <p className="mt-2 text-xs text-warm">{margin < 0 ? "Losing money. Re-scope before quoting." : "Under the 40% margin guardrail."}</p>}
        <input className="input mt-4" placeholder="Client name" value={client} onChange={(e) => setClient(e.target.value)} aria-label="Client name" />
        <button type="button" disabled={pending || lines.length === 0} className="btn btn-primary mt-3 w-full" onClick={() => run(() => ticketFromCart(lines.map(({ name, qty, price_cents, cost_cents }) => ({ name, qty, price_cents, cost_cents })), client), undefined, () => setLines([]))}>
          {pending ? "Creating…" : "Create dev ticket"}
        </button>
      </aside>
    </div>
  );
}
