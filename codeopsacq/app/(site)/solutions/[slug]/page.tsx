import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { SITE, SOLUTIONS } from "@/lib/site";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: s.title, description: s.description, keywords: [s.keyword, ...SITE.keywords.slice(0, 6)], alternates: { canonical: `/solutions/${s.slug}` }, openGraph: { title: s.title, description: s.description, url: `/solutions/${s.slug}` } };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = SOLUTIONS.filter((x) => x.slug !== s.slug).slice(0, 4);
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE.url }, { "@type": "ListItem", position: 2, name: s.keyword, item: `${SITE.url}/solutions/${s.slug}` }] },
        ]}
      />
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted"><Link href="/" className="hover:text-neon">Home</Link> / <span>{s.keyword}</span></nav>
      <p className="kicker mt-8 text-neon">{s.keyword}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{s.h1}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">{s.intro}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/book" className="btn btn-primary">Book a 20-min diagnosis →</Link><Link href="/pricing" className="btn btn-ghost">Pricing</Link></div>
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {s.points.map((p) => (
          <section key={p.h} className="card p-6"><h2 className="text-lg font-semibold">{p.h}</h2><p className="mt-2 text-muted">{p.p}</p></section>
        ))}
      </div>
      {s.steps && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">How {s.keyword.toLowerCase()} works in CodeOpsAcq</h2>
          <ol className="mt-6 space-y-3">{s.steps.map((st, i) => <li className="card flex gap-4 p-5" key={st}><span className="font-mono text-neon">{String(i + 1).padStart(2, "0")}</span><p className="text-muted">{st}</p></li>)}</ol>
        </section>
      )}
      {s.forWho && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Who it is for</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">{s.forWho.map((w) => <li className="card p-5 text-muted" key={w}>{w}</li>)}</ul>
        </section>
      )}
      {s.compare && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">CodeOpsAcq vs the usual tool stack</h2>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted"><tr><th className="p-4" scope="col"></th><th className="p-4" scope="col">Typical stack</th><th className="p-4 text-neon" scope="col">CodeOpsAcq</th></tr></thead>
              <tbody className="divide-y divide-line">{s.compare.map(([a, t, c]) => <tr key={a}><th className="p-4 text-left font-medium" scope="row">{a}</th><td className="p-4 text-muted">{t}</td><td className="p-4">{c}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
      <section className="mt-16"><h2 className="mb-6 text-2xl font-bold">{s.keyword}: common questions</h2><FaqList items={s.faqs} /></section>
      <section className="mt-16"><h2 className="mb-4 text-lg font-semibold">Related</h2><ul className="grid gap-2 md:grid-cols-2">{others.map((o) => <li key={o.slug}><Link className="text-neon hover:underline" href={`/solutions/${o.slug}`}>{o.title}</Link></li>)}</ul></section>
    </article>
  );
}
