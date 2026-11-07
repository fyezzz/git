import { describe, expect, it } from "vitest";
import { q } from "./db";

describe("database bootstrap", () => {
  it("creates the schema and seeds the workspace", async () => {
    const [counts] = await q<Record<string, number>>(`SELECT
      (SELECT count(*)::int FROM deals) deals, (SELECT count(*)::int FROM catalog_items) catalog,
      (SELECT count(*)::int FROM tickets) tickets, (SELECT count(*)::int FROM wins) wins,
      (SELECT count(*)::int FROM legal_templates) legal, (SELECT count(*)::int FROM page_views) views`);
    expect(counts).toMatchObject({ deals: 11, tickets: 8, wins: 2, legal: 13, views: 1284 });
    expect(counts!.catalog).toBeGreaterThan(100);
    const [t] = await q<{ code: string }>("SELECT code FROM tickets ORDER BY code LIMIT 1");
    expect(t!.code).toMatch(/^DEV-\d+$/);
  });
});
