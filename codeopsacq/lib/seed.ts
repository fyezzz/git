/** Starting workspace data, mirroring the CodeOpsAcq showcase. Runs once on an empty database. */
const lit = (v: unknown): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const rows = (table: string, cols: string[], data: unknown[][]) =>
  `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n${data.map((r) => `(${r.map(lit).join(", ")})`).join(",\n")}\nON CONFLICT DO NOTHING;`;

const $ = (dollars: number) => Math.round(dollars * 100);
const daysAgo = (d: number) => `now() - interval '${d} days'`;

export const MEMBERS = [
  ["sam", "Sam Avery", "SA", "Account executive"],
  ["mia", "Mia Lopez", "ML", "Account executive"],
  ["jon", "Jon Reyes", "JR", "Solutions lead"],
  ["ari", "Ari Kim", "AK", "Closer"],
  ["noa", "Noa Bennett", "NB", "Partnerships"],
];

const DEALS: [string, string, string, number | null, number, string, number, string, string, string, number][] = [
  // company, industry, title, seats, value $, stage, ai, signal, owner, channel, age days
  ["Northstar Logistics", "Logistics", "AI support automation", 42, 28000, "lead", 94, "Enriched", "sam", "ai_assistant", 2],
  ["Arc & Field Studio", "Agency", "White-label CRM", 18, 12500, "lead", 82, "Sequence ready", "mia", "organic_search", 3],
  ["Finlight Systems", "SaaS", "Custom operations portal", null, 44000, "contacted", 76, "Touch 1 sent", "jon", "referral", 6],
  ["Grove Commerce", "Commerce", "Lead operations + enrichment", null, 19800, "contacted", 88, "Touch 2 due", "ari", "ai_assistant", 5],
  ["Pillar Works", "Operations", "Revenue workflow redesign", null, 31200, "qualified", 79, "Verified", "noa", "paid", 9],
  ["Kepler Works", "Fintech", "AI qualification workspace", null, 22500, "qualified", 91, "Reply detected", "sam", "ai_assistant", 8],
  ["Meridian Labs", "AI workspace", "Custom agent workspace", null, 56000, "proposal", 96, "Follow-up day 2", "jon", "organic_search", 14],
  ["Vela Property Group", "Property", "Tenant CRM rollout", null, 38000, "proposal", 90, "Legal review", "mia", "referral", 12],
  ["Halcyon Health", "Health ops", "AI intake & routing", null, 85000, "won", 98, "Handoff ready", "ari", "ai_assistant", 21],
  ["Blackbird Ops", "Internal ops", "Internal command center", null, 68000, "won", 92, "Won", "noa", "referral", 25],
  ["Redwood Retail", "Retail", "Customer response automation", null, 14750, "lost", 68, "Budget closed", "sam", "social", 18],
];

const ENGINE: Record<string, string> = { "Northstar Logistics": "chatgpt", "Grove Commerce": "perplexity", "Kepler Works": "claude", "Halcyon Health": "chatgpt" };

const SUBSCRIPTIONS: [string, string, number, string, number][] = [
  ["Halcyon Health", "Custom retainer", 42000, "active", 160],
  ["Blackbird Ops", "Custom retainer", 38500, "active", 140],
  ["Meridian Labs", "Dedicated pod", 61000, "active", 220],
  ["Atlas Freight", "Dedicated pod", 54000, "active", 300],
  ["Lumen Clinics", "Custom retainer", 29500, "active", 95],
  ["Orbit Media", "Scale Flagship", 999, "active", 120],
  ["Quarry Labs", "Scale Flagship", 999, "active", 60],
  ["Nimbus Agency", "Growth", 299, "active", 200],
  ["Foundry North", "Growth", 299, "active", 75],
  ["Brightpath", "Starter", 99, "active", 40],
  ["Solace Digital", "Growth", 299, "cancelled", 180],
];

const REVIEWS: [string, string, number, string, string, number][] = [
  ["Orbit Stack", "Devtools", 26, "README notes enterprise rollout", "evidence", 91],
  ["Frame Labs", "AI infra", 11, "Hiring signal inferred from activity", "hypothesis", 78],
  ["Parallel Vertex", "Analytics", 8, "Public issue requests workflow help", "evidence", 84],
];

