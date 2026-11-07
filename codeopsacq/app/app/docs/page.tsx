import { CopyButton } from "@/components/app/actions-ui";
import { Card, Header } from "@/components/app/ui";

const QUICKSTART = `cp .env.example .env.local   # set DATABASE_URL, APP_PASSWORD
npm install
npm run dev                  # http://localhost:3200
npm test && npm run typecheck && npm run build`;

const WIN_EVENT = `{
  "event": "deal.won",
  "occurred_at": "2026-10-05T12:00:00Z",
  "deal": { "id": "<deal_uuid>", "value_cents": 8500000 },
  "closer": { "id": "<member_id>" },
  "attribution": { "channel": "ai_assistant", "engine": "chatgpt", "confidence": "referrer" }
}`;

export default function Docs() {
  return (
    <>
      <Header title="Docs & architecture" subtitle="How the workspace works and how it's built." what="Product handbook" why="Orient new team members and contributors." start="Read the quickstart, then the feature map." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Quickstart" action={<CopyButton text={QUICKSTART} />}><pre className="overflow-x-auto rounded-lg bg-ink-2 p-4 font-mono text-xs">{QUICKSTART}</pre><ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted"><li>Dashboard shows the live operating snapshot.</li><li>Move a lead to Won in the CRM, then check Wins and Audit.</li><li>Build a cart in Catalog; it becomes a priced dev ticket.</li><li>Ask AI Command “Do we have capacity for 3 new clients?”.</li><li>Open AI attribution to see which assistants send pipeline.</li></ol></Card>
        <Card title="Architecture"><ul className="space-y-2 text-sm text-muted"><li><b className="text-text">Web:</b> Next.js App Router, React Server Components, server actions.</li><li><b className="text-text">Data:</b> PostgreSQL (Supabase in production; embedded PGlite in development). Schema in <code>lib/schema.sql</code>.</li><li><b className="text-text">Attribution:</b> first-party beacon <code>/api/track</code> → first/last-touch cookies → resolved on <code>/api/leads</code>.</li><li><b className="text-text">Agents:</b> <code>lib/agents.ts</code> routes missions to 8 analysts over live data; optional Claude synthesis.</li><li><b className="text-text">Auth:</b> password-gated workspace (<code>APP_PASSWORD</code>), signed session cookie.</li><li><b className="text-text">Governance:</b> every mutation writes <code>audit_log</code>.</li></ul></Card>
        <Card title="Win event contract" action={<CopyButton text={WIN_EVENT} />}><pre className="overflow-x-auto rounded-lg bg-ink-2 p-4 font-mono text-xs">{WIN_EVENT}</pre></Card>
        <Card title="Production rules"><ul className="list-disc space-y-1 pl-5 text-sm text-muted"><li>Secrets stay server-side as environment variables.</li><li>Outreach is human-sent; suppression is enforced everywhere.</li><li>Integration status shows real configuration. Never label a mock as connected.</li><li>Typecheck, tests and build before every deploy.</li></ul></Card>
      </div>
    </>
  );
}
