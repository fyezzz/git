import { Bar, Header } from "@/components/app/ui";
import { getDevelopers } from "@/lib/data";

export default async function Team() {
  const devs = await getDevelopers();
  return (
    <>
      <Header title="Developer delivery team" subtitle="Seven specialists across application, AI, integrations, QA and delivery infrastructure." what="Pod capacity" why="Understand anonymized ownership and workload." start="Review capacity before committing delivery." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {devs.map((d) => (
          <article key={d.id} className="card p-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-panel-2 font-mono text-sm">{d.initials}</span><div><h2 className="font-semibold">{d.label}</h2><p className="text-xs text-muted">{d.specialty} · {d.active} active / {d.slots} slots</p></div></div>
            <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span className="text-muted">Capacity</span><span className={d.capacity >= 85 ? "text-danger" : d.capacity >= 70 ? "text-warm" : "text-neon"}>{d.capacity}%</span></div><Bar value={d.capacity} max={100} color={d.capacity >= 85 ? "bg-danger" : d.capacity >= 70 ? "bg-warm" : "bg-neon"} /></div>
          </article>
        ))}
      </div>
    </>
  );
}
