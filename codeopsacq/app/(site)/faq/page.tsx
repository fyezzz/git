import type { Metadata } from "next";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { FAQ, SOLUTIONS } from "@/lib/site";

const ALL = [...FAQ, ...SOLUTIONS.flatMap((s) => s.faqs)];

export const metadata: Metadata = {
  title: "FAQ: Agency CRM, AI Lead Attribution & Pricing",
  description: "Answers about CodeOpsAcq: AI lead attribution from ChatGPT and Perplexity, agency CRM, profit margins, delivery capacity, pricing and compliance.",
  alternates: { canonical: "/faq" },
};

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ALL.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mb-10 mt-3 text-muted">Everything about running an agency on CodeOpsAcq.</p>
      <FaqList items={ALL} />
    </div>
  );
}
