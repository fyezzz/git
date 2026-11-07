import { getAudit } from "@/lib/data";
import { hasSession } from "@/lib/session";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // neutralize spreadsheet formula injection
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await hasSession())) return new Response("Unauthorized", { status: 401 });
  const source = new URL(req.url).searchParams.get("source") ?? undefined;
  const rows = await getAudit(source);
  const csv = ["at,source,action,detail", ...rows.map((r) => [new Date(r.at).toISOString(), r.source, r.action, r.detail].map(cell).join(","))].join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="audit-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
