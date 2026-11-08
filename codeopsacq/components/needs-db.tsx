export const dbMissing = () => process.env.NODE_ENV === "production" && !process.env.DATABASE_URL && !process.env.ALLOW_EMBEDDED_DB;

export function NeedsDb() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-md p-6">
        <p className="kicker text-warm">Setup needed</p>
        <h1 className="mt-2 text-2xl font-semibold">Connect a database to open the workspace</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Vercel → this project → <b className="text-text">Storage</b> → <b className="text-text">Create Database</b> → <b className="text-text">Neon</b> (free) → connect.</li>
          <li>That adds <code className="text-neon">DATABASE_URL</code>. Redeploy.</li>
        </ol>
        <p className="mt-4 text-xs text-muted">Tables and the starter catalog are created on first use. No demo data in production.</p>
      </div>
    </main>
  );
}
