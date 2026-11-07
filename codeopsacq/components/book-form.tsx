"use client";

import { useState } from "react";
import { HEARD_FROM_OPTIONS } from "@/lib/attribution";

const PLANS = ["Starter", "Growth", "Scale Flagship", "Custom build", "Not sure yet"];

export function BookForm({ plan }: { plan?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [heard, setHeard] = useState<string>("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    setIssues({});
    const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("idle");
      setError(data.error ?? "Something went wrong. Email hello@codeopsacq.com.");
      setIssues(data.issues ?? {});
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return (
      <div className="card p-8">
        <p className="kicker text-neon">Request received</p>
        <h2 className="mt-3 text-2xl font-semibold">We'll email you within one business day to book your diagnosis.</h2>
        <p className="mt-3 text-muted">Bring your current lead sources and your last three quotes. We'll map where margin and deals leak.</p>
      </div>
    );

  const err = (k: string) => issues[k]?.[0] && <p className="mt-1 text-xs text-danger">{issues[k]![0]}</p>;
  return (
    <form onSubmit={submit} noValidate className="card grid gap-4 p-6 sm:grid-cols-2">
      <div><label className="label" htmlFor="name">Name</label><input className="input" id="name" name="name" autoComplete="name" required />{err("name")}</div>
      <div><label className="label" htmlFor="email">Work email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required />{err("email")}</div>
      <div><label className="label" htmlFor="company">Agency / company</label><input className="input" id="company" name="company" autoComplete="organization" required />{err("company")}</div>
      <div><label className="label" htmlFor="plan">Interested in</label><select className="input" id="plan" name="plan" defaultValue={PLANS.includes(plan ?? "") ? plan : "Not sure yet"}>{PLANS.map((p) => <option key={p}>{p}</option>)}</select></div>
      <div><label className="label" htmlFor="budget">Project budget</label><select className="input" id="budget" name="budget" defaultValue="5k_25k"><option value="under_5k">Under $5k</option><option value="5k_25k">$5k–$25k</option><option value="25k_100k">$25k–$100k</option><option value="100k_plus">$100k+</option></select></div>
      <div>
        <label className="label" htmlFor="heard_from">How did you hear about us?</label>
        <select className="input" id="heard_from" name="heard_from" required value={heard} onChange={(e) => setHeard(e.target.value)}>
          <option value="" disabled>Choose one</option>
          {HEARD_FROM_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        {err("heard_from")}
      </div>
      {heard === "Another AI assistant" && <div className="sm:col-span-2"><label className="label" htmlFor="heard_detail">Which assistant?</label><input className="input" id="heard_detail" name="heard_detail" placeholder="e.g. DeepSeek, Meta AI, Le Chat" /></div>}
      <div className="sm:col-span-2"><label className="label" htmlFor="need">Biggest constraint right now</label><textarea className="input" id="need" name="need" rows={4} required placeholder="Deals have no owner, we price before we know delivery cost…" />{err("need")}</div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p>}
      <button className="btn btn-primary py-3 sm:col-span-2" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Book my diagnosis →"}</button>
      <p className="text-xs text-muted sm:col-span-2">We use your answer to understand which channels and AI assistants recommend us. No outreach without your request.</p>
    </form>
  );
}
