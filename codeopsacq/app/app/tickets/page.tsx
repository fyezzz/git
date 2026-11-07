import { TicketControls } from "./controls";
import { ActionForm } from "@/components/app/actions-ui";
import { Badge, Bar, Card, Header } from "@/components/app/ui";
import { createTicket } from "@/lib/actions";
import { getDevelopers, getTickets } from "@/lib/data";
import { TICKET_STAGE_LABEL, TICKET_STAGES, usd } from "@/lib/format";

export default async function Tickets() {
  const [tickets, devs] = await Promise.all([getTickets(), getDevelopers()]);
  return (
    <>
      <Header title="Custom software tickets" subtitle="Turn scoped work into assigned, trackable developer delivery." what="Build intake" why="Convert approved scope into accountable work." start="Create a ticket with owner and stage, then advance it." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {tickets.map((t) => (
            <article key={t.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted">{t.code}</p>
                  <h2 className="mt-1 font-semibold">{t.title}</h2>
                  <p className="mt-1 text-xs text-muted">{t.project_type} · <span className={t.priority === "urgent" ? "text-danger" : t.priority === "high" ? "text-warm" : ""}>{t.priority} priority</span> · {t.developer_label ?? "Unassigned"}{t.due_date ? ` · due ${t.due_date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.price_cents > 0 && <Badge tone={(t.price_cents - t.cost_cents) / t.price_cents < 0.4 ? "warm" : "neon"}>{usd(t.price_cents)} · {Math.round(((t.price_cents - t.cost_cents) / t.price_cents) * 100)}% margin</Badge>}
                  <Badge tone={t.stage === "delivered" ? "neon" : t.stage === "qa" ? "cold" : "muted"}>{TICKET_STAGE_LABEL[t.stage]}</Badge>
                </div>
              </div>
              {t.requirements && <p className="mt-3 whitespace-pre-line text-sm text-muted">{t.requirements.slice(0, 280)}</p>}
              <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-muted"><span>Progress</span><span>{t.progress}%</span></div><Bar value={t.progress} max={100} /></div>
              <TicketControls id={t.id} stage={t.stage} progress={t.progress} developerId={t.developer_id} devs={devs.map((d) => ({ id: d.id, label: `${d.label} · ${d.specialty} (${d.capacity}%)` }))} />
            </article>
          ))}
        </div>
        <Card title="Ticket to dev" subtitle="Create a fulfillment brief" className="h-fit xl:sticky xl:top-20">
          <ActionForm action={createTicket} className="grid gap-3">
            <div><label className="label">Title</label><input className="input" name="title" required placeholder="Client intake portal" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Project type</label><select className="input" name="project_type">{["Web application", "AI automation", "Integration", "Internal tool", "Mobile experience", "Automation"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="label">Priority</label><select className="input" name="priority"><option value="standard">Standard</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            </div>
            <div><label className="label">Requirements</label><textarea className="input" name="requirements" rows={4} required placeholder="Acceptance criteria, integrations, handoff…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Assignment</label><select className="input" name="assignment"><option value="auto">Route to available dev</option><option value="unassigned">Unassigned</option><option value="review">Needs technical review</option></select></div>
              <div><label className="label">Stage</label><select className="input" name="stage">{TICKET_STAGES.slice(0, 3).map((s) => <option key={s} value={s}>{TICKET_STAGE_LABEL[s]}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Price $</label><input className="input" name="price" type="number" min="0" defaultValue="0" /></div>
              <div><label className="label">Cost $</label><input className="input" name="cost" type="number" min="0" defaultValue="0" /></div>
              <div><label className="label">Due</label><input className="input" name="due_date" type="date" /></div>
            </div>
            <button className="btn btn-primary">Create ticket</button>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
