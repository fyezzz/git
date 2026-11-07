import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { seedSql } from "./seed";

/**
 * One Postgres interface for every environment.
 * - DATABASE_URL set  → real Postgres (Supabase, Neon, RDS…) via `postgres`.
 * - DATABASE_URL unset → embedded Postgres (PGlite) persisted to ./.data, development only.
 */
type Params = unknown[];
interface Driver {
  query<T>(text: string, params: Params): Promise<T[]>;
  exec(text: string): Promise<void>;
}

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20 });
    return {
      query: async <T,>(text: string, params: Params) => (await sql.unsafe(text, params as never[])) as unknown as T[],
      exec: async (text) => void (await sql.unsafe(text)),
    };
  }
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_EMBEDDED_DB) {
    throw new Error("DATABASE_URL is not set. Set it to your Supabase Postgres connection string to run in production.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? join(process.cwd(), ".data", "pg");
  if (dir !== "memory") (await import("node:fs")).mkdirSync(dir, { recursive: true });
  const pg = await PGlite.create(dir === "memory" ? undefined : dir);
  return {
    query: async <T,>(text: string, params: Params) => (await pg.query<T>(text, params)).rows,
    exec: async (text) => void (await pg.exec(text)),
  };
}

const g = globalThis as unknown as { __codeops?: Promise<Driver> };

async function init(): Promise<Driver> {
  const d = await createDriver();
  await d.exec(readFileSync(join(process.cwd(), "lib", "schema.sql"), "utf8"));
  const [{ n }] = await d.query<{ n: number }>("SELECT count(*)::int AS n FROM settings", []);
  if (n === 0) await d.exec(seedSql());
  return d;
}

function driver(): Promise<Driver> {
  g.__codeops ??= init().catch((e) => {
    g.__codeops = undefined;
    throw e;
  });
  return g.__codeops;
}

export async function q<T = Record<string, unknown>>(text: string, params: Params = []): Promise<T[]> {
  return (await driver()).query<T>(text, params);
}

export async function one<T = Record<string, unknown>>(text: string, params: Params = []): Promise<T> {
  const rows = await q<T>(text, params);
  if (rows.length === 0) throw new Error(`Expected a row from: ${text.slice(0, 80)}`);
  return rows[0]!;
}

export async function audit(source: string, action: string, detail: string): Promise<void> {
  await q("INSERT INTO audit_log (source, action, detail) VALUES ($1, $2, $3)", [source, action, detail]);
}
