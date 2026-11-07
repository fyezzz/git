import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ENGINE_LABEL, HEARD_FROM_OPTIONS, resolveLeadAttribution, type Touch } from "@/lib/attribution";
import { audit, one, q } from "@/lib/db";

const Lead = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  company: z.string().trim().min(2).max(120),
  plan: z.enum(["Starter", "Growth", "Scale Flagship", "Custom build", "Not sure yet"]),
  budget: z.enum(["under_5k", "5k_25k", "25k_100k", "100k_plus"]),
  heard_from: z.enum(HEARD_FROM_OPTIONS),
  heard_detail: z.string().trim().max(200).optional().default(""),
  need: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().default(""), // honeypot
});

const VALUE: Record<string, number> = { under_5k: 300000, "5k_25k": 1500000, "25k_100k": 6000000, "100k_plus": 15000000 };
const PLAN_VALUE: Record<string, number> = { Starter: 118800, Growth: 358800, "Scale Flagship": 1198800 };

export const dynamic = "force-dynamic";

/** Public diagnosis request → CRM lead with resolved AI attribution. */
export async function POST(req: NextRequest) {
  const parsed = Lead.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bot

  const domain = d.email.split("@")[1]!;
  if ((await q("SELECT 1 FROM suppression WHERE value = $1 OR value = $2", [d.email, domain])).length) {
    return NextResponse.json({ ok: true }); // honour opt-out silently
  }

  const parse = (v?: string) => {
    try {
      return v ? (JSON.parse(v) as Touch) : null;
    } catch {
      return null;
    }
  };
  const heard = d.heard_from === "Another AI assistant" && d.heard_detail ? d.heard_detail : d.heard_from;
  const attr = resolveLeadAttribution(parse(req.cookies.get("cops_ft")?.value), parse(req.cookies.get("cops_lt")?.value), heard);
  const value = d.plan in PLAN_VALUE ? PLAN_VALUE[d.plan]! : VALUE[d.budget]!;
  const score = Math.min(99, 40 + (d.budget === "100k_plus" ? 30 : d.budget === "25k_100k" ? 22 : d.budget === "5k_25k" ? 12 : 4) + Math.min(20, Math.floor(d.need.split(/\s+/).length / 4)) + (attr.channel === "ai_assistant" ? 5 : 0));

  const deal = await one<{ id: string }>(
    `INSERT INTO deals (company, title, industry, value_cents, stage, ai_score, signal, contact_name, contact_email, next_step, channel, ai_engine, attribution)
     VALUES ($1, $2, 'Inbound', $3, 'lead', $4, $5, $6, $7, 'Book diagnosis call', $8, $9, $10::jsonb) RETURNING id`,
    [d.company, `${d.plan} · diagnosis request`, value, score, attr.channel === "ai_assistant" && attr.engine ? `Via ${ENGINE_LABEL[attr.engine]}` : "Inbound form", d.name, d.email, attr.channel, attr.engine, JSON.stringify({ ...attr, need: d.need, budget: d.budget })],
  );
  await audit("CRM", "Inbound lead captured", `${d.company} (${d.email}) · ${attr.channel}${attr.engine ? `/${attr.engine}` : ""} · ${attr.confidence}`);
  return NextResponse.json({ ok: true, id: deal.id });
}
