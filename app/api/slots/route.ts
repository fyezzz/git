import { NextResponse } from "next/server";
import { availableSlots } from "@/lib/domain/booking";
import { db, getLead } from "@/lib/store";

export function GET(req: Request) {
  const leadId = new URL(req.url).searchParams.get("leadId");
  const lead = leadId ? getLead(leadId) : undefined;
  if (!lead) return NextResponse.json({ error: "Unknown leadId" }, { status: 404 });
  const slots = availableSlots({ from: new Date(), days: 7, bookings: db.bookings, repId: lead.ownerId ?? db.reps[0]!.id, limit: 12 });
  return NextResponse.json({ slots });
}
