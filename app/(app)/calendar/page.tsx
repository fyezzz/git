import Link from "next/link";
import { Card, fmtDateTime, PageHeader } from "@/components/ui";
import { BOOKING_CONFIG } from "@/lib/domain/booking";
import { db, getLead, repName } from "@/lib/store";

export default function CalendarPage() {
  const upcoming = [...db.bookings].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <>
      <PageHeader title="Calendar" subtitle={`${BOOKING_CONFIG.slotMinutes}-min calls · ${BOOKING_CONFIG.dayStartHour}:00–${BOOKING_CONFIG.dayEndHour}:00 UTC · Mon–Fri · ${BOOKING_CONFIG.minLeadMinutes}-min notice`} />
      <div className="grid gap-6 md:grid-cols-2">
        {db.reps.map((rep) => {
          const mine = upcoming.filter((b) => b.repId === rep.id);
          return (
            <Card key={rep.id} title={`${rep.name} · ${mine.length} booked`}>
              <ul className="space-y-2">
                {mine.map((b) => {
                  const lead = getLead(b.leadId);
                  return (
                    <li key={b.id} className="flex items-center justify-between rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm">
                      <span className="font-mono text-neon">{fmtDateTime(b.start)}</span>
                      {lead && <Link href={`/leads/${lead.id}`} className="hover:text-neon">{lead.name}</Link>}
                    </li>
                  );
                })}
                {mine.length === 0 && <li className="text-sm text-muted">No calls booked.</li>}
              </ul>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">Owner of each booking: {upcoming.length ? upcoming.map((b) => repName(b.repId)).join(", ") : "none yet"}. Calendar sync (Google/Outlook) is not connected.</p>
    </>
  );
}
