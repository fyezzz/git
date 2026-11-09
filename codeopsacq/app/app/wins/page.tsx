import { ActionForm } from "@/components/app/actions-ui";
import { Card, Empty, Header, Stat } from "@/components/app/ui";
import { logWin } from "@/lib/actions";
import { getMembers, getWins } from "@/lib/data";
import { ago, usd } from "@/lib/format";

export default async function Wins() {
  const [wins, members] = await Promise.all([getWins(), getMembers()]);
  const board = Object.values(wins.reduce<Record<string, { name: string; total: number; n: number }>>((a, w) => { const k = w.closed_by; a[k] ??= { name: w.closer_name ?? k, total: 0, n: 0 }; a[k].total += w.amount_cents; a[k].n++; return a; }, {})).sort((a, b) => b.total - a.total);
  return (
    <>
      <Header title="Wins" subtitle="One celebration stream for closed deals and milestones." what="Close loop" why="See how a Won move becomes a team event." start="Move a deal to Won in the CRM, or log a win here." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3"><Stat label="Logged wins" value={String(wins.length)} /><Stat label="Closed value" value={usd(wins.reduce((a, w) => a + w.amount_cents, 0))} /><Stat label="Top closer" value={board[0]?.name ?? "—"} sub={board[0] ? usd(board[0].total) : undefined} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Log a closed deal or milestone">
          <ActionForm action={logWin} className="grid gap-3">
            <div><label className="label" htmlFor="f-title">Deal / milestone</label><input id="f-title" className="input" name="title" required placeholder="Acme · Ops portal" /></div>
            <div><label className="label" htmlFor="f-amount">Amount (USD)</label><input id="f-amount" className="input" name="amount" type="number" min="0" step="100" required /></div>
            <div><label className="label" htmlFor="f-closed_by">Closed by</label><select id="f-closed_by" className="input" name="closed_by">{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <button className="btn btn-primary">Celebrate win 🎉</button>
          </ActionForm>
          <p className="mt-3 text-xs text-muted">Discord, Skool and Whop posting activates when those integrations are connected in Settings.</p>
        </Card>
        <Card title="Win stream" className="xl:col-span-2">
          {wins.length === 0 ? <Empty>No wins yet.</Empty> : <ul className="divide-y divide-line">{wins.map((w) => <li key={w.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span><span className="font-medium">{w.title}</span><span className="block text-xs text-muted">{w.closer_name ?? w.closed_by} · {ago(w.created_at)}</span></span><span className="font-mono text-neon">{usd(w.amount_cents)}</span></li>)}</ul>}
        </Card>
      </div>
      <Card title="Closer leaderboard" className="mt-6">
        {board.length === 0 ? <Empty>No leaderboard data yet.</Empty> : <ol className="space-y-2">{board.map((b, i) => <li key={b.name} className="flex justify-between rounded-lg bg-panel-2 px-4 py-2 text-sm"><span><span className="mr-3 font-mono text-muted">#{i + 1}</span>{b.name}</span><span className="font-mono">{usd(b.total)} · {b.n} wins</span></li>)}</ol>}
      </Card>
    </>
  );
}