const DEVS = [
  ["dev-a", "Developer A", "AC", "Full-stack lead", 4],
  ["dev-b", "Developer B", "MR", "Payments & integrations", 3],
  ["dev-c", "Developer C", "SP", "Automation engineer", 3],
  ["dev-d", "Developer D", "JR", "AI systems", 4],
  ["dev-e", "Developer E", "NB", "Frontend systems", 3],
  ["dev-f", "Developer F", "KO", "Backend & data", 3],
  ["dev-g", "Developer G", "EL", "QA & release", 2],
];

const TICKETS: [string, string, string, string, number, string, number][] = [
  ["White-label tenant onboarding", "Automation", "standard", "delivered", 100, "dev-c", -6],
  ["Stripe revenue reconciliation", "Integration", "standard", "qa", 88, "dev-b", 3],
  ["Client intake automation portal", "Web application", "high", "development", 68, "dev-a", 6],
  ["Lead scoring agent", "AI automation", "high", "development", 45, "dev-d", 11],
  ["Tenant analytics dashboard", "Internal tool", "standard", "development", 30, "dev-e", 14],
  ["Webhook retry service", "Integration", "urgent", "qa", 92, "dev-f", 1],
  ["Voice AI receptionist", "AI automation", "standard", "approved", 10, "dev-d", 20],
  ["Proposal generator", "Web application", "standard", "scoping", 0, null as unknown as string, 28],
];

