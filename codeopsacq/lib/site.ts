export const SITE = {
  name: "CodeOpsAcq",
  tagline: "The agency operating system",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://codeopsacq.com").replace(/\/$/, ""),
  description:
    "CodeOpsAcq is an agency operating system that connects lead evidence, a 6-stage CRM, unit economics, developer delivery and AI lead attribution in one workspace, so every deal has an owner, a stage and a priced scope.",
  metaDescription:
    "Agency operating system: 6-stage CRM, margin-checked pricing, developer delivery and AI lead attribution from ChatGPT, Perplexity and Claude.",
  alternateName: "CodeOps",
  disambiguation:
    "CodeOpsAcq (short name CodeOps) is agency operating software for running a digital agency. It is not the CodeOps software-development methodology associated with Crowdbotics.",
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
    "done-for-you agency builds",
    "AI automation agency",
  ],
  email: "hello@codeopsacq.com",
};

/** Done-for-you engagements, delivered by the pod. Same ladder as the CodeOpsAcq site. Final scope and price confirmed on a call. */
export const ENGAGEMENTS = [
  { name: "Foundation Sprint", scope: "AI voice reps, webhooks, data collection", investment: "$5,000 – $7,500", min: 5000, max: 7500, timeline: "3–14 days" },
  { name: "Growth Automation Engine", scope: "Outreach systems, CRM builds, ad infrastructure", investment: "$10,000 – $15,000", min: 10000, max: 15000, timeline: "7–14 days" },
  { name: "Custom Software", scope: "SaaS MVPs, internal tools, ERPs", investment: "$17,500 – $25,000", min: 17500, max: 25000, timeline: "14–25 days" },
  { name: "Acquisition Ecosystem", scope: "Full-funnel ads, SDR pods, omnichannel outbound", investment: "$27,500 – $35,000", min: 27500, max: 35000, timeline: "14–30 days", featured: true },
  { name: "Dedicated Squad", scope: "Enterprise AI builds with a dedicated developer team", investment: "$40,000+", min: 40000, max: null, timeline: "30–45 days" },
] as const;

/** Booking-form options: every engagement plus custom and undecided. */
export const PLAN_OPTIONS: [string, ...string[]] = [ENGAGEMENTS[0].name, ...ENGAGEMENTS.slice(1).map((e) => e.name), "Custom platform ($25k+)", "Not sure yet"];

export const PROTOCOL = ["Kickoff call to lock scope and acceptance criteria", "Active sprints with the seven-developer pod", "QA gates before anything ships", "Recorded handover walkthrough"];
export const INCLUDED = ["The CodeOpsAcq workspace: CRM, profit catalog, developer tickets, fulfillment", "AI lead attribution across ChatGPT, Perplexity, Claude and more", "AI Command with eight specialist analysts", "Audit history on every change"];

export const FAQ = [
  { q: "What is CodeOpsAcq?", a: "CodeOpsAcq is an agency operating system. It replaces the separate CRM, spreadsheet pricing, ticket tracker and reporting tools agencies stitch together, with one workspace that runs Evidence → Pipeline → Economics → Delivery → Control." },
  { q: "How does AI lead attribution work?", a: "Every visit is classified by UTM tags (ChatGPT adds utm_source=chatgpt.com to cited links), then by referrer host (chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com and more), then by the lead's own answer to “How did you hear about us?”. The self-reported answer recovers AI traffic that arrives with no referrer. First and last touch are stored on every CRM deal, so you can see leads, pipeline and won revenue by AI assistant." },
  { q: "Can I see how much pipeline ChatGPT or Perplexity sends me?", a: "Yes. The Attribution room shows visitors, leads, open pipeline and won revenue per channel and per AI engine, with the confidence of each attribution (UTM, referrer or self-reported)." },
  { q: "How much does CodeOpsAcq cost?", a: "CodeOpsAcq works as done-for-you engagements delivered by a seven-developer pod: Foundation Sprint $5,000–$7,500, Growth Automation Engine $10,000–$15,000, Custom Software $17,500–$25,000, Acquisition Ecosystem $27,500–$35,000, and Dedicated Squad from $40,000. Final scope and price are confirmed on a diagnosis call." },
  { q: "Does CodeOpsAcq send outreach automatically?", a: "No. Lead ops and outreach templates support human-reviewed execution. Nothing is sent without a person taking the action, and the suppression list is enforced on every lead." },
  { q: "Where do leads come from in Lead Ops?", a: "From the official GitHub REST API using public organization and repository data only. There is no private email discovery, LinkedIn scraping or Google scraping." },
  { q: "Does CodeOpsAcq guarantee revenue or booked calls?", a: "No. CodeOpsAcq guarantees defined platform access, structured activation and developer capacity terms. It does not guarantee lead volume, booked calls, close rates or revenue." },
];

