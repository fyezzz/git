import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { PlanCards } from "@/components/plan-cards";
import { FAQ } from "@/lib/site";

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
      <div className="card mt-8 p-6">
        <h2 className="text-xl font-semibold">Custom builds and dedicated pods: $25k–$500k</h2>
        <p className="mt-2 text-muted">AI infrastructure, white-label platforms, data platforms and product pods, scoped against delivery requirements before a quote. <Link className="text-neon hover:underline" href="/solutions/white-label-agency-software">White-label & custom builds →</Link></p>
      </div>
      <p className="mt-6 text-sm text-muted">CodeOpsAcq guarantees defined platform access, structured activation and developer capacity terms. It does not guarantee lead volume, booked calls, close rates or revenue.</p>
      <div className="mx-auto mt-20 max-w-3xl"><h2 className="mb-6 text-2xl font-bold">Pricing questions</h2><FaqList items={FAQ.filter((f) => /cost|guarantee|incubator|Scale/i.test(f.q))} /></div>
    </div>
  );
}
