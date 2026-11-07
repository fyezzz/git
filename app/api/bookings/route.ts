import { NextResponse } from "next/server";
import { z } from "zod";
import { bookCall, getLead } from "@/lib/store";

const BookSchema = z.object({ leadId: z.string(), start: z.string().datetime(), end: z.string().datetime() });

export async function POST(req: Request) {
  const parsed = BookSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  const { leadId, start, end } = parsed.data;
  if (!getLead(leadId)) return NextResponse.json({ error: `Lead ${leadId} not found` }, { status: 404 });
  try {
    return NextResponse.json({ booking: bookCall(leadId, { start, end }) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
