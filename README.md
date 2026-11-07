# FFO Revenue Infrastructure

AI-first lead capture, qualification, booking, CRM and sales handoff system.

MVP flow: Lead capture -> instant AI response -> qualification -> booking -> CRM -> sales notification.

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, zod, Prisma/Postgres-ready domain model.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # domain + end-to-end capture flow tests
npm run typecheck
```

Open `/capture` to submit a lead as a prospect, then watch it land on the dashboard, pipeline, and conversations.

## Modules

| Route | What it does |
| --- | --- |
| `/capture` | Public lead form. Instant reply, BANT score, and inline booking for hot leads |
| `/` Dashboard | KPIs (speed to lead, pipeline, won revenue), latest leads, sales notifications |
| `/leads`, `/leads/[id]` | CRM table with tier filter; lead dossier with score breakdown, thread, booking, activity log |
| `/pipeline` | Kanban by stage; stage changes are logged |
| `/conversations` | Every thread, latest message first |
| `/agent` | The live scoring rubric and reply templates |
| `/automations` | Rules (hot-lead alert, auto-qualify, round-robin, booking handoff) + notification log |
| `/calendar` | Booked calls per rep |
| `/analytics` | Funnel and source performance |

API: `POST/GET /api/leads`, `PATCH /api/leads/[id]`, `GET /api/slots?leadId=`, `POST /api/bookings`.

## How it works

- `lib/domain/qualify.ts`: deterministic BANT score (0-100). Hot ≥ 70 books a call, warm ≥ 45 nurtures, cold nurtures or disqualifies.
- `lib/domain/responder.ts`: instant tiered first response (templates; swap in an LLM call here).
- `lib/domain/booking.ts`: 30-min slots, Mon–Fri 09:00–17:00 UTC, 60-min notice, conflict-checked per rep.
- `lib/domain/automations.ts`: trigger → condition → action rules run on capture and booking.
- `lib/store.ts`: in-memory store with seeded demo leads. **Data resets on restart.**

## Not connected yet

- Database: `prisma/schema.prisma` is ready; replace `lib/store.ts` with a Prisma repository and set `DATABASE_URL`.
- LLM provider for replies, email/SMS delivery for notifications, and Google/Outlook calendar sync.
- Auth on the internal CRM routes.
