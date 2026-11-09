import { InvoiceBuilder } from "./invoice";
import { ActionButton, ActionForm, Modal } from "@/components/app/actions-ui";
import { Badge, Card, Empty, Header } from "@/components/app/ui";
import { saveLegalTemplate, setInvoiceStatus } from "@/lib/actions";
import { getInvoices, getLegalTemplates, getSettings } from "@/lib/data";
import { usd } from "@/lib/format";

export default async function Legal() {
  const [docs, invoices, s] = await Promise.all([getLegalTemplates(), getInvoices(), getSettings()]);
  return (
    <>
      <Header title="Legal vault" subtitle="Edit contract templates and build invoices. Email actions open your mail app with a draft; nothing is sent automatically." what="Contracts and invoices" why="Prepare reviewable documents without pretending to send." start="Open a template or build an invoice."
        actions={<><Modal trigger="+ Add document" triggerClass="btn btn-ghost" title="New contract template">{<ActionForm action={saveLegalTemplate.bind(null, null)} className="grid gap-3"><div><label className="label" htmlFor="f-name">Name</label><input id="f-name" className="input" name="name" required /></div><div><label className="label" htmlFor="f-summary">Summary</label><input id="f-summary" className="input" name="summary" required /></div><div><label className="label" htmlFor="f-body">Body</label><textarea id="f-body" className="input font-mono text-xs" name="body" rows={12} required /></div><button className="btn btn-primary">Save</button></ActionForm>}</Modal><InvoiceBuilder /></>} />
      <p className="mb-6 rounded-xl border border-warm/30 bg-warm/5 p-4 text-sm text-warm">Templates are for attorney review before use. E-signature (DocuSign) is not connected; documents are prepared here and signed outside the app.</p>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`Contract templates · ${docs.length}`} className="xl:col-span-2">
          <ul className="grid gap-3 md:grid-cols-2">{docs.map((d) => (
            <li key={d.id} className="rounded-xl border border-line bg-panel-2 p-4">
              <p className="font-medium">{d.name}</p><p className="mt-1 text-xs text-muted">{d.summary}</p>
              <div className="mt-3 flex gap-2">
                <Modal trigger="Edit template" triggerClass="btn btn-ghost btn-sm" title={d.name}>{<ActionForm action={saveLegalTemplate.bind(null, d.id)} reset={false} className="grid gap-3"><input className="input" name="name" defaultValue={d.name} required /><input className="input" name="summary" defaultValue={d.summary} required /><textarea className="input font-mono text-xs" name="body" rows={16} defaultValue={d.body} required /><button className="btn btn-primary">Save</button></ActionForm>}</Modal>
                <a className="btn btn-ghost btn-sm" href={`mailto:?subject=${encodeURIComponent(d.name)}&body=${encodeURIComponent(d.body.slice(0, 1800))}`}>Email</a>
              </div>
            </li>
          ))}</ul>
        </Card>
        <Card title={`Invoices · ${invoices.length}`}>
          {invoices.length === 0 ? <Empty>No invoices yet. Use “Create invoice”.</Empty> : <ul className="space-y-3">{invoices.map((i) => (
            <li key={i.id} className="rounded-xl border border-line bg-panel-2 p-4 text-sm">
              <div className="flex justify-between"><span className="font-mono">{i.number}</span><Badge tone={i.status === "paid" ? "neon" : i.status === "sent" ? "cold" : "muted"}>{i.status}</Badge></div>
              <p className="mt-1 font-medium">{i.client}</p>
              <p className="text-xs text-muted">Due {i.due_date} · {i.items.length} lines</p>
              <p className="mt-2 font-mono text-lg">{usd(i.total_cents, { exact: true })}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {i.status === "draft" && <ActionButton action={setInvoiceStatus.bind(null, i.id, "sent")}>Mark sent</ActionButton>}
                {i.status !== "paid" && <ActionButton action={setInvoiceStatus.bind(null, i.id, "paid")} className="btn btn-primary btn-sm">Mark paid</ActionButton>}
                <a className="btn btn-ghost btn-sm" href={`mailto:${i.client_email ?? ""}?subject=${encodeURIComponent(`Invoice ${i.number} from ${s.workspace_name}`)}&body=${encodeURIComponent(`${i.items.map((l) => `${l.description}: ${l.qty} × $${(l.unit_cents / 100).toFixed(2)}`).join("\n")}\n\nTotal: ${usd(i.total_cents, { exact: true })}\nDue: ${i.due_date}\n\nQuestions? ${s.contact_email}`)}`}>Email draft</a>
              </div>
            </li>
          ))}</ul>}
        </Card>
      </div>
    </>
  );
}
