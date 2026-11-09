# Agent rules for apps/web

This is Next.js 16.3.6 (App Router, Turbopack default). It has breaking changes from older versions. Before writing framework code, read the relevant guide in `node_modules/next/dist/docs/` and heed its deprecation notices.

Rules that apply across this app:

- Request APIs are async only: `await cookies()`, `await headers()`, `await params`, `await searchParams`.
- The `middleware` file convention is deprecated; use `proxy.ts` with a `proxy` export.
- `next lint` is removed. Lint with `pnpm --filter web lint` (ESLint flat config in `eslint.config.mjs`).
- `next-env.d.ts` is generated and gitignored. Run `next typegen` (or `next dev`/`next build`) before `tsc` on a fresh clone.
- `revalidateTag` requires a `cacheLife` profile as its second argument.

Project rules (from the master spec, Part 0):

- Every tenant query filters by `workspaceId`. Cross-workspace access is a bug.
- Money is integer minor units (cents). Totals are recalculated on the server.
- Secrets live in env vars only, never in code, logs, errors, or client bundles.
- No demo data. Every number on screen comes from persisted rows.
- High-ticket only: no subscription tiers, no plans registry, no $99/$299/$999 pricing.
