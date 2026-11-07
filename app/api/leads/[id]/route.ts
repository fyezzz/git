import { NextResponse } from "next/server";
import { z } from "zod";
import { STAGES } from "@/lib/domain/types";
import { getLead, moveStage } from "@/lib/store";

const PatchSchema = z.object({ stage: z.enum(STAGES) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLead(id)) return NextResponse.json({ error: `Lead ${id} not found` }, { status: 404 });
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  return NextResponse.json({ lead: moveStage(id, parsed.data.stage) });
}
