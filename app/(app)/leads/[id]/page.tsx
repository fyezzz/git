import { notFound } from "next/navigation";
import { BookingPicker } from "@/components/booking-picker";
import { StageSelect } from "@/components/stage-select";
import { ago, Card, fmtDateTime, money, PageHeader, StageBadge, TierBadge } from "@/components/ui";
import { db, getLead, repName } from "@/lib/store";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();
  const q = lead.qualification;
  const messages = db.messages.filter((m) => m.leadId === id);
  const activity = db.activity.filter((e) => e.leadId === id);
  const booking = db.bookings.find((b) => b.leadId === id);
  return (
    <>
      <PageHeader title={lead.name} subtitle={`${lead.company ?? "No company"} · ${lead.email}${lead.phone ? ` · ${lead.phone}` : ""}`} action={<div className="flex items-center gap-3"><StageBadge stage={lead.stage} /><StageSelect leadId={lead.id} stage={lead.stage} /></div>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Qualification">
          <div className="flex items-center justify-between"><TierBadge tier={q.tier} /><span className="font-mono text-4xl font-semibold text-neon">{q.score}</span></div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(q.breakdown).map(([k, v]) => (<div key={k} className="rounded-lg bg-panel-2 p-2"><dt className="text-xs capitalize text-muted">{k}</dt><dd className="font-mono">{v}/25</dd></div>))}
          </dl>
          <ul className="mt-4 space-y-1 text-sm text-muted">{q.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
          <div className="mt-4 text-xs text-muted">Next action: <span className="text-text">{q.nextAction.replace("_", " ")}</span> · Owner: <span className="text-text">{repName(lead.ownerId)}</span> · Value: <span className="text-text">{money(lead.dealValue)}</span></div>
        </Card>
        <Card title="Conversation" className="lg:col-span-2">
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${m.direction === "outbound" ? "ml-auto border border-neon/30 bg-neon-dim" : "bg-panel-2"}`}>
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted">{m.author.replace("_", " ")} · {ago(m.sentAt)}</div>
                {m.body}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Booking" className="lg:col-span-2">
          {booking ? <p className="text-sm">Call booked with <span className="text-neon">{repName(booking.repId)}</span> on {fmtDateTime(booking.start)}.</p> : <BookingPicker leadId={lead.id} />}
        </Card>
        <Card title="Activity">
          <ol className="space-y-3 border-l border-line pl-4">
            {activity.map((e) => (<li key={e.id} className="text-sm"><div>{e.detail}</div><div className="text-xs text-muted">{ago(e.at)}</div></li>))}
          </ol>
        </Card>
      </div>
    </>
  );
}