const CATALOG: [string, string, string, string, number | null, number, number | null, number | null][] = [
  ["SaaS plans", "Starter", "Core agency operations for a lean operator: 6-stage CRM, Fridge queue, profit catalog, developer tickets.", "plan", 99, 0, null, null],
  ["SaaS plans", "Growth", "Team workflows, AI Command, lead ops review queue, routing, marketing and legal drafts.", "plan", 299, 0, null, null],
  ["SaaS plans", "Scale Flagship", "Application-only incubator: full platform, 30-day activation, 7-developer pod capacity. Plus rev share.", "plan", 999, 0, null, null],
];
const MODULES: Record<string, [string, string, number][]> = {
  "Entry revenue leak fixes": [
    ["Speed-to-lead responder", "Instant reply to every inbound lead across forms and DMs.", 900],
    ["Missed-call text back", "Auto text when a call goes unanswered.", 450],
    ["Lead form audit + rebuild", "Rebuild forms for completion rate and routing.", 700],
    ["CRM cleanup sprint", "Dedupe, stage, and assign every open record.", 1100],
    ["Pipeline stage redesign", "Six-stage pipeline with exit criteria.", 800],
    ["Follow-up cadence install", "Three-touch human-reviewed cadence.", 650],
    ["Booking flow fix", "Calendar booking with reminders and no-show recovery.", 600],
    ["Reactivation campaign", "Win back cold leads from the last 12 months.", 750],
    ["Review request automation", "Ask happy clients for reviews at the right moment.", 400],
    ["Quote follow-up automation", "Nudge every open quote until a decision.", 500],
    ["Attribution setup", "UTM hygiene plus AI-assistant source tracking.", 850],
    ["Lead scoring rules", "Fit and intent scoring with routing.", 900],
  ],
  "Voice AI": [
    ["AI receptionist", "Answers, qualifies, and books 24/7.", 2400],
    ["Outbound voice qualifier", "Calls new leads within minutes for qualification.", 2800],
    ["Voicemail drop + recap", "Personalized voicemail with CRM recap.", 900],
    ["Call summary to CRM", "Transcribe, summarize, and log every call.", 1200],
    ["After-hours line", "Overflow and after-hours handling.", 1500],
    ["Appointment confirmations", "Voice confirmations and reschedules.", 800],
  ],
  "Sales intelligence": [
    ["Account research brief", "One-page brief before every call.", 600],
    ["Competitor watch", "Track competitor pricing and positioning changes.", 900],
    ["Deal risk alerts", "Flag stalled deals and missing next steps.", 1100],
    ["Win/loss analysis", "Structured reasons from every closed deal.", 1000],
    ["ICP builder", "Define and score your ideal customer profile.", 800],
    ["Intent signal monitor", "Public hiring, funding, and product signals.", 1300],
    ["Call coaching scorecards", "Score calls against your sales framework.", 1200],
  ],
  "Proposals + quotes": [
    ["Proposal template system", "Branded proposals with scope blocks.", 900],
    ["Margin-checked quoting", "Quotes blocked below target margin.", 1100],
    ["E-sign handoff", "Signed proposal triggers onboarding.", 700],
    ["Change-order workflow", "Scope changes priced before work starts.", 800],
  ],
  "Customer service + ops": [
    ["Support inbox triage", "Classify and route support requests.", 1100],
    ["Client portal", "Status, files, and approvals in one place.", 3200],
    ["Onboarding checklist automation", "Day 1 to Day 30 tasks assigned automatically.", 900],
    ["SLA monitor", "Alerts before SLAs breach.", 800],
    ["Knowledge base bot", "Answers from your SOPs and docs.", 1600],
    ["NPS + churn signals", "Survey and flag at-risk accounts.", 900],
    ["Renewal reminders", "Renewal pipeline with owner tasks.", 600],
    ["Escalation routing", "Urgent issues to the right owner fast.", 700],
  ],
  "Dashboards + data": [
    ["Revenue dashboard", "MRR, ARR, churn, and margin in one view.", 1500],
    ["Pipeline dashboard", "Stage velocity, conversion, forecast.", 1300],
    ["Delivery capacity board", "Team load, cycle time, QA pass rate.", 1200],
    ["Marketing ROI dashboard", "Spend to pipeline to revenue by channel.", 1400],
    ["AI-source attribution report", "Leads and pipeline from ChatGPT, Perplexity, Claude, Gemini.", 1600],
    ["Data warehouse sync", "Nightly sync to your warehouse.", 2200],
    ["Executive weekly digest", "Automated weekly operating report.", 700],
  ],
  "Automation integrations": [
    ["Stripe to CRM sync", "Payments and invoices on the deal record.", 900],
    ["Calendar sync", "Google and Outlook calendars on the pipeline.", 600],
    ["Slack/Discord alerts", "Wins and escalations to the right channel.", 500],
    ["Zapier/Make bridge", "Connect the long tail of tools.", 700],
    ["Email provider sync", "Gmail/Outlook threads on the deal.", 800],
    ["Form tool integration", "Typeform/Jotform into lead ops.", 400],
    ["Accounting sync", "QuickBooks/Xero invoices and payments.", 1100],
    ["Webhook hub", "Signed, retried, idempotent webhooks.", 1300],
  ],
  "Industry specific": [
    ["Home services pack", "Estimates, dispatch, and review flows.", 2600],
    ["Med spa pack", "Consult booking and treatment follow-up.", 2600],
    ["Legal intake pack", "Conflict check and consult booking.", 2800],
    ["Real estate pack", "Lead routing by area and price band.", 2400],
    ["SaaS sales pack", "Trial-to-paid pipeline and PQL scoring.", 2600],
    ["Dental pack", "New patient booking and recall.", 2400],
    ["Coaching pack", "Application funnel and enrollment calls.", 2000],
  ],
  "Custom software": [
    ["Internal admin tool", "CRUD admin for your data.", 6000],
    ["Customer-facing web app", "Authenticated app with billing.", 14000],
    ["Mobile companion app", "iOS/Android app on your API.", 18000],
    ["AI agent workspace", "Agents with tools on your data.", 16000],
    ["Data pipeline", "Ingest, clean, and model your data.", 9000],
    ["API integration build", "Custom integration with a third-party API.", 5000],
    ["Workflow engine", "Rules, queues, and retries for operations.", 11000],
    ["Reporting portal", "Client-facing reporting with exports.", 8000],
    ["Marketplace MVP", "Two-sided marketplace foundation.", 22000],
    ["Chrome extension", "Browser tool for your team or clients.", 5500],
    ["White-label platform", "Your brand, multi-tenant.", 26000],
    ["Legacy migration", "Move off spreadsheets or old software.", 9500],
  ],
  "Compliance + admin": [
    ["Consent + suppression setup", "Opt-out and suppression across channels.", 500],
    ["Audit trail install", "Who changed what, when, everywhere.", 900],
    ["Role-based access", "Permissions by role and workspace.", 1100],
    ["Data retention policy", "Retention and deletion automation.", 700],
  ],
  "Add-ons": [
    ["Extra seat pack (5)", "Five additional workspace seats.", 0],
    ["Priority support", "Same-day responses.", 150],
    ["Rush delivery", "Move to the front of the pod queue.", 900],
    ["Extra QA cycle", "One more full regression pass.", 400],
    ["Custom domain + branding", "Your domain, logo, and colors.", 200],
    ["Data import", "We migrate your records.", 600],
    ["Training session", "Live team training, 90 minutes.", 250],
    ["SOP library build", "Documented SOPs for each workflow.", 700],
    ["Monthly optimization sprint", "One improvement sprint per month.", 1500],
    ["Dedicated Slack channel", "Direct line to the pod.", 100],
    ["Extra environment", "Staging or sandbox environment.", 300],
    ["Uptime monitoring", "Alerts and monthly uptime report.", 120],
    ["Backup + restore drill", "Quarterly verified restore.", 350],
    ["Security review", "Lightweight security pass.", 1200],
    ["Performance tuning", "Speed up slow pages and queries.", 900],
    ["Accessibility pass", "WCAG fixes on key flows.", 800],
    ["Analytics setup", "Product analytics events and dashboards.", 600],
    ["Handoff documentation", "Architecture and runbooks.", 500],
  ],
};
const ENTERPRISE: [string, string, number, number][] = [
  ["AI infrastructure build", "Model gateways, evals, and observability.", 80000, 350000],
  ["White-label SaaS platform", "Multi-tenant platform under your brand.", 120000, 500000],
  ["Dedicated product pod", "Embedded pod for a quarter or more.", 75000, 300000],
  ["Enterprise CRM rebuild", "Replace a legacy CRM with a custom system.", 60000, 250000],
  ["Data platform", "Warehouse, pipelines, and BI.", 50000, 220000],
  ["Voice AI contact center", "Voice agents across sales and support.", 45000, 200000],
  ["Partner portal", "Partner onboarding, deals, and payouts.", 40000, 160000],
  ["Compliance platform", "Controls, evidence, and audit workflows.", 60000, 240000],
  ["Marketplace platform", "Two-sided marketplace at scale.", 90000, 400000],
  ["Internal AI copilots", "Copilots across operations teams.", 35000, 180000],
  ["Custom ERP module", "Operations module on your ERP.", 25000, 150000],
];

