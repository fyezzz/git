# CodeOpsAcq: the agency operating system

Lead evidence → 6-stage CRM → unit economics → developer delivery → control, plus **AI lead attribution** that shows which AI assistants (ChatGPT, Perplexity, Claude, Gemini, Copilot…) send you leads, pipeline and revenue.

Built from the "Codeopsacq 5" Muse showcase, rebuilt as a working product: every room reads and writes a real Postgres database, every change lands in the audit log.

## Run it

```bash
npm install
npm run dev        # http://localhost:3200  (embedded Postgres saved to ./.data, workspace open, no password)
npm test           # attribution engine + database bootstrap
npm run typecheck
npm run build
```

## Go live (Vercel + Supabase)

1. Create a Supabase project (free tier works). Copy **Project Settings → Database → Connection string → Transaction pooler** (port 6543).
2. Import this folder into Vercel (root directory `codeopsacq`). Set env vars:
   - `DATABASE_URL`: the Supabase connection string. Schema and starter data are created automatically on first request.
   - `APP_PASSWORD`: password for `/app`. Required in production; the workspace stays locked without it.
   - `NEXT_PUBLIC_SITE_URL`: your domain, e.g. `https://codeopsacq.com` (canonical URLs, sitemap, JSON-LD).
   - Optional: `ANTHROPIC_API_KEY` (Claude briefings in AI Command), `GITHUB_TOKEN` (higher Lead ops rate limit).
3. Point your GoDaddy domain at Vercel (DNS: `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com`).
4. Submit `https://yourdomain/sitemap.xml` in Google Search Console and Bing Webmaster Tools (Bing feeds ChatGPT search and Copilot).

## What's in it

| Area | Route | Works |
| --- | --- | --- |
| Public site | `/`, `/pricing`, `/faq`, `/book`, `/solutions/*` | 7 keyword-targeted solution pages, FAQ, pricing, diagnosis form |
| SEO / LLM visibility | `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | Organization, WebSite, SoftwareApplication+Offers, FAQPage and BreadcrumbList JSON-LD; robots allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended and others |
| AI attribution | `/api/track`, `/api/leads`, `/app/attribution` | First/last-touch cookies, UTM → referrer → self-reported resolution, 20+ AI hosts, report by engine and channel |
| Dashboard, Metrics, Investor | `/app`, `/app/metrics`, `/app/investor` | Computed from subscriptions, deals and tickets; manual marketing metrics editable |
| CRM | `/app/crm` | Drag-and-drop 7 columns, capture, edit, delete; Won posts a win; suppression enforced |
| Lead ops | `/app/lead-ops` | Live GitHub API intake (public data only), approve → CRM, sequences, suppression list |
| Catalog & profit | `/app/catalog` | 107 items, cart with price/cost/margin guardrails, cart → dev ticket |
| Tickets, Fulfillment, Team | `/app/tickets`, `/app/fulfillment`, `/app/team` | Create, auto-route to least-loaded dev, stage/progress/assignee, on-time rate, cycle time, capacity |
| AI command | `/app/ai-command` | 8 agents over live data with mission routing; optional Claude synthesis |
| Templates, Routing | `/app/templates`, `/app/routing` | Full CRUD, copy, toggle |
| Legal & invoices | `/app/legal` | 13 editable contract templates, invoice builder, status, email drafts |
| Wins, Audit | `/app/wins`, `/app/audit` | Win stream + leaderboard; filterable audit log with CSV export |
| Settings | `/app/settings` | Workspace, timezone, targets; integration status from real env vars |

## Not connected yet (shown as "Not configured", never faked)

Discord/Skool/Whop posting, Stripe payments, DocuSign e-signature, Fathom analytics, email sending. Outreach is always human-sent by design.
