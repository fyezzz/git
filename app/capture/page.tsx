import { CaptureForm } from "@/components/capture-form";

export const metadata = { title: "Book your Revenue Strategy Call · FFO" };

export default function CapturePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon">FFO Revenue Infrastructure</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Stop losing leads to slow follow-up.</h1>
      <p className="mt-3 text-muted">Tell us where revenue is leaking. You get an answer in seconds, and if it's a fit, you book a call on the spot.</p>
      <div className="mt-8"><CaptureForm /></div>
    </main>
  );
}
