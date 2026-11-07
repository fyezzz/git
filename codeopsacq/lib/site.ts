export const SITE = {
  name: "CodeOpsAcq",
  tagline: "The agency operating system",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://codeopsacq.com").replace(/\/$/, ""),
  description:
    "CodeOpsAcq is an agency operating system that connects lead evidence, a 6-stage CRM, unit economics, developer delivery and AI lead attribution in one workspace, so every deal has an owner, a stage and a priced scope.",
  keywords: [
    "agency operating system",
    "agency management software",
    "CRM for agencies",
    "agency CRM",
    "AI lead attribution",
    "track leads from ChatGPT",
    "ChatGPT referral traffic",
    "AI search attribution",
    "agency profit calculator",
    "agency margin calculator",
    "agency project management software",
    "developer ticketing for agencies",
    "white-label agency software",
    "lead generation software for agencies",
    "AI agents for agency operations",
    "agency incubator",
  ],
  email: "hello@codeopsacq.com",
};

export const PLANS = [
  { name: "Starter", price: 99, annual: 1188, track: "Track A · Operators", for: "Solo operators and compact agencies who need one source of truth.", features: ["6-stage CRM + Fridge queue", "Contact context & evidence", "Profit catalog & cart", "Developer ticket flow", "AI lead attribution"] },
  { name: "Growth", price: 299, annual: 3588, track: "Track A · Operators", for: "Growing agencies with team members, contractors and multiple workstreams.", features: ["Everything in Starter", "AI Command Orchestrator (8 specialists)", "Lead Ops review queue + outreach templates", "Team routing & fulfillment visibility", "Marketing control room", "Legal vault + invoices"], featured: true },
  { name: "Scale Flagship", price: 999, annual: 11988, track: "Track B · Incubator builders", for: "Accepted builders launching an agency on CodeOpsAcq. Application only, gated by real developer capacity.", features: ["Full platform access", "Structured 30-day activation", "Finite 7-developer team build capacity", "Incubator coaching & review schedule", "Rev share: 50% of first eligible collected sale, 20% thereafter, per signed addendum"] },
] as const;

export const FAQ = [
  { q: "What is CodeOpsAcq?", a: "CodeOpsAcq is an agency operating system. It replaces the separate CRM, spreadsheet pricing, ticket tracker and reporting tools agencies stitch together, with one workspace that runs Evidence → Pipeline → Economics → Delivery → Control." },
  { q: "How does AI lead attribution work?", a: "Every visit is classified by UTM tags (ChatGPT adds utm_source=chatgpt.com to cited links), then by referrer host (chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com and more), then by the lead's own answer to “How did you hear about us?”. The self-reported answer recovers AI traffic that arrives with no referrer. First and last touch are stored on every CRM deal, so you can see leads, pipeline and won revenue by AI assistant." },
  { q: "Can I see how much pipeline ChatGPT or Perplexity sends me?", a: "Yes. The Attribution room shows visitors, leads, open pipeline and won revenue per channel and per AI engine, with the confidence of each attribution (UTM, referrer or self-reported)." },
  { q: "How much does CodeOpsAcq cost?", a: "Starter is $99/month ($1,188/year), Growth is $299/month ($3,588/year), and Scale Flagship is $999/month ($11,988/year) plus revenue share, application only. Custom builds are scoped separately from $25k to $500k." },
  { q: "Does CodeOpsAcq send outreach automatically?", a: "No. Lead ops and outreach templates support human-reviewed execution. Nothing is sent without a person taking the action, and the suppression list is enforced on every lead." },
  { q: "Where do leads come from in Lead Ops?", a: "From the official GitHub REST API using public organization and repository data only. There is no private email discovery, LinkedIn scraping or Google scraping." },
  { q: "Does CodeOpsAcq guarantee revenue or booked calls?", a: "No. CodeOpsAcq guarantees defined platform access, structured activation and developer capacity terms. It does not guarantee lead volume, booked calls, close rates or revenue." },
  { q: "Who is the Scale Flagship incubator for?", a: "Builders launching an agency on CodeOpsAcq. It includes full platform access, a 30-day activation, finite capacity from a seven-developer pod and coaching. Revenue share is 50% of the first eligible collected sale and 20% thereafter, governed by a signed addendum." },
];

