import { ActionButton, ActionForm, CopyButton, Modal } from "@/components/app/actions-ui";
import { Badge, Header } from "@/components/app/ui";
import { deleteTemplate, saveTemplate } from "@/lib/actions";
import { getTemplates } from "@/lib/data";

type T = Awaited<ReturnType<typeof getTemplates>>[number];

function Form({ t }: { t?: T }) {
  return (
    <ActionForm action={saveTemplate.bind(null, t?.id ?? null)} className="grid gap-3" reset={!t} success="Template saved">
      <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="f-channel">Channel</label><input id="f-channel" className="input" name="channel" required defaultValue={t?.channel ?? "Cold email"} /></div><div><label className="label" htmlFor="f-status">Status</label><select id="f-status" className="input" name="status" defaultValue={t?.status ?? "draft"}><option value="active">Active</option><option value="draft">Draft</option></select></div></div>
      <div><label className="label" htmlFor="f-name">Name</label><input id="f-name" className="input" name="name" required defaultValue={t?.name} /></div>
      <div><label className="label" htmlFor="f-summary">Summary</label><input id="f-summary" className="input" name="summary" required defaultValue={t?.summary} /></div>
      <div><label className="label" htmlFor="f-body">Body · use {"{{first_name}}"}, {"{{company}}"}, {"{{signal}}"}</label><textarea id="f-body" className="input font-mono text-xs" name="body" rows={8} required defaultValue={t?.body} /></div>
      <button className="btn btn-primary">Save template</button>
    </ActionForm>
  );
}

export default async function Templates() {
  const templates = await getTemplates();
  return (
    <>
      <Header title="Outreach templates" subtitle="Reusable messaging blocks for compliant, human-reviewed sequences." what="Operating library" why="Reuse proven structure instead of rebuilding work." start="Copy the template that matches the current stage." actions={<Modal trigger="+ New template" title="New template">{<Form />}</Modal>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <article key={t.id} className="card flex flex-col p-5">
            <div className="flex items-center justify-between"><p className="kicker">{t.channel}</p><Badge tone={t.status === "active" ? "neon" : "muted"}>{t.status}</Badge></div>
            <h2 className="mt-3 font-semibold">{t.name}</h2>
            <p className="mt-1 text-sm text-muted">{t.summary}</p>
            <pre className="mt-3 flex-1 whitespace-pre-wrap rounded-lg bg-ink-2 p-3 font-mono text-xs text-muted">{t.body}</pre>
            <div className="mt-3 flex gap-2"><CopyButton text={t.body} /><Modal trigger="Edit" triggerClass="btn btn-ghost btn-sm" title={`Edit ${t.name}`}>{<Form t={t} />}</Modal><ActionButton action={deleteTemplate.bind(null, t.id)} className="btn btn-danger btn-sm ml-auto" confirm={`Delete "${t.name}"?`}>Delete</ActionButton></div>
          </article>
        ))}
      </div>
    </>
  );
}