const TEMPLATES = [
  ["Cold email", "Problem → signal → question", "Lead with a verified operating signal, connect it to one bottleneck, then ask a direct question.", "Hi {{first_name}},\n\nNoticed {{signal}}. Teams at that stage usually hit {{bottleneck}} next.\n\nIs that on your radar this quarter?\n\n{{sender}}", "active"],
  ["Social DM", "Contextual follow-up", "Reference the previous touch and add one useful observation. Designed for manual sending.", "{{first_name}}, following up on my note about {{signal}}. One thing worth checking: {{observation}}. Happy to share how others handled it.", "active"],
  ["Value drop", "Two-minute teardown", "Offer a compact teardown that shows value before making another scheduling ask.", "{{first_name}}, I recorded a two-minute teardown of {{company}}'s {{area}}: {{link}}. Three fixes, no pitch. Worth a look?", "draft"],
];

const RULES = [
  ["Enterprise AI intake", "AI automation · $25k+", "Solutions pod", 120, "active", 1],
  ["Custom software", "Any custom build", "Dev triage", 240, "active", 2],
  ["Client escalation", "Priority urgent", "Agency admin", 30, "active", 3],
  ["Overflow", "Dev capacity > 85%", "Delivery manager", 60, "standby", 4],
];

const LEGAL: [string, string][] = [
  ["Mutual NDA", "Confidentiality, permitted use, exclusions, and return of materials."],
  ["Non-compete agreement", "Restricted activities, territory, duration, and enforceability review."],
  ["Service agreement", "Scope, delivery, payment, change control, and termination terms."],
  ["Set-fee finance contract", "Fixed project fee, milestone schedule, expenses, and late-payment terms."],
  ["MRR retainer agreement", "Monthly recurring scope, included capacity, renewal, and cancellation."],
  ["Profit-share agreement", "Revenue definition, attribution, reporting, payout, and audit rights."],
  ["1099 closer agreement", "Independent closer duties, commission, clawbacks, and compliance."],
  ["1099 setter agreement", "Appointment-setting scope, qualification rules, and compensation."],
  ["1099 sales manager agreement", "Team oversight, reporting, overrides, and performance expectations."],
  ["1099 virtual assistant agreement", "Administrative scope, access controls, availability, and confidentiality."],
  ["Revenue share addendum", "Incubator rev share: 50% of first eligible collected sale, 20% thereafter."],
  ["Statement of work", "Deliverables, acceptance criteria, timeline, and assumptions."],
  ["Data processing addendum", "Processing scope, sub-processors, security, and breach notice."],
];

