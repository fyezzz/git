import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { PlanCards } from "@/components/plan-cards";
import { FAQ, INCLUDED, PROTOCOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Done-for-You Agency Builds",
  description: "Fixed-scope sprints delivered by a seven-developer pod, from $5,000 to $40,000+. Custom builds scoped up to $500k. Price confirmed on a diagnosis call.",
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <p className="kicker text-neon">Pricing</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-bold tracking-tight">Done-for-you builds, delivered by the pod</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">We don't sell seats. We build the revenue system for you: fixed-scope sprints with a seven-developer pod, running on the CodeOpsAcq workspace. Every engagement starts with a diagnosis call where scope and price are confirmed.</p>
      <div className="mt-12"><PlanCards /></div>
      <p className="mt-4 text-sm text-muted">Larger custom platforms, AI infrastructure and white-label builds are scoped from $25k to $500k. <Link className="text-neon hover:underline" href="/solutions/white-label-agency-software">Custom builds →</Link></p>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl font-bold">How every sprint runs</h2>
          <ol className="mt-5 space-y-3">{PROTOCOL.map((s, i) => <li key={s} className="flex gap-3"><span className="font-mono text-neon">{String(i + 1).padStart(2, "0")}</span><span className="text-muted">{s}</span></li>)}</ol>
        </section>
        <section className="card p-6">
          <h2 className="text-2xl font-bold">Included with every engagement</h2>
          <ul className="mt-5 space-y-3">{INCLUDED.map((s) => <li key={s} className="flex gap-3"><span className="text-neon">✓</span><span className="text-muted">{s}</span></li>)}</ul>
        </section>
      </div>

      <section className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div><h2 className="text-xl font-semibold">Not sure which sprint fits?</h2><p className="mt-1 text-muted">Twenty minutes, five questions. We find the constraint and scope the build that removes it.</p></div>
        <Link href="/book" className="btn btn-primary px-5 py-3">Book a diagnosis →</Link>
      </section>

      <p className="mt-6 text-sm text-muted">Guarantees cover delivery scope and timelines agreed at kickoff, never revenue. Final scope and price are confirmed on a call; timelines start at kickoff.</p>
      <div className="mx-auto mt-20 max-w-3xl"><h2 className="mb-6 text-2xl font-bold">Pricing questions</h2><FaqList items={FAQ.filter((f) => /cost|guarantee|outreach/i.test(f.q))} /></div>
    </div>
  );
}
