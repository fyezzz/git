"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/app/toast";
import { runMissionAction } from "@/lib/actions";

export function MissionConsole({ presets, claude }: { presets: string[]; claude: boolean }) {
  const [m, setM] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const go = (mission: string) =>
    start(async () => {
      const r = await runMissionAction(mission);
      if (!r.ok) return toast("error", r.error);
      if (r.message) toast("error", r.message);
      router.push(`/app/ai-command?run=${r.runId}`);
    });
  return (
    <div className="card p-5">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); go(m); }}>
        <input className="input" value={m} onChange={(e) => setM(e.target.value)} placeholder="Ask the command center…" aria-label="Mission" />
        <button className="btn btn-primary" disabled={pending || m.trim().length < 4}>{pending ? "Routing…" : "Run mission"}</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">{presets.map((p) => <button key={p} type="button" disabled={pending} onClick={() => { setM(p); go(p); }} className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-neon hover:text-neon">{p}</button>)}</div>
      <p className="mt-3 text-xs text-muted">{claude ? "Claude synthesis is on." : "Agents run on your data. Add ANTHROPIC_API_KEY to also get a Claude-written briefing."}</p>
    </div>
  );
}