const MANUAL: [string, string, string, number, number, string, string][] = [
  ["traffic", "Marketing", "Traffic", 1284, 1500, "count", "up"],
  ["site_conversion", "Marketing", "Conversion rate", 3.8, 5, "pct", "up"],
  ["cost_per_lead", "Marketing", "Cost per lead", 84, 75, "usd", "down"],
  ["email_open", "Marketing", "Email open rate", 52.6, 55, "pct", "up"],
  ["email_reply", "Marketing", "Email reply rate", 8.9, 10, "pct", "up"],
  ["marketing_spend", "Marketing", "Marketing spend (month)", 38000, 40000, "usd", "down"],
  ["calls_booked", "Sales", "Calls booked", 24, 30, "count", "up"],
  ["free_members", "Community", "Free members", 1842, 2000, "count", "up"],
  ["paid_members", "Community", "Paid members", 214, 250, "count", "up"],
  ["engagement", "Community", "Engagement", 38.5, 45, "pct", "up"],
];

/** demo=false (production default) seeds only starter content: settings, members, catalog, developers, templates, routing, legal templates. No deals, revenue, wins or traffic. */
export function seedSql(demo = process.env.SEED_DEMO === "1" || process.env.NODE_ENV !== "production"): string {
  const parts: string[] = [];
  parts.push("INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;");
  parts.push(rows("members", ["id", "name", "initials", "title"], MEMBERS));
  if (demo) parts.push(
    ...DEALS.map(([company, industry, title, seats, value, stage, ai, signal, owner, channel, age]) => {
      const engine = ENGINE[company] ?? null;
      const attribution = JSON.stringify({ first: { channel, engine, source: engine ? `${engine}.com` : channel, confidence: engine ? "referrer" : "utm" } });
      const closed = stage === "won" || stage === "lost" ? daysAgo(Math.max(1, age - 10)) : "NULL";
      return `INSERT INTO deals (company, industry, title, seats, value_cents, stage, ai_score, signal, owner_id, channel, ai_engine, attribution, created_at, stage_changed_at, first_response_at, closed_at, contact_name, contact_email)
VALUES (${lit(company)}, ${lit(industry)}, ${lit(title)}, ${lit(seats)}, ${$(value)}, ${lit(stage)}, ${ai}, ${lit(signal)}, ${lit(owner)}, ${lit(channel)}, ${lit(engine)}, ${lit(attribution)}::jsonb, ${daysAgo(age)}, ${daysAgo(Math.max(0, age - 3))}, ${daysAgo(age)} + interval '3 minutes 40 seconds', ${closed}, NULL, NULL);`;
    }),
  );
  if (demo) parts.push(
    ...SUBSCRIPTIONS.map(
      ([client, plan, mrr, status, age]) =>
        `INSERT INTO subscriptions (client, plan, mrr_cents, status, started_at, cancelled_at) VALUES (${lit(client)}, ${lit(plan)}, ${$(mrr)}, ${lit(status)}, ${daysAgo(age)}, ${status === "cancelled" ? daysAgo(10) : "NULL"});`,
    ),
  );
  if (demo) parts.push(rows("lead_reviews", ["name", "category", "contributors", "evidence", "classification", "score"], REVIEWS));
  parts.push(rows("suppression", ["value", "reason"], [["donotcontact@example.com", "Opted out"], ["competitor-co.com", "Competitor domain"]]));
  parts.push(rows("sequences", ["name", "touches", "enrolled", "status"], [["Outbound · agencies", 3, 18, "active"], ["Inbound nurture", 3, 31, "active"], ["Reactivation", 3, 9, "active"]]));
  parts.push(rows("catalog_items", ["category", "name", "description", "kind", "price_cents", "cost_cents", "price_min_cents", "price_max_cents"], CATALOG.map(([c, n, d, k, p, cost]) => [c, n, d, k, p === null ? null : $(p), $(cost), null, null])));
  for (const [cat, items] of Object.entries(MODULES)) {
    parts.push(rows("catalog_items", ["category", "name", "description", "kind", "price_cents", "cost_cents"], items.map(([n, d, cost]) => [cat, n, d, cat === "Add-ons" ? "addon" : "module", null, $(cost)])));
  }
  parts.push(rows("catalog_items", ["category", "name", "description", "kind", "price_cents", "cost_cents", "price_min_cents", "price_max_cents"], ENTERPRISE.map(([n, d, min, max]) => ["Enterprise builds", n, d, "enterprise", null, 0, $(min), $(max)])));
  parts.push(rows("developers", ["id", "label", "initials", "specialty", "slots"], DEVS));
  if (demo) parts.push(
    ...TICKETS.map(
      ([title, type, prio, stage, progress, dev, due]) =>
        `INSERT INTO tickets (title, project_type, priority, stage, progress, developer_id, due_date, requirements, delivered_at, created_at) VALUES (${lit(title)}, ${lit(type)}, ${lit(prio)}, ${lit(stage)}, ${progress}, ${lit(dev)}, (current_date + ${due}), 'Requirements approved in scoping call.', ${stage === "delivered" ? daysAgo(6) : "NULL"}, ${daysAgo(18)});`,
    ),
  );
  if (demo) parts.push(`UPDATE tickets SET cost_cents = (4000 + length(title) * 250) * 100, price_cents = round((4000 + length(title) * 250) * 100 * CASE WHEN title LIKE 'Webhook%' THEN 1.45 ELSE 2.4 END) WHERE stage <> 'scoping';`);
  parts.push(rows("templates", ["channel", "name", "summary", "body", "status"], TEMPLATES));
  parts.push(rows("routing_rules", ["name", "match", "destination", "sla_minutes", "status", "sort"], RULES));
  parts.push(rows("legal_templates", ["name", "summary", "body"], LEGAL.map(([n, s]) => [n, s, `${n.toUpperCase()}\n\nThis template is for attorney review before use.\n\n1. Parties. {{client_name}} ("Client") and CodeOpsAcq ("Provider").\n2. Purpose. ${s}\n3. Term. Effective {{effective_date}}.\n4. Governing law. {{jurisdiction}}.\n\nSigned: ____________________   Date: __________`])));
  if (demo) parts.push(rows("landing_pages", ["title", "path", "kind", "status"], [["Agency operating system", "/", "web", "published"], ["Pricing", "/pricing", "web", "published"], ["AI lead attribution", "/solutions/ai-lead-attribution", "web", "draft"], ["Profit calculator", "/solutions/agency-profit-calculator", "web", "draft"], ["Nurture: margin teardown", "email/margin-teardown", "email", "published"], ["Outbound: speed-to-lead", "email/speed-to-lead", "email", "published"], ["Reactivation", "email/reactivation", "email", "draft"]]));
  if (demo) parts.push(rows("manual_metrics", ["key", "grp", "label", "value", "target", "unit", "better"], MANUAL));
  if (demo) parts.push(
    `INSERT INTO wins (deal_id, title, amount_cents, closed_by, created_at) SELECT id, company || ' · ' || title, value_cents, owner_id, closed_at FROM deals WHERE stage = 'won' ON CONFLICT DO NOTHING;`,
  );
  if (demo) parts.push(
    rows("audit_log", ["source", "action", "detail"], [
      ["Lead ops", "Lead approved into Target", "Orbit Stack moved from review queue"],
      ["Fulfillment", "Software ticket assigned", "Client intake automation portal routed to Developer A"],
      ["Admin", "White-label account updated", "Tenant brand settings changed"],
      ["Outreach", "Sequence manually paused", "Three-touch outbound sequence held for review"],
    ]),
  );
  // Representative traffic for the attribution report (last 30 days).
  if (demo) parts.push(`INSERT INTO page_views (visitor_id, path, channel, ai_engine, source, at)
SELECT 'seed-' || g, (ARRAY['/','/pricing','/solutions/agency-crm','/book'])[1 + (g % 4)],
  (ARRAY['ai_assistant','organic_search','direct','referral','paid','social','ai_assistant','organic_search'])[1 + (g % 8)],
  CASE WHEN g % 8 IN (0,6) THEN (ARRAY['chatgpt','perplexity','claude','gemini','copilot'])[1 + (g % 5)] END,
  NULL, now() - (g % 30) * interval '1 day'
FROM generate_series(1, 1284) g;`);
  return parts.filter(Boolean).join("\n");
}
