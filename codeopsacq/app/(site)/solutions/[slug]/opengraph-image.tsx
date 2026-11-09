import { ogCard, OG_SIZE } from "@/lib/og";
import { SOLUTIONS } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CodeOpsAcq solution";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SOLUTIONS.find((x) => x.slug === slug) ?? SOLUTIONS[0]!;
  return ogCard({ kicker: s.keyword, title: s.h1, sub: s.description });
}
