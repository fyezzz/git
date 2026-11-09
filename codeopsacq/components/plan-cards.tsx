import Link from "next/link";
import { ENGAGEMENTS } from "@/lib/site";

/** High-ticket engagement ladder, delivered by the pod. */
export function PlanCards() {
  return (
    <div className="grid gap-3">
      {ENGAGEMENTS.map((e, i) => (
        <article key={e.name} className={`card group grid items-center gap-4 p-5 transition hover:border-neon/50 md:grid-cols-[48px_1.2fr_1.6fr_auto_auto] ${"featured" in e && e.featured ? "border-neon/50 shadow-[0_30px_80px_-50px_#02ef7d]" : ""}`}>
          <span className="font-mono text-sm text-neon">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="text-lg font-semibold tracking-tight">{e.name}{"featured" in e && e.featured && <span className="ml-2 rounded-full bg-neon px-2 py-0.5 align-middle font-mono text-[10px] font-bold uppercase tracking-wider text-ink">Most chosen</span>}</h3>
          <p className="text-sm text-muted">{e.scope}</p>
          <p className="font-mono text-lg font-semibold md:text-right">{e.investment}<span className="block text-xs font-normal text-muted">{e.timeline}</span></p>
          <Link href={`/book?plan=${encodeURIComponent(e.name)}`} className="btn btn-ghost btn-sm group-hover:border-neon group-hover:text-neon">Apply →</Link>
        </article>
      ))}
    </div>
  );
}
