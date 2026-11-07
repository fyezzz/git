import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authMode, SESSION_COOKIE, sessionToken, verifyPassword } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

async function login(fd: FormData) {
  "use server";
  const next = String(fd.get("next") || "/app");
  if (!verifyPassword(String(fd.get("password") ?? ""))) redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  (await cookies()).set(SESSION_COOKIE, sessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
  redirect(next.startsWith("/app") ? next : "/app");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  if (authMode() === "open") redirect("/app");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={login} className="card w-full max-w-sm p-6">
        <span className="grid size-10 place-items-center rounded-xl bg-neon font-mono font-bold text-ink">{"{}"}</span>
        <h1 className="mt-4 text-xl font-semibold">Sign in to CodeOpsAcq</h1>
        <input type="hidden" name="next" value={next ?? "/app"} />
        <label className="label mt-6" htmlFor="password">Workspace password</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="input" />
        {error && <p role="alert" className="mt-2 text-sm text-danger">Wrong password.</p>}
        {authMode() === "misconfigured" && <p className="mt-2 text-sm text-warm">APP_PASSWORD is not set on the server.</p>}
        <button className="btn btn-primary mt-5 w-full">Sign in</button>
      </form>
    </main>
  );
}
