import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PlanCards } from "@/components/plan-cards";
import { FAQ, SITE, SOLUTIONS } from "@/lib/site";

const CHAIN = [
  { k: "01 · Evidence", h: "Review the signal", p: "Public-source lead signals from official APIs, labeled evidence or hypothesis, with suppression enforced." },
  { k: "02 · Pipeline", h: "Own every deal", p: "Six stages plus a Fridge queue. Every deal has an owner, a next step and its source." },
  { k: "03 · Economics", h: "Price before you scope", p: "107 catalog items with delivery cost. Gross profit and blended margin before you promise work." },
  { k: "04 · Delivery", h: "Ship through gates", p: "Scoped tickets routed by capacity through QA to handoff, with cycle time and on-time rate." },
  { k: "05 · Control", h: "See the whole machine", p: "AI Command, audit history, legal vault, invoices and KPIs computed from live data." },
];

const ENGINES = ["ChatGPT", "Perplexity", "Claude", "Gemini", "Copilot", "Grok", "Meta AI", "DeepSeek"];

export default function Home() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_40%,#02ef7d22,transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-[1.2fr_1fr] md:px-6 md:pt-24">
          <div>
            <p className="kicker text-neon">The agency operating system</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
              From lead to <span className="text-neon">shipped.</span> One workspace.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {SITE.name} connects lead evidence, a 6-stage CRM, unit economics, developer delivery and <strong className="font-semibold text-text">AI lead attribution</strong>, so you know which deals make money and which AI assistant sent them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn btn-primary px-5 py-3 text-base">Book a 20-min diagnosis →</Link>
              <Link href="/pricing" className="btn btn-ghost px-5 py-3 text-base">See pricing</Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 font-mono">
              <div><dt className="text-[11px] uppercase tracking-wider text-muted">CRM stages</dt><dd className="text-2xl font-semibold">6 + Fridge</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wider text-muted">AI agents</dt><dd className="text-2xl font-semibold">8</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wider text-muted">Activation</dt><dd className="text-2xl font-semibold">30 days</dd></div>
            </dl>
          </div>
          <Orbit />
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-5" aria-label="AI assistants detected">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="text-neon">Attributes leads from</span>
          {ENGINES.map((e) => <span key={e}>{e}</span>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <p className="kicker text-neon">AI lead attribution</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">ChatGPT is recommending vendors. Know when it recommends you.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["1 · UTM", "ChatGPT tags cited links with utm_source=chatgpt.com. We catch it on the first page view."],
            ["2 · Referrer", "chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com and 15+ more AI hosts."],
            ["3 · Self-reported", "“How did you hear about us?” recovers AI traffic that arrives with no referrer, without overriding measured signals."],
          ].map(([h, p]) => (
            <div key={h} className="card p-6"><p className="font-mono text-sm text-neon">{h}</p><p className="mt-3 text-muted">{p}</p></div>
          ))}
        </div>
        <p className="mt-6 text-muted">The result rides on the CRM deal, so you see <strong className="text-text">leads, pipeline and won revenue by AI engine</strong>, not just clicks. <Link className="text-neon hover:underline" href="/solutions/ai-lead-attribution">How AI lead attribution works →</Link></p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="kicker text-neon">The operating chain</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Five links. One source of truth.</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {CHAIN.map((c) => (
            <li key={c.k} className="card p-5 transition hover:border-neon/50">
              <p className="font-mono text-xs text-neon">{c.k}</p>
              <h3 className="mt-8 text-lg font-semibold">{c.h}</h3>
              <p className="mt-2 text-sm text-muted">{c.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <p className="kicker text-neon">Engagements</p>
        <h2 className="mb-4 mt-3 text-4xl font-bold tracking-tight md:text-5xl">Done-for-you builds, delivered by the pod.</h2>
        <p className="mb-10 max-w-2xl text-muted">Fixed-scope sprints with a seven-developer team, running on the CodeOpsAcq workspace. Scope and price are confirmed on a diagnosis call.</p>
        <PlanCards />
        <p className="mt-6 text-sm text-muted">Custom platforms and AI infrastructure are scoped from $25k to $500k.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight">Solutions</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <Link key={s.slug} href={`/solutions/${s.slug}`} className="card group p-5 transition hover:border-neon/50">
              <p className="kicker">{s.keyword}</p>
              <h3 className="mt-2 font-semibold group-hover:text-neon">{s.h1}</h3>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24 md:px-6">
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        <FaqList items={FAQ} />
      </section>
    </>
  );
}

function Orbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]" aria-hidden>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{transform:scale(1.06);opacity:.85}}`}</style>
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#7dffc0,#02ef7d_35%,#014d2a_75%)] shadow-[0_0_120px_20px_#02ef7d55]" style={{ animation: "pulse 4s ease-in-out infinite" }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="absolute rounded-full border border-neon/30" style={{ inset: `${6 + i * 5}%`, transform: `rotateX(${62 + i * 4}deg) rotateZ(${i * 28}deg)`, animation: `spin ${14 + i * 5}s linear infinite ${i % 2 ? "reverse" : ""}` }}>
          <span className="absolute -top-1.5 left-1/2 size-3 rounded-full bg-white shadow-[0_0_14px_4px_#02ef7d]" />
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Evidence · Pipeline · Economics · Delivery · Control</div>
    </div>
  );
}
