# CodeOpsAcq (V2)

Multi-tenant agency revenue OS, rebuilt from the master spec in phases. Each phase stops at a checkpoint before the next one starts.

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold + tooling | Done |
| 1 | Database + Prisma (schema, 9 migrations) | Next |
| 2–12 | Seed, auth/RBAC, CRM, AI, commerce, billing, network, Notion, rev-share, dashboard, verification gate | Pending |

## Stack

pnpm 12.6.0 workspaces · Next.js 16.3.6 (App Router, Turbopack) · React 19.2.8 · Tailwind v4 · shadcn 4 · Prisma 6.19.3 on Postgres 16 · zod · Vitest 5.

## Commands

```bash
corepack enable            # picks up pnpm@12.6.0 from packageManager
pnpm install
pnpm --filter web dev      # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Vitest 5 needs Node `^22.12.0 || ^24 || >=26`; Next.js 16 needs Node 20.9+.

## Layout

- `apps/web`: the Next.js app (`src/app`, `src/components`, `src/lib`, `src/test`).
- `packages/database`: Prisma schema, migrations, client export, and the catalog seed.

Copy `.env.example` to `.env` and fill in values. Never commit real values.