export interface Solution {
  slug: string;
  keyword: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  points: { h: string; p: string }[];
  faqs: { q: string; a: string }[];
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "ai-lead-attribution",
    keyword: "AI lead attribution",
    title: "AI Lead Attribution: Track Leads from ChatGPT, Perplexity & Claude",
    h1: "See exactly which AI assistant sent every lead",
    description: "Attribute leads, pipeline and revenue to ChatGPT, Perplexity, Claude, Gemini and Copilot. UTM, referrer and self-reported signals recover AI traffic analytics tools miss.",
    intro: "AI assistants now recommend vendors before anyone clicks a search result. Most analytics tools lump that traffic into “direct” or “referral”. CodeOpsAcq classifies every visit and every lead by AI engine, and carries that attribution through the CRM to won revenue.",
    points: [
      { h: "Three signals, ranked by confidence", p: "UTM tags first (ChatGPT appends utm_source=chatgpt.com), then the referrer host across 20+ AI domains, then the lead's own answer. Every deal stores which signal decided it." },
      { h: "Recover dark AI traffic", p: "Copied links, app webviews and voice assistants arrive with no referrer. The self-reported answer upgrades those “direct” leads to the AI engine they name, without overriding stronger signals." },
      { h: "Pipeline and revenue, not just clicks", p: "First and last touch ride on the CRM deal, so the attribution report shows leads, open pipeline and won value per engine, plus which landing pages AI assistants cite." },
      { h: "First-party and private", p: "A first-party beacon and cookies on your own domain. No third-party pixels, and bots and crawlers are excluded from counts." },
    ],
    faqs: [
      { q: "How do I track traffic from ChatGPT?", a: "ChatGPT adds utm_source=chatgpt.com to links it cites and often sends a chatgpt.com referrer. CodeOpsAcq detects both and labels the visit and any resulting lead as ChatGPT." },
      { q: "Why does AI traffic show up as direct in Google Analytics?", a: "Many AI apps open links without a referrer. Asking “How did you hear about us?” on the lead form and resolving the answer against measured signals recovers that traffic." },
      { q: "Which AI assistants are detected?", a: "ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot, Grok, Meta AI, DeepSeek, Mistral Le Chat, You.com, Phind, Poe and other assistants." },
    ],
  },
  {
    slug: "agency-crm",
    keyword: "CRM for agencies",
    title: "CRM for Agencies with Pricing, Delivery & AI Attribution Built In",
    h1: "The agency CRM that knows your margin",
    description: "A 6-stage agency CRM with a Fridge queue, AI fit scores, suppression enforcement and a Won stage that posts wins, connected to pricing and developer delivery.",
    intro: "Generic CRMs stop at closed-won. Agencies lose money after that: in scope, in delivery and in handoff. CodeOpsAcq's pipeline is wired to the profit catalog and developer tickets, so a deal carries its margin into delivery.",
    points: [
      { h: "Six stages plus the Fridge", p: "Lead, Contacted, Qualified, Proposal, Won, Lost, and a Fridge queue for paused deals, so nothing sits in limbo." },
      { h: "Drag a deal to Won, get a win", p: "Moving a deal to Won logs a win, updates the leaderboard and records the event in the audit trail." },
      { h: "Every deal has an owner and next step", p: "The pipeline analyst flags deals with no next step or no stage change in five days, ranked by value." },
      { h: "Source on every record", p: "Channel and AI engine attribution sit on every deal, from the first visit." },
    ],
    faqs: [
      { q: "What is the best CRM for a small agency?", a: "One that connects sales to delivery. CodeOpsAcq Starter ($99/month) includes the 6-stage CRM, profit catalog and developer tickets in one workspace." },
      { q: "Can I import my existing deals?", a: "Yes. The 30-day activation includes a revenue load phase that imports active contacts and opportunities with stage, owner, value and next action." },
    ],
  },
  {
    slug: "agency-profit-calculator",
    keyword: "agency profit calculator",
    title: "Agency Profit & Margin Calculator: Price Before You Scope",
    h1: "Know the margin before you say yes",
    description: "Model client price, delivery cost, gross profit and blended margin for every agency deal. The CodeOpsAcq profit catalog prices 100+ modules and add-ons before work is promised.",
    intro: "Most agencies discover their margin when the invoice is paid. CodeOpsAcq's profit catalog puts the delivery cost of every module next to the client price, so you see gross profit and blended margin while you scope.",
    points: [
      { h: "107 priced catalog items", p: "SaaS plans, revenue leak fixes, voice AI, sales intelligence, dashboards, integrations, industry packs, custom software, compliance and add-ons." },
      { h: "Margin guardrails", p: "Deals under 40% margin are flagged. Negative margin blocks the quote until it's re-scoped." },
      { h: "Cart to ticket", p: "Turn a priced cart into a scoped developer ticket that keeps its price and cost, so delivery margin stays visible." },
    ],
    faqs: [
      { q: "What is a good profit margin for a digital agency?", a: "Many agencies target 50–60% gross margin on delivery. CodeOpsAcq flags anything under 40% and reports blended margin across active work." },
      { q: "How do I calculate agency gross margin?", a: "Gross profit = client price − delivery cost. Margin = gross profit ÷ client price. CodeOpsAcq computes both per item, per deal and across all active tickets." },
    ],
  },
  {
    slug: "agency-project-delivery",
    keyword: "agency project management software",
    title: "Agency Delivery Software: Developer Tickets, QA Gates & Capacity",
    h1: "Ship client work through gates, not group chats",
    description: "Scoped developer tickets with priority, auto-routing to the least-loaded developer, QA gates, capacity tracking and on-time rate for agency delivery teams.",
    intro: "A sale is a promise to a small delivery team. CodeOpsAcq turns approved scope into tickets, routes them by capacity, and shows every gate from scoping to handoff.",
    points: [
      { h: "Auto-routing by capacity", p: "New tickets can route to the least-loaded developer based on active builds versus their slots." },
      { h: "Five delivery stages", p: "Scoping, requirements approved, in development, QA review, delivered. Delivered work records cycle time and on-time rate." },
      { h: "Capacity before commitment", p: "Ask AI Command “Do we have capacity for 3 new clients?” and get an answer from real open slots." },
    ],
    faqs: [{ q: "How do agencies track developer capacity?", a: "CodeOpsAcq counts active builds against each developer's slots and reports pod capacity, open slots and anyone above 85%." }],
  },
  {
    slug: "agency-lead-generation",
    keyword: "lead generation software for agencies",
    title: "Compliant Lead Generation for Agencies: Evidence-Based Lead Ops",
    h1: "Lead generation built on evidence, not scraping",
    description: "Public-source lead intake via the official GitHub API, human review with evidence vs hypothesis labels, suppression lists and three-touch human-sent sequences.",
    intro: "Scraped lists burn domains and trust. CodeOpsAcq Lead Ops pulls public organization signals through official APIs, labels each one as evidence or hypothesis, and puts a person between every lead and every message.",
    points: [
      { h: "Official API intake", p: "GitHub REST search for active organizations by topic. No private email discovery, LinkedIn scraping or Google scraping." },
      { h: "Review queue", p: "Approve moves a lead into the CRM; reject removes it. Hypotheses are flagged for verification." },
      { h: "Suppression everywhere", p: "Opt-outs and competitor domains are enforced on intake, manual entry and inbound forms." },
    ],
    faqs: [{ q: "Is automated outreach included?", a: "No. Sequences are human-reviewed and every send requires a person. That keeps you compliant and protects deliverability." }],
  },
  {
    slug: "ai-agents-for-agencies",
    keyword: "AI agents for agency operations",
    title: "AI Agents for Agency Operations: Pipeline, Profit & Delivery Analysts",
    h1: "Eight AI specialists that read your real numbers",
    description: "An orchestrator routes each question to the right agents (pipeline, forecast, lead quality, attribution, profit, delivery, outreach, billing) and returns findings from your live data.",
    intro: "Ask “Which deals are at risk this week?” or “Where are we leaking profit?” The orchestrator activates only the agents the question needs. They compute findings from your workspace data, and Claude can synthesize a ranked action list.",
    points: [
      { h: "Grounded in your data", p: "Agents query the live pipeline, tickets, subscriptions, invoices and attribution. No invented numbers." },
      { h: "Routing, not a chatbot", p: "The orchestrator activates only the agents a mission needs and records every run." },
      { h: "Optional Claude synthesis", p: "With an Anthropic API key, findings become a ranked operator briefing tied to specific numbers." },
    ],
    faqs: [{ q: "Do the agents take actions on their own?", a: "No. They analyze and recommend. People move deals, approve leads and send messages." }],
  },
  {
    slug: "white-label-agency-software",
    keyword: "white-label agency software",
    title: "White-Label Agency Software & Custom Builds ($25k–$500k)",
    h1: "Your brand on the platform. Our pod on the hard work.",
    description: "Run your agency on CodeOpsAcq and add a seven-developer pod for white-label platforms, AI infrastructure and custom software, scoped from $25k to $500k.",
    intro: "Software creates leverage; fulfillment creates the moat. When a client needs more than configuration, CodeOpsAcq's seven-developer pod scopes and ships custom builds through the same tickets, QA gates and handoff.",
    points: [
      { h: "Seven specialists", p: "Full-stack, payments and integrations, automation, AI systems, frontend, backend and data, QA and release." },
      { h: "Scoped before quoted", p: "Enterprise builds are scoped against delivery requirements and capacity before a price is set." },
      { h: "One delivery system", p: "Custom work runs through scope, acceptance criteria, QA and handoff, visible in Fulfillment." },
    ],
    faqs: [{ q: "How much does a custom build cost?", a: "Enterprise builds range from $25k to $500k depending on scope and are quoted only after scoping with the delivery pod." }],
  },
];
