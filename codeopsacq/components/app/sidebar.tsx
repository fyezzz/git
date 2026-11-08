"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";
import type { Role } from "@/lib/session";

export const NAV: { group: string; items: { href: string; label: string; roles?: Role[] }[] }[] = [
  { group: "Command", items: [
    { href: "/app", label: "Dashboard" },
    { href: "/app/metrics", label: "Metrics & KPIs" },
    { href: "/app/investor", label: "Investor view" },
    { href: "/app/crm", label: "AI lead-gen CRM", roles: ["employee"] },
    { href: "/app/lead-ops", label: "Lead ops", roles: ["employee"] },
  ] },
  { group: "Revenue", items: [
    { href: "/app/attribution", label: "AI attribution", roles: ["employee"] },
    { href: "/app/marketing", label: "Marketing", roles: ["employee"] },
    { href: "/app/catalog", label: "Catalog & profit", roles: ["employee", "client"] },
    { href: "/app/tickets", label: "Software tickets" },
    { href: "/app/fulfillment", label: "Fulfillment" },
  ] },
  { group: "Operations", items: [
    { href: "/app/templates", label: "Outreach templates", roles: ["employee"] },
    { href: "/app/routing", label: "Team routing", roles: ["employee", "developer"] },
    { href: "/app/team", label: "7-developer team" },
    { href: "/app/ai-command", label: "AI command", roles: ["employee", "developer"] },
    { href: "/app/legal", label: "Legal & invoices", roles: ["employee", "client"] },
    { href: "/app/wins", label: "Wins" },
    { href: "/app/audit", label: "Audit history", roles: ["employee"] },
  ] },
  { group: "Administration", items: [
    { href: "/app/docs", label: "Docs & architecture" },
    { href: "/app/settings", label: "Settings", roles: ["employee"] },
  ] },
];

export function Sidebar({ role, workspace, setRole }: { role: Role; workspace: string; setRole: (fd: FormData) => Promise<void> }) {
  const path = usePathname();
  return (
    <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/app" className="flex items-center gap-2 font-semibold">
          <LogoMark size={30} />
          <span className="leading-tight"><span className="block text-sm">{workspace}</span><span className="flex items-center gap-1 text-[11px] font-normal text-muted"><span className="size-1.5 rounded-full bg-neon" /> Live workspace</span></span>
        </Link>
      </div>
      <nav aria-label="Workspace" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-5 lg:overflow-visible">
        {NAV.map((g) => {
          const items = g.items.filter((i) => !i.roles || i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={g.group} className="contents lg:block">
              <p className="kicker hidden px-3 pb-1 text-[10px] lg:block">{g.group}</p>
              {items.map((i) => {
                const active = i.href === "/app" ? path === "/app" : path.startsWith(i.href);
                return (
                  <Link key={i.href} href={i.href} className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${active ? "bg-neon-dim text-neon" : "text-muted hover:bg-panel hover:text-text"}`}>
                    {i.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <form action={setRole} className="hidden border-t border-line p-4 lg:block">
        <label className="label" htmlFor="role">Role view</label>
        <div className="flex gap-2">
          <select id="role" name="role" defaultValue={role} className="input py-1.5">
            <option value="employee">Employee</option>
            <option value="developer">Developer</option>
            <option value="client">Client</option>
          </select>
          <button className="btn btn-ghost btn-sm">Apply</button>
        </div>
      </form>
    </aside>
  );
}
