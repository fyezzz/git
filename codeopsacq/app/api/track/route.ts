import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { classifyVisit, type Touch } from "@/lib/attribution";
import { q } from "@/lib/db";

const Body = z.object({ url: z.string().url().max(2000), referrer: z.string().max(2000).optional().nullable() });
const YEAR = 60 * 60 * 24 * 365;
const SESSION_MIN = 30;

export const dynamic = "force-dynamic";

/** First-party page-view beacon. Sets first-touch (permanent) and last-touch (per session) attribution cookies. */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid beacon" }, { status: 400 });
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|headless/i.test(ua)) return new NextResponse(null, { status: 204 });

  const ownHost = req.nextUrl.hostname;
  const touch = classifyVisit({ url: parsed.data.url, referrer: parsed.data.referrer, ownHost });
  const vid = req.cookies.get("cops_vid")?.value ?? randomUUID();
  const inSession = !!req.cookies.get("cops_sess")?.value;
  const first = req.cookies.get("cops_ft")?.value;

  // A new session with a real signal replaces last touch; a direct revisit mid-session keeps the existing one.
  const lastRaw = req.cookies.get("cops_lt")?.value;
  const last: Touch | null = lastRaw ? safeParse(lastRaw) : null;
  const newLast = !inSession && (touch.channel !== "direct" || !last) ? touch : last ?? touch;
  const sessionTouch = inSession && last ? last : touch;

  await q("INSERT INTO page_views (visitor_id, path, channel, ai_engine, source) VALUES ($1,$2,$3,$4,$5)", [vid, touch.landing ?? "/", sessionTouch.channel, sessionTouch.engine, sessionTouch.source]);

  const res = new NextResponse(null, { status: 204 });
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: req.nextUrl.protocol === "https:", path: "/" };
  res.cookies.set("cops_vid", vid, { ...opts, maxAge: YEAR });
  if (!first) res.cookies.set("cops_ft", JSON.stringify(touch), { ...opts, maxAge: YEAR });
  res.cookies.set("cops_lt", JSON.stringify(newLast), { ...opts, maxAge: YEAR });
  res.cookies.set("cops_sess", "1", { ...opts, maxAge: SESSION_MIN * 60 });
  return res;
}

function safeParse(v: string): Touch | null {
  try {
    return JSON.parse(v) as Touch;
  } catch {
    return null;
  }
}
