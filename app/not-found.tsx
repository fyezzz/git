import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div><p className="font-mono text-neon">404</p><h1 className="mt-2 text-xl font-semibold">Not found</h1><Link href="/" className="mt-4 inline-block text-sm text-muted hover:text-neon">← Back to dashboard</Link></div>
    </main>
  );
}
