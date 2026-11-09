import type { Metadata } from "next";
import { BookForm } from "@/components/book-form";

export const metadata: Metadata = {
  title: "Book a 20-Minute Agency Diagnosis",
  description: "Five questions (Flow, Loss, Control, Ownership, Path) to find your agency's constraint, then the CodeOpsAcq engagement that fixes it.",
  alternates: { canonical: "/book" },
};

export default async function Book({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        <p className="kicker text-neon">Diagnosis first</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight">Twenty minutes. Five questions.</h1>
        <p className="mt-5 text-lg text-muted">Flow, Loss, Control, Ownership, Path. We find the constraint, then scope the one engagement that removes it. If we can't move the number, we tell you on the call.</p>
        <ul className="mt-8 space-y-3 text-muted">
          <li><span className="text-neon">Flow:</span> where do leads come from, and who owns the next step?</li>
          <li><span className="text-neon">Loss:</span> where do deals and margin leak?</li>
          <li><span className="text-neon">Control:</span> can you see delivery before it slips?</li>
          <li><span className="text-neon">Ownership:</span> who is accountable at each stage?</li>
          <li><span className="text-neon">Path:</span> a fixed-scope sprint, a full acquisition ecosystem, or a dedicated squad?</li>
        </ul>
      </div>
      <BookForm plan={plan} />
    </div>
  );
}
