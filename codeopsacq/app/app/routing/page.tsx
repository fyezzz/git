import { ActionButton, ActionForm, Modal } from "@/components/app/actions-ui";
import { Badge, Card, Header } from "@/components/app/ui";
import { deleteRule, saveRule, toggleRule } from "@/lib/actions";
import { getRules } from "@/lib/data";

const sla = (m: number) => (m < 60 ? `${m} min` : `${m / 60} hour${m === 60 ? "" : "s"}`);

export default async function Routing() {
  const rules = await getRules();
  return (
    <>
      <Header title="Team routing" subtitle="Route work by expertise, capacity and escalation threshold." what="Assignment logic" why="Match work to skill, capacity and escalation rules." start="Inspect the route before changing ownership."
        actions={<Modal trigger="+ Add rule" title="Add routing rule">{(
          <ActionForm action={saveRule} className="grid gap-3" success="Rule added">
            <div><label className="label" htmlFor="f-name">Rule name</label><input id="f-name" className="input" name="name" required /></div>
            <div><label className="label" htmlFor="f-match">Match</label><input id="f-match" className="input" name="match" required placeholder="Integration · $10k+" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="f-destination">Destination</label><input id="f-destination" className="input" name="destination" required placeholder="Developer B" /></div><div><label className="label" htmlFor="f-sla_minutes">SLA (minutes)</label><input id="f-sla_minutes" className="input" name="sla_minutes" type="number" min={5} defaultValue={60} /></div></div>
            <button className="btn btn-primary">Add rule</button>
          </ActionForm>
        )}</Modal>} />
      <Card>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted"><tr><th className="pb-2">Rule</th><th>Match</th><th>Destination</th><th>SLA</th><th>Status</th><th /></tr></thead>
          <tbody className="divide-y divide-line">{rules.map((r) => (
            <tr key={r.id}><td className="py-3 font-medium">{r.name}</td><td className="text-muted">{r.match}</td><td>{r.destination}</td><td className="font-mono">{sla(r.sla_minutes)}</td><td><Badge tone={r.status === "active" ? "neon" : "warm"}>{r.status}</Badge></td>
              <td className="text-right"><div className="flex justify-end gap-2"><ActionButton action={toggleRule.bind(null, r.id)}>{r.status === "active" ? "Standby" : "Activate"}</ActionButton><ActionButton action={deleteRule.bind(null, r.id)} className="btn btn-danger btn-sm" confirm={`Delete rule "${r.name}"?`}>Delete</ActionButton></div></td></tr>
          ))}</tbody>
        </table></div>
      </Card>
    </>
  );
}
