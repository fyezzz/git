import Link from "next/link";
import { PLANS } from "@/lib/site";

export function PlanCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((p) => (
        <article key={p.name} className={`card relative flex flex-col p-6 ${"featured" in p && p.featured ? "border-neon/50 shadow-[0_30px_80px_-40px_#02ef7d88]" : ""}`}>
          {"featured" in p && p.featured && <span className="absolute right-4 top-4 rounded-full bg-neon px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">Most teams</span>}
          <p className="kicker text-neon">{p.track}</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight">{p.name}</h3>
          <p className="mt-2"><span className="font-mono text-4xl font-semibold">${p.price}</span><span className="text-muted">/mo{p.name === "Scale Flagship" ? " + rev share" : ""}</span></p>
          <p className="text-xs text-muted">${p.annual.toLocaleString()}/yr billed annually</p>
          <p className="mt-3 text-sm text-muted">{p.for}</p>
          <ul className="mb-6 mt-5 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-neon">→</span>{f}</li>)}</ul>
          <Link href={`/book?plan=${encodeURIComponent(p.name)}`} className={`btn mt-auto ${"featured" in p && p.featured ? "btn-primary" : "btn-ghost"}`}>{p.name === "Scale Flagship" ? "Apply for Scale" : `Start with ${p.name}`}</Link>
        </article>
      ))}
    </div>
  );
}
