import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { PlanCards } from "@/components/plan-cards";
import { FAQ, PLANS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Agency Software from $99/month",
  description: "CodeOpsAcq pricing: Starter $99/mo, Growth $299/mo, Scale Flagship $999/mo + rev share (application only). Custom builds $25k–$500k.",
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <p className="kicker text-neon">Pricing</p>
      <h1 className="mt-3 text-5xl font-bold tracking-tight">Agency software from $99/month</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Two tracks. Operators run their agency on Starter or Growth. Builders apply for Scale Flagship and launch with our seven-developer pod.</p>
      <div className="mt-12"><PlanCards /></div>
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Compare plans</h2>
        <p className="mt-2 text-muted">Starter and Growth are for agencies running their own operation. Scale Flagship is an application-only incubator for builders launching an agency with our developer pod.</p>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted"><tr><th className="p-4" scope="col">Feature</th>{PLANS.map((p) => <th className="p-4" key={p.name} scope="col">{p.name}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {[
                ["Monthly price", "$99", "$299", "$999 + rev share"],
                ["Annual price", "$1,188", "$3,588", "$11,988 + rev share"],
                ["6-stage CRM + Fridge queue", "✓", "✓", "✓"],
                ["AI lead attribution", "✓", "✓", "✓"],
                ["Profit catalog & cart", "✓", "✓", "✓"],
                ["Developer ticket flow", "✓", "✓", "✓"],
                ["AI Command (8 specialist agents)", "—", "✓", "✓"],
                ["Lead ops review queue + outreach templates", "—", "✓", "✓"],
                ["Team routing & fulfillment visibility", "—", "✓", "✓"],
                ["Legal vault + invoices", "—", "✓", "✓"],
                ["30-day structured activation", "—", "—", "✓"],
                ["Seven-developer pod build capacity", "—", "—", "✓ (finite)"],
                ["Who it is for", "Solo operators", "Growing agencies", "Accepted builders"],
              ].map(([f, ...v]) => <tr key={f}><th className="p-4 text-left font-medium" scope="row">{f}</th>{v.map((x, i) => <td className={`p-4 ${x === "✓" || x.startsWith("✓") ? "text-neon" : "text-muted"}`} key={i}>{x}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <div className="card mt-8 p-6">
        <h2 className="text-xl font-semibold">Custom builds and dedicated pods: $25k–$500k</h2>
        <p className="mt-2 text-muted">AI infrastructure, white-label platforms, data platforms and product pods, scoped against delivery requirements before a quote. <Link className="text-neon hover:underline" href="/solutions/white-label-agency-software">White-label & custom builds →</Link></p>
      </div>
      <p className="mt-6 text-sm text-muted">CodeOpsAcq guarantees defined platform access, structured activation and developer capacity terms. It does not guarantee lead volume, booked calls, close rates or revenue.</p>
      <div className="mx-auto mt-20 max-w-3xl"><h2 className="mb-6 text-2xl font-bold">Pricing questions</h2><FaqList items={FAQ.filter((f) => /cost|guarantee|incubator|Scale/i.test(f.q))} /></div>
    </div>
  );
}
