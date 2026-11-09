import Link from "next/link";
import { ActionButton, ActionForm, Modal } from "@/components/app/actions-ui";
import { Badge, Card, Header, Stat } from "@/components/app/ui";
import { saveLandingPage, toggleLandingPage } from "@/lib/actions";
import { getDeals, getLandingPages } from "@/lib/data";
import { SITE, SOLUTIONS } from "@/lib/site";

export default async function Marketing() {
  const [pages, deals] = await Promise.all([getLandingPages(), getDeals()]);
  const web = pages.filter((p) => p.kind === "web");
  const email = pages.filter((p) => p.kind === "email");
  return (
    <>
      <Header title="Marketing control room" subtitle="Landing pages, email pages, SEO and AI-search visibility, with CRM handoff." what="Campaign workspace" why="Turn approved positioning into reviewed assets." start="Check AI visibility, then publish the next page."
        actions={<><Link href="/app/crm" className="btn btn-ghost">View CRM leads</Link><Modal trigger="+ New landing page" title="New landing page">{<ActionForm action={saveLandingPage} className="grid gap-3"><div><label className="label" htmlFor="f-title">Title</label><input id="f-title" className="input" name="title" required /></div><div><label className="label" htmlFor="f-path">Path</label><input id="f-path" className="input" name="path" required placeholder="/solutions/new-page or email/slug" /></div><div><label className="label" htmlFor="f-kind">Type</label><select id="f-kind" className="input" name="kind"><option value="web">Web</option><option value="email">Email</option></select></div><button className="btn btn-primary">Create</button></ActionForm>}</Modal></>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Landing pages" value={String(web.length)} sub={`${web.filter((p) => p.status === "published").length} published · ${web.filter((p) => p.status === "draft").length} drafts`} />
        <Stat label="Email pages" value={String(email.length)} sub="Nurture and outbound" />
        <Stat label="SEO solution pages" value={String(SOLUTIONS.length)} sub="Live with FAQ + JSON-LD" />
        <Stat label="CRM handoff" value={String(deals.length)} sub="Lead records on file" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Pages">
          <ul className="divide-y divide-line text-sm">{pages.map((p) => <li key={p.id} className="flex items-center justify-between gap-3 py-2.5"><span><span className="font-medium">{p.title}</span><span className="block font-mono text-xs text-muted">{p.path}</span></span><span className="flex items-center gap-2"><Badge tone={p.status === "published" ? "neon" : "muted"}>{p.status}</Badge><ActionButton action={toggleLandingPage.bind(null, p.id)}>{p.status === "published" ? "Unpublish" : "Publish"}</ActionButton></span></li>)}</ul>
        </Card>
        <Card title="SEO & AI-search visibility" subtitle="What search engines and LLMs read">
          <ul className="space-y-2 text-sm">
            {[["/sitemap.xml", "Sitemap with every public page"], ["/robots.txt", "Allows Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended and more; blocks /app"], ["/llms.txt", "LLM summary with facts, prices and links"], ["/llms-full.txt", "Full-text corpus for LLM ingestion"]].map(([u, d]) => (
              <li key={u} className="flex items-start justify-between gap-3 rounded-lg bg-panel-2 px-3 py-2"><span><a className="font-mono text-neon hover:underline" href={u} target="_blank">{u}</a><span className="block text-xs text-muted">{d}</span></span><Badge tone="neon">live</Badge></li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Structured data on every page: Organization, WebSite, SoftwareApplication with Offers, FAQPage and BreadcrumbList. Canonical base: {SITE.url}</p>
        </Card>
      </div>
    </>
  );
}
