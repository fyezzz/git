import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { dbMissing, NeedsDb } from "@/components/needs-db";
import { Sidebar } from "@/components/app/sidebar";
import { ToastProvider } from "@/components/app/toast";
import { getSettings } from "@/lib/data";
import { authMode, currentRole, hasSession, ROLE_COOKIE, ROLES } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };

async function setRole(fd: FormData) {
  "use server";
  const role = String(fd.get("role"));
  if (!(ROLES as readonly string[]).includes(role)) return;
  (await cookies()).set(ROLE_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/app");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (authMode() === "misconfigured") {
    return <div className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-xl font-semibold">Workspace locked</h1><p className="mt-2 text-muted">Set the <code className="text-neon">APP_PASSWORD</code> environment variable on the server, then reload.</p></div></div>;
  }
  if (!(await hasSession())) redirect("/login?next=/app");
  if (dbMissing()) return <NeedsDb />;
  const [settings, role] = await Promise.all([getSettings(), currentRole()]);
  return (
    <ToastProvider>
      <div className="lg:flex">
        <Sidebar role={role} workspace={settings.workspace_name} setRole={setRole} />
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur md:px-8">
            <p className="text-sm text-muted"><span className="capitalize">{role}</span> view · {settings.timezone}</p>
            <div className="flex items-center gap-2">
              <Link href="/" className="btn btn-ghost btn-sm">Public site ↗</Link>
              <Link href="/app/ai-command" className="btn btn-primary btn-sm">Launch ops ↗</Link>
            </div>
          </div>
          <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
