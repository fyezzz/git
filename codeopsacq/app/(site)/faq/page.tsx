import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { FAQ, SOLUTIONS } from "@/lib/site";

const ALL = [...FAQ, ...SOLUTIONS.flatMap((s) => s.faqs)];

export const metadata: Metadata = {
  title: "FAQ: Agency CRM, AI Attribution & Pricing",
  description: "Answers about CodeOpsAcq: AI lead attribution from ChatGPT and Perplexity, agency CRM, profit margins, delivery capacity, pricing and compliance.",
  alternates: { canonical: "/faq" },
};

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ALL.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mt-3 text-muted">Everything about running an agency on CodeOpsAcq, grouped by topic.</p>
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">About CodeOpsAcq, pricing and guarantees</h2>
        <FaqList items={FAQ} />
      </section>
      {SOLUTIONS.map((s) => (
        <section className="mt-12" key={s.slug}>
          <h2 className="mb-1 text-2xl font-bold">{s.keyword}</h2>
          <p className="mb-4 text-sm text-muted">{s.description} <Link className="text-neon hover:underline" href={`/solutions/${s.slug}`}>Read more →</Link></p>
          <FaqList items={s.faqs} />
        </section>
      ))}
    </div>
  );
}
