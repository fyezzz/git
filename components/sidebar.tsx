"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/conversations", label: "Conversations" },
  { href: "/agent", label: "AI Agent" },
  { href: "/automations", label: "Automations" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
];

export function Sidebar() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="sticky top-0 flex h-auto flex-col border-b border-line bg-ink md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid size-7 place-items-center rounded-md bg-neon font-mono text-sm font-bold text-ink">F</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold">FFO Revenue</div>
          <div className="text-[11px] text-muted">Infrastructure</div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
              active(n.href) ? "bg-neon-dim text-neon" : "text-muted hover:bg-panel hover:text-text"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden p-4 md:block">
        <Link href="/capture" className="block rounded-lg bg-neon px-3 py-2 text-center text-sm font-semibold text-ink transition hover:brightness-110 active:scale-[0.98]">
          Open lead form ↗
        </Link>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">In-memory store: data resets on restart. Postgres schema ready in prisma/.</p>
      </div>
    </aside>
  );
}
