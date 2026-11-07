import Link from "next/link";
import { ago, Card, PageHeader, TierBadge } from "@/components/ui";
import { db } from "@/lib/store";

export default function ConversationsPage() {
  const threads = db.leads.map((l) => {
    const msgs = db.messages.filter((m) => m.leadId === l.id);
    return { lead: l, last: msgs[msgs.length - 1], count: msgs.length };
  });
  return (
    <>
      <PageHeader title="Conversations" subtitle="Every lead gets an instant reply from the AI agent. Open a thread for the full history." />
      <Card>
        <ul className="divide-y divide-line">
          {threads.map(({ lead, last, count }) => (
            <li key={lead.id}>
              <Link href={`/leads/${lead.id}`} className="flex items-start justify-between gap-4 py-4 hover:text-neon">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{lead.name} <span className="text-xs text-muted">· {count} messages</span></div>
                  {last && <p className="mt-1 line-clamp-2 text-sm text-muted"><span className="text-text">{last.author.replace("_", " ")}:</span> {last.body}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1"><TierBadge tier={lead.qualification.tier} />{last && <span className="text-xs text-muted">{ago(last.sentAt)}</span>}</div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
