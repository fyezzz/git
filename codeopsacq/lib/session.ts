import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cops_session";
export const ROLE_COOKIE = "cops_role";
export const ROLES = ["employee", "developer", "client"] as const;
export type Role = (typeof ROLES)[number];

/** In development with no APP_PASSWORD, the workspace is open. In production a password is mandatory. */
export function authMode(): "open" | "password" | "misconfigured" {
  if (process.env.APP_PASSWORD) return "password";
  return process.env.NODE_ENV === "production" ? "misconfigured" : "open";
}

const sign = (v: string) => createHmac("sha256", process.env.APP_PASSWORD ?? "dev").update(v).digest("hex");
export const sessionToken = () => `v1.${sign("codeopsacq-session")}`;

export function verifyPassword(input: string): boolean {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(sign(input));
  const b = Buffer.from(sign(pw));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hasSession(): Promise<boolean> {
  const mode = authMode();
  if (mode === "open") return true;
  if (mode === "misconfigured") return false;
  const c = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!c) return false;
  const a = Buffer.from(c);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireSession(): Promise<void> {
  if (!(await hasSession())) throw new Error(authMode() === "misconfigured" ? "APP_PASSWORD is not set on the server." : "Your session expired. Sign in again.");
}

export async function currentRole(): Promise<Role> {
  const r = (await cookies()).get(ROLE_COOKIE)?.value;
  return (ROLES as readonly string[]).includes(r ?? "") ? (r as Role) : "employee";
}
