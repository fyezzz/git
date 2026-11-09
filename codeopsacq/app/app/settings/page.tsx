import { ActionForm } from "@/components/app/actions-ui";
import { Badge, Card, Header } from "@/components/app/ui";
import { saveSettings } from "@/lib/actions";
import { getSettings } from "@/lib/data";

const INTEGRATIONS = [
  { name: "Postgres database", env: "DATABASE_URL", desc: "Durable workspace data (Supabase, Neon, RDS). Without it, development uses the embedded database." },
  { name: "Workspace password", env: "APP_PASSWORD", desc: "Protects /app. Required in production." },
  { name: "Anthropic (Claude)", env: "ANTHROPIC_API_KEY", desc: "Narrative synthesis in AI Command." },
  { name: "GitHub", env: "GITHUB_TOKEN", desc: "Higher rate limit for Lead ops intake. Public data only." },
  { name: "Discord", env: "DISCORD_WEBHOOK_URL", desc: "Post wins to a channel (not yet wired)." },
  { name: "Stripe", env: "STRIPE_SECRET_KEY", desc: "Invoice payment status (not yet wired)." },
];

export default async function Settings() {
  const s = await getSettings();
  const zones = Intl.supportedValuesOf("timeZone");
  return (
    <>
      <Header title="Settings & integrations" subtitle="Workspace preferences are saved. Integration status reflects the server's real configuration." what="Workspace setup" why="Control branding, locale, targets and connections." start="Set your timezone and targets." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Workspace">
          <ActionForm action={saveSettings} reset={false} className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="f-workspace_name">Workspace name</label><input id="f-workspace_name" className="input" name="workspace_name" defaultValue={s.workspace_name} required /></div>
            <div><label className="label" htmlFor="f-timezone">Timezone</label><select id="f-timezone" className="input" name="timezone" defaultValue={s.timezone}>{zones.map((z) => <option key={z}>{z}</option>)}</select></div>
            <div><label className="label" htmlFor="f-mrr_target">MRR target (USD)</label><input id="f-mrr_target" className="input" name="mrr_target" type="number" min="0" defaultValue={s.mrr_target_cents / 100} /></div>
            <div><label className="label" htmlFor="f-pipeline_target">Pipeline target (USD)</label><input id="f-pipeline_target" className="input" name="pipeline_target" type="number" min="0" defaultValue={s.pipeline_target_cents / 100} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="f-contact_email">Contact email</label><input id="f-contact_email" className="input" name="contact_email" type="email" defaultValue={s.contact_email} required /></div>
            <button className="btn btn-primary sm:col-span-2">Save settings</button>
          </ActionForm>
        </Card>
        <Card title="Integrations" subtitle="Set these as environment variables on your host. Values are never shown here.">
          <ul className="divide-y divide-line">{INTEGRATIONS.map((i) => {
            const on = !!process.env[i.env];
            return <li key={i.env} className="flex items-start justify-between gap-3 py-3 text-sm"><span><span className="font-medium">{i.name}</span><span className="block text-xs text-muted">{i.desc}</span><code className="text-[11px] text-cold">{i.env}</code></span><Badge tone={on ? "neon" : "muted"}>{on ? "Connected" : "Not configured"}</Badge></li>;
          })}</ul>
        </Card>
      </div>
    </>
  );
}
