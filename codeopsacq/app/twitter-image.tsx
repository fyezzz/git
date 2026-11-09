import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "CodeOpsAcq: the agency operating system";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ kicker: "The agency operating system", title: "From lead to shipped. One workspace.", sub: "CRM, margins, delivery and AI lead attribution from ChatGPT, Perplexity and Claude." });
}
