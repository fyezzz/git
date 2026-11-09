/**
 * Phase 0 shell. The public landing page is built in Phase 11 (Part 12);
 * until then this page states what the product is and nothing more.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">CodeOpsAcq</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">The operating system for agencies.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Acquire clients, deliver the work, run the team and the money, and prove it with data.
      </p>
    </main>
  );
}