export interface Solution {
  slug: string;
  keyword: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  points: { h: string; p: string }[];
  steps?: string[];
  forWho?: string[];
  compare?: [string, string, string][];
  faqs: { q: string; a: string }[];
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "ai-lead-attribution",
    keyword: "AI lead attribution",
    title: "AI Lead Attribution for ChatGPT & Perplexity",
    h1: "See exactly which AI assistant sent every lead",
    description: "Attribute leads, pipeline and revenue to ChatGPT, Perplexity, Claude, Gemini and Copilot with UTM, referrer and self-reported signals.",
    intro: "AI assistants now recommend vendors before anyone clicks a search result. Most analytics tools lump that traffic into “direct” or “referral”. CodeOpsAcq classifies every visit and every lead by AI engine, and carries that attribution through the CRM to won revenue.",
    points: [
      { h: "Three signals, ranked by confidence", p: "UTM tags first (ChatGPT appends utm_source=chatgpt.com), then the referrer host across 20+ AI domains, then the lead's own answer. Every deal stores which signal decided it." },
      { h: "Recover dark AI traffic", p: "Copied links, app webviews and voice assistants arrive with no referrer. The self-reported answer upgrades those “direct” leads to the AI engine they name, without overriding stronger signals." },
      { h: "Pipeline and revenue, not just clicks", p: "First and last touch ride on the CRM deal, so the attribution report shows leads, open pipeline and won value per engine, plus which landing pages AI assistants cite." },
      { h: "First-party and private", p: "A first-party beacon and cookies on your own domain. No third-party pixels, and bots and crawlers are excluded from counts." },
    ],
    steps: ["A first-party beacon records every page view on your own domain and classifies it: UTM tag first, then the referrer host, else direct.", "The first touch is stored for a year and the last touch per 30-minute session, in cookies on your domain.", "When a visitor books a call, the form asks how they heard about you; the answer is resolved against the measured touches.", "The lead lands in the CRM with channel, AI engine and confidence, and the Attribution room rolls it up into visitors, leads, pipeline and won revenue per engine."],
    forWho: ["Agencies whose prospects say \"ChatGPT recommended you\" but analytics shows direct traffic.", "Founders deciding whether to invest in AI-search visibility (GEO/AEO) and needing proof it pays.", "Marketing leads who report pipeline by channel and need AI assistants as their own line."],
    compare: [["AI traffic", "Mostly lumped into direct or referral", "Split by engine: ChatGPT, Perplexity, Claude, Gemini, Copilot and more"], ["Dark AI visits (no referrer)", "Lost", "Recovered from the lead's self-reported answer, flagged as self-reported"], ["Unit of measure", "Sessions and clicks", "Leads, open pipeline and won revenue per engine"], ["Data ownership", "Third-party pixels", "First-party beacon and cookies on your domain"]],
    faqs: [
      { q: "How do I track traffic from ChatGPT?", a: "ChatGPT adds utm_source=chatgpt.com to links it cites and often sends a chatgpt.com referrer. CodeOpsAcq detects both and labels the visit and any resulting lead as ChatGPT." },
      { q: "Why does AI traffic show up as direct in Google Analytics?", a: "Many AI apps open links without a referrer. Asking “How did you hear about us?” on the lead form and resolving the answer against measured signals recovers that traffic." },
      { q: "Which AI assistants are detected?", a: "ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot, Grok, Meta AI, DeepSeek, Mistral Le Chat, You.com, Phind, Poe and other assistants." },
    ],
  },
  {
    slug: "agency-crm",
    keyword: "CRM for agencies",
    title: "CRM for Agencies with Margins Built In",
    h1: "The agency CRM that knows your margin",
    description: "A 6-stage agency CRM with a Fridge queue, AI fit scores, suppression enforcement and a Won stage that posts wins, connected to pricing and developer delivery.",
    intro: "Generic CRMs stop at closed-won. Agencies lose money after that: in scope, in delivery and in handoff. CodeOpsAcq's pipeline is wired to the profit catalog and developer tickets, so a deal carries its margin into delivery.",
    points: [
      { h: "Six stages plus the Fridge", p: "Lead, Contacted, Qualified, Proposal, Won, Lost, and a Fridge queue for paused deals, so nothing sits in limbo." },
      { h: "Drag a deal to Won, get a win", p: "Moving a deal to Won logs a win, updates the leaderboard and records the event in the audit trail." },
      { h: "Every deal has an owner and next step", p: "The pipeline analyst flags deals with no next step or no stage change in five days, ranked by value." },
      { h: "Source on every record", p: "Channel and AI engine attribution sit on every deal, from the first visit." },
    ],
    steps: ["Leads arrive from the booking form, Lead ops approvals or manual capture, each with source attribution and an AI fit score.", "Drag deals through Lead, Contacted, Qualified, Proposal, Won, Lost or the Fridge; every move is written to the audit log.", "Price the scope in the profit catalog, then turn the cart into a developer ticket that keeps its price and cost.", "Moving a deal to Won posts a win and updates the closer leaderboard."],
    forWho: ["Agencies selling custom or productized work where margin varies by deal.", "Small teams that need one owner and one next step on every opportunity.", "Owners tired of re-keying won deals into a separate delivery tool."],
    compare: [["After closed-won", "Deal leaves the CRM", "Deal flows into priced tickets and delivery"], ["Margin", "Unknown until invoicing", "Modeled per item before the quote"], ["Stalled deals", "Found in a weekly review", "Flagged by the pipeline analyst after 5 days"], ["Opt-outs", "Separate list, easy to miss", "Suppression enforced on every capture path"]],
    faqs: [
      { q: "Is the CRM sold on its own?", a: "No. The CRM is part of the CodeOpsAcq workspace that every engagement runs on, so pipeline, pricing and delivery live in one place from day one." },
      { q: "Can I import my existing deals?", a: "Yes. The 30-day activation includes a revenue load phase that imports active contacts and opportunities with stage, owner, value and next action." },
    ],
  },
  {
    slug: "agency-profit-calculator",
    keyword: "agency profit calculator",
    title: "Agency Profit & Margin Calculator",
    h1: "Know the margin before you say yes",
    description: "Model client price, delivery cost, gross profit and blended margin for every agency deal, with 107 priced modules and a 40% margin guardrail.",
    intro: "Most agencies discover their margin when the invoice is paid. CodeOpsAcq's profit catalog puts the delivery cost of every module next to the client price, so you see gross profit and blended margin while you scope.",
    points: [
      { h: "107 priced catalog items", p: "SaaS plans, revenue leak fixes, voice AI, sales intelligence, dashboards, integrations, industry packs, custom software, compliance and add-ons." },
      { h: "Margin guardrails", p: "Deals under 40% margin are flagged. Negative margin blocks the quote until it's re-scoped." },
      { h: "Cart to ticket", p: "Turn a priced cart into a scoped developer ticket that keeps its price and cost, so delivery margin stays visible." },
    ],
    steps: ["Search 107 catalog items: SaaS plans, revenue-leak fixes, voice AI, dashboards, integrations, industry packs, custom software and add-ons.", "Each module starts at its delivery cost; set the client price and quantity.", "Gross profit and blended margin update live; under 40% turns amber, negative turns red.", "Create a scoped developer ticket from the cart with price and cost attached."],
    forWho: ["Agencies quoting custom builds and bundles.", "Operators who discover margin only after the invoice is paid.", "Sales teams that need guardrails before they discount."],
    compare: [["Where pricing lives", "Spreadsheets and old proposals", "One catalog with delivery cost on every line"], ["Margin check", "After the fact", "Live while you build the quote"], ["Hand-off to delivery", "Copy-paste into a ticket tool", "One click: cart becomes a priced ticket"], ["Guardrail", "None", "40% margin warning, negative margin blocked"]],
    faqs: [
      { q: "What is a good profit margin for a digital agency?", a: "Many agencies target 50–60% gross margin on delivery. CodeOpsAcq flags anything under 40% and reports blended margin across active work." },
      { q: "How do I calculate agency gross margin?", a: "Gross profit = client price − delivery cost. Margin = gross profit ÷ client price. CodeOpsAcq computes both per item, per deal and across all active tickets." },
    ],
  },
  {
    slug: "agency-project-delivery",
    keyword: "agency project management software",
    title: "Agency Delivery & Developer Ticketing",
    h1: "Ship client work through gates, not group chats",
    description: "Scoped developer tickets with priority, auto-routing to the least-loaded developer, QA gates, capacity tracking and on-time rate for agency delivery teams.",
    intro: "A sale is a promise to a small delivery team. CodeOpsAcq turns approved scope into tickets, routes them by capacity, and shows every gate from scoping to handoff.",
    points: [
      { h: "Auto-routing by capacity", p: "New tickets can route to the least-loaded developer based on active builds versus their slots." },
      { h: "Five delivery stages", p: "Scoping, requirements approved, in development, QA review, delivered. Delivered work records cycle time and on-time rate." },
      { h: "Capacity before commitment", p: "Ask AI Command “Do we have capacity for 3 new clients?” and get an answer from real open slots." },
    ],
    steps: ["Create a ticket from a priced cart or from scratch with requirements and priority.", "Route it automatically to the developer with the most open slots, or flag it for technical review.", "Advance it through scoping, requirements approved, in development, QA and delivered.", "Delivered work records cycle time and on-time rate; Fulfillment shows load across the pod."],
    forWho: ["Agencies with a small in-house or contract dev team.", "Owners who need to know if they can take on new clients this month.", "Teams that lose context between the sale and the build."],
    compare: [["Assignment", "Whoever is free on Slack", "Routed by measured capacity"], ["Visibility", "Status lives in people's heads", "Every gate visible in Fulfillment"], ["Capacity questions", "Guesswork", "Answered from open slots by AI Command"], ["Commercial context", "Lost after the sale", "Price and cost stay on the ticket"]],
    faqs: [{ q: "How do agencies track developer capacity?", a: "CodeOpsAcq counts active builds against each developer's slots and reports pod capacity, open slots and anyone above 85%." }],
  },
  {
    slug: "agency-lead-generation",
    keyword: "lead generation software for agencies",
    title: "Compliant Lead Generation for Agencies",
    h1: "Lead generation built on evidence, not scraping",
    description: "Public-source lead intake via the official GitHub API, human review with evidence vs hypothesis labels, suppression lists and three-touch human-sent sequences.",
    intro: "Scraped lists burn domains and trust. CodeOpsAcq Lead Ops pulls public organization signals through official APIs, labels each one as evidence or hypothesis, and puts a person between every lead and every message.",
    points: [
      { h: "Official API intake", p: "GitHub REST search for active organizations by topic. No private email discovery, LinkedIn scraping or Google scraping." },
      { h: "Review queue", p: "Approve moves a lead into the CRM; reject removes it. Hypotheses are flagged for verification." },
      { h: "Suppression everywhere", p: "Opt-outs and competitor domains are enforced on intake, manual entry and inbound forms." },
    ],
    steps: ["Run intake on a topic: the official GitHub API returns active organizations with public repositories.", "Each candidate gets a score and is labeled evidence (public signal) or hypothesis (inferred).", "A person approves or rejects every lead; approvals become CRM leads, rejections are recorded.", "Outreach uses human-sent three-touch templates, and the suppression list is enforced everywhere."],
    forWho: ["Agencies selling to software companies and technical teams.", "Teams that need compliant prospecting without scraped lists.", "Founders who want quality signals over volume."],
    compare: [["Source", "Scraped lists of unknown origin", "Official APIs and public data only"], ["Quality control", "Bulk import", "Human review with evidence vs hypothesis labels"], ["Sending", "Automated blasts", "Human-sent sequences"], ["Opt-outs", "Easy to miss", "Suppression checked on every path"]],
    faqs: [{ q: "Is automated outreach included?", a: "No. Sequences are human-reviewed and every send requires a person. That keeps you compliant and protects deliverability." }],
  },
  {
    slug: "ai-agents-for-agencies",
    keyword: "AI agents for agency operations",
    title: "AI Agents for Agency Operations",
    h1: "Eight AI specialists that read your real numbers",
    description: "Eight AI analysts (pipeline, forecast, leads, attribution, profit, delivery, outreach, billing) answer questions from your live agency data.",
    intro: "Ask “Which deals are at risk this week?” or “Where are we leaking profit?” The orchestrator activates only the agents the question needs. They compute findings from your workspace data, and Claude can synthesize a ranked action list.",
    points: [
      { h: "Grounded in your data", p: "Agents query the live pipeline, tickets, subscriptions, invoices and attribution. No invented numbers." },
      { h: "Routing, not a chatbot", p: "The orchestrator activates only the agents a mission needs and records every run." },
      { h: "Optional Claude synthesis", p: "With an Anthropic API key, findings become a ranked operator briefing tied to specific numbers." },
    ],
    steps: ["Type a question or pick a preset such as \"Which deals are at risk this week?\".", "The orchestrator routes it to only the agents it needs, out of eight specialists.", "Each agent queries live pipeline, ticket, invoice and attribution data and returns findings with severity.", "Optionally, Claude turns the findings into a ranked operator briefing; every run is saved."],
    forWho: ["Owners who want answers from their numbers without building reports.", "Ops leads running a weekly review.", "Teams that need capacity and margin checks before saying yes to work."],
    compare: [["Answers", "Generic chatbot replies", "Findings computed from your workspace data"], ["Scope", "One assistant for everything", "Eight specialists, routed per question"], ["Actions", "Can take uncontrolled actions", "Analyze and recommend; people act"], ["History", "Lost in chat", "Every mission stored and reviewable"]],
    faqs: [{ q: "Do the agents take actions on their own?", a: "No. They analyze and recommend. People move deals, approve leads and send messages." }],
  },
  {
    slug: "white-label-agency-software",
    keyword: "white-label agency software",
    title: "White-Label Agency Software & Custom Builds",
    h1: "Your brand on the platform. Our pod on the hard work.",
    description: "Run your agency on CodeOpsAcq and add a seven-developer pod for white-label platforms, AI infrastructure and custom software, scoped from $25k to $500k.",
    intro: "Software creates leverage; fulfillment creates the moat. When a client needs more than configuration, CodeOpsAcq's seven-developer pod scopes and ships custom builds through the same tickets, QA gates and handoff.",
    points: [
      { h: "Seven specialists", p: "Full-stack, payments and integrations, automation, AI systems, frontend, backend and data, QA and release." },
      { h: "Scoped before quoted", p: "Enterprise builds are scoped against delivery requirements and capacity before a price is set." },
      { h: "One delivery system", p: "Custom work runs through scope, acceptance criteria, QA and handoff, visible in Fulfillment." },
    ],
    steps: ["Run your agency on CodeOpsAcq for pipeline, pricing and delivery.", "When a client needs a custom platform, scope it in the catalog's enterprise builds.", "The seven-developer pod builds it through the same tickets, QA gates and handoff.", "Work is quoted only after scoping against delivery requirements and capacity."],
    forWho: ["Agencies whose clients ask for software, portals or AI systems.", "Builders launching an agency that needs delivery capacity on day one.", "Teams that want white-label platforms under their own brand."],
    compare: [["Who builds it", "Freelancers found per project", "A standing seven-developer pod"], ["Quoting", "Guess, then hope", "Scoped against requirements and capacity"], ["Process", "Varies per project", "Same tickets, QA gates and handoff every time"], ["Range", "Unclear", "Custom builds from $25k to $500k"]],
    faqs: [{ q: "How much does a custom build cost?", a: "Enterprise builds range from $25k to $500k depending on scope and are quoted only after scoping with the delivery pod." }],
  },
];
