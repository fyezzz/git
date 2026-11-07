"use client";

import Link from "next/link";
import { useState } from "react";
import { BookingPicker } from "./booking-picker";
import type { Lead, Message } from "@/lib/domain/types";

type Result = { lead: Lead; reply: Message; responseMs: number };

const field = "w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-sm text-text placeholder:text-muted/60 focus:border-neon focus:outline-none";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

export function CaptureForm() {
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrors(null);
    setFatal(null);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) {
      setState("idle");
      if (data.issues) setErrors(data.issues);
      else setFatal(data.error ?? "Something went wrong");
      return;
    }
    setResult(data);
    setState("done");
  }

  if (state === "done" && result) {
    const { lead, reply, responseMs } = result;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-neon/40 bg-neon-dim p-5">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-neon"><span>AI agent · replied in {responseMs}ms</span><span className="font-mono">score {lead.qualification.score} · {lead.qualification.tier}</span></div>
          <p className="text-sm leading-relaxed">{reply.body}</p>
        </div>
        {lead.qualification.nextAction === "book_call" && (
          <div className="rounded-xl border border-line bg-panel p-5"><h2 className="mb-3 text-sm font-semibold">Pick a time</h2><BookingPicker leadId={lead.id} /></div>
        )}
        <Link href={`/leads/${lead.id}`} className="inline-block text-xs text-muted hover:text-neon">View this lead in the CRM →</Link>
      </div>
    );
  }

  const err = (k: string) => errors?.[k]?.[0] && <p className="mt-1 text-xs text-danger">{errors[k]![0]}</p>;
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-xl border border-line bg-panel p-6 sm:grid-cols-2">
      <div><label className={label} htmlFor="name">Name</label><input id="name" name="name" required className={field} placeholder="Jane Founder" />{err("name")}</div>
      <div><label className={label} htmlFor="email">Email</label><input id="email" name="email" type="email" required className={field} placeholder="jane@company.com" />{err("email")}</div>
      <div><label className={label} htmlFor="company">Company</label><input id="company" name="company" className={field} /></div>
      <div><label className={label} htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" className={field} /></div>
      <div><label className={label} htmlFor="role">Your role</label>
        <select id="role" name="role" className={field} defaultValue="owner"><option value="owner">Owner / Founder</option><option value="executive">Executive</option><option value="manager">Manager</option><option value="individual">Individual contributor</option></select></div>
      <div><label className={label} htmlFor="budget">Monthly budget</label>
        <select id="budget" name="budget" className={field} defaultValue="5k_15k"><option value="under_1k">Under $1k</option><option value="1k_5k">$1k–$5k</option><option value="5k_15k">$5k–$15k</option><option value="15k_plus">$15k+</option></select></div>
      <div><label className={label} htmlFor="timeline">Timeline</label>
        <select id="timeline" name="timeline" className={field} defaultValue="30_days"><option value="now">Right now</option><option value="30_days">Within 30 days</option><option value="90_days">Within 90 days</option><option value="exploring">Just exploring</option></select></div>
      <div><label className={label} htmlFor="source">How did you find us?</label>
        <select id="source" name="source" className={field} defaultValue="website"><option value="website">Website</option><option value="google_ads">Google</option><option value="facebook_ads">Facebook</option><option value="instagram">Instagram</option><option value="referral">Referral</option><option value="other">Other</option></select></div>
      <div className="sm:col-span-2"><label className={label} htmlFor="need">Where is revenue leaking?</label><textarea id="need" name="need" rows={4} required className={field} placeholder="We get 150 leads a month but follow-up takes a day and half go cold…" />{err("need")}</div>
      {fatal && <p role="alert" className="text-sm text-danger sm:col-span-2">{fatal}</p>}
      <button type="submit" disabled={state === "submitting"} className="rounded-lg bg-neon px-4 py-3 text-sm font-semibold text-ink transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
        {state === "submitting" ? "Analyzing…" : "Get my instant answer →"}
      </button>
    </form>
  );
}
