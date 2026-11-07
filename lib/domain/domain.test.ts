import { describe, expect, it } from "vitest";
import { availableSlots, isSlotOpen } from "./booking";
import { qualify, tierFor } from "./qualify";
import { composeFirstResponse } from "./responder";
import { bookCall, captureLead, db } from "../store";

describe("qualify", () => {
  it("scores a decision maker with budget and urgency as hot", () => {
    const q = qualify({ budget: "15k_plus", role: "owner", timeline: "now", need: "We need automated follow up and booking for our sales pipeline leads" });
    expect(q.tier).toBe("hot");
    expect(q.nextAction).toBe("book_call");
    expect(q.score).toBeLessThanOrEqual(100);
  });
  it("disqualifies tiny budgets with no timeline", () => {
    const q = qualify({ budget: "under_1k", role: "individual", timeline: "exploring", need: "curious" });
    expect(q.tier).toBe("cold");
    expect(q.nextAction).toBe("disqualify");
  });
  it("applies tier thresholds at the boundary", () => {
    expect(tierFor(70)).toBe("hot");
    expect(tierFor(69)).toBe("warm");
    expect(tierFor(45)).toBe("warm");
    expect(tierFor(44)).toBe("cold");
  });
});

describe("responder", () => {
  it("personalizes with first name", () => {
    const q = qualify({ budget: "5k_15k", role: "owner", timeline: "now", need: "More booking from leads" });
    expect(composeFirstResponse({ name: "Maya Thompson", need: "More booking from leads", qualification: q })).toContain("Hi Maya");
  });
});

describe("booking", () => {
  const monday = new Date("2026-11-09T08:00:00Z");
  it("only offers working-hour slots after the notice window", () => {
    const slots = availableSlots({ from: monday, days: 0, bookings: [], repId: "r1", limit: 100 });
    expect(slots[0]!.start).toBe("2026-11-09T09:00:00.000Z");
    expect(slots.at(-1)!.start).toBe("2026-11-09T16:30:00.000Z");
  });
  it("excludes booked slots", () => {
    const taken = [{ id: "b", leadId: "l", repId: "r1", start: "2026-11-09T09:00:00.000Z", end: "2026-11-09T09:30:00.000Z", createdAt: "" }];
    expect(isSlotOpen({ start: "2026-11-09T09:00:00.000Z", end: "2026-11-09T09:30:00.000Z" }, taken, "r1")).toBe(false);
    expect(isSlotOpen({ start: "2026-11-09T09:00:00.000Z", end: "2026-11-09T09:30:00.000Z" }, taken, "r2")).toBe(true);
  });
});

describe("capture flow", () => {
  it("captures, responds, qualifies, assigns, notifies, and books", () => {
    const before = db.notifications.length;
    const { lead, reply } = captureLead({ name: "Test Owner", email: "t@x.co", source: "website", budget: "15k_plus", timeline: "now", role: "owner", need: "Automate lead follow up, booking and our crm pipeline to scale revenue" });
    expect(reply.author).toBe("ai_agent");
    expect(lead.firstResponseAt).toBeDefined();
    expect(lead.stage).toBe("qualified");
    expect(lead.ownerId).toBeDefined();
    expect(db.notifications.length).toBe(before + 1);
    const slot = availableSlots({ from: new Date(), days: 7, bookings: db.bookings, repId: lead.ownerId!, limit: 1 })[0]!;
    bookCall(lead.id, slot);
    expect(lead.stage).toBe("booked");
    expect(() => bookCall(lead.id, slot)).toThrow("no longer available");
  });
});
