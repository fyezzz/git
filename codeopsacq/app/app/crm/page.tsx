import { Board } from "./board";
import { Header } from "@/components/app/ui";
import { getDeals, getMembers } from "@/lib/data";

export default async function Crm() {
  const [deals, members] = await Promise.all([getDeals(), getMembers()]);
  const enriched = deals.filter((d) => d.ai_score > 0 && d.signal).length;
  return (
    <>
      <Header title="AI lead-gen CRM" subtitle="Drag cards between stages. AI score, source and next step travel with every lead." what="Revenue workflow" why="Move opportunities from intake to a decision." start="Drag a card; Won posts a win." />
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted"><span>Total opportunities: <b className="text-text">{deals.length}</b></span><span>Enriched: <b className="text-text">{enriched} / {deals.length}</b></span><span>High fit (80+): <b className="text-text">{deals.filter((d) => d.ai_score >= 80).length}</b></span></div>
      <Board deals={deals} members={members} />
    </>
  );
}
