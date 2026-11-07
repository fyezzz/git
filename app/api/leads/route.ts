import { NextResponse } from "next/server";
import { z } from "zod";
import { BUDGETS, ROLES, SOURCES, TIMELINES } from "@/lib/domain/types";
import { captureLead, db } from "@/lib/store";

const CaptureSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("").transform(() => undefined)),
  company: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
  source: z.enum(SOURCES).default("website"),
  budget: z.enum(BUDGETS),
  timeline: z.enum(TIMELINES),
  role: z.enum(ROLES),
  need: z.string().trim().min(5).max(2000),
});

export function GET() {
  return NextResponse.json({ leads: db.leads });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CaptureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json(captureLead(parsed.data), { status: 201 });
}
