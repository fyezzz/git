import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Wordmark } from "@/components/logo";
import { Tracker } from "@/components/tracker";
import { PLANS, SITE, SOLUTIONS } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Tracker />
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url, email: SITE.email, description: SITE.description, logo: `${SITE.url}/icon.svg` },
          { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE.url}/#site`, name: SITE.name, url: SITE.url, publisher: { "@id": `${SITE.url}/#org` } },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE.name,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: SITE.description,
            url: SITE.url,
            publisher: { "@id": `${SITE.url}/#org` },
            offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "USD", url: `${SITE.url}/pricing`, priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "USD", billingDuration: "P1M", unitText: "MONTH" } })),
            featureList: ["6-stage agency CRM", "AI lead attribution (ChatGPT, Perplexity, Claude, Gemini, Copilot)", "Agency profit calculator and catalog", "Developer ticketing and capacity", "AI Command with 8 specialist agents", "Compliant GitHub lead intake", "Legal vault and invoices"],
          },
        ]}
      />
      <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold" aria-label={`${SITE.name} home`}>
            <Wordmark />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted md:flex">
            <Link href="/solutions/ai-lead-attribution" className="hover:text-text">AI attribution</Link>
            <Link href="/solutions/agency-crm" className="hover:text-text">CRM</Link>
            <Link href="/solutions/agency-profit-calculator" className="hover:text-text">Profit</Link>
            <Link href="/pricing" className="hover:text-text">Pricing</Link>
            <Link href="/faq" className="hover:text-text">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/app" className="btn btn-ghost btn-sm hidden sm:inline-flex">Sign in</Link>
            <Link href="/book" className="btn btn-primary btn-sm">Book a diagnosis</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm md:grid-cols-4 md:px-6">
          <div className="md:col-span-1">
            <p className="font-semibold">{SITE.name}</p>
            <p className="mt-2 text-muted">{SITE.tagline}. Lead evidence, CRM, margins, delivery and AI attribution in one workspace.</p>
          </div>
          <div>
            <p className="kicker mb-3">Solutions</p>
            <ul className="space-y-2 text-muted">{SOLUTIONS.map((s) => <li key={s.slug}><Link className="hover:text-neon" href={`/solutions/${s.slug}`}>{s.keyword}</Link></li>)}</ul>
          </div>
          <div>
            <p className="kicker mb-3">Company</p>
            <ul className="space-y-2 text-muted">
              <li><Link className="hover:text-neon" href="/pricing">Pricing</Link></li>
              <li><Link className="hover:text-neon" href="/faq">FAQ</Link></li>
              <li><Link className="hover:text-neon" href="/book">Book a diagnosis</Link></li>
              <li><a className="hover:text-neon" href="/llms.txt">llms.txt</a></li>
            </ul>
          </div>
          <div>
            <p className="kicker mb-3">Contact</p>
            <a className="text-muted hover:text-neon" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <p className="mt-4 text-xs text-muted">No guarantees of lead volume, booked calls or revenue. Outreach always requires human action.</p>
          </div>
        </div>
        <p className="pb-8 text-center font-mono text-xs text-muted">© {new Date().getFullYear()} {SITE.name}</p>
      </footer>
    </>
  );
}
