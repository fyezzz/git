"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Slot } from "@/lib/domain/booking";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });

export function BookingPicker({ leadId, onBooked }: { leadId: string; onBooked?: (slot: Slot) => void }) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [booked, setBooked] = useState<Slot | null>(null);

  useEffect(() => {
    fetch(`/api/slots?leadId=${leadId}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error((await r.json()).error))))
      .then((d: { slots: Slot[] }) => setSlots(d.slots))
      .catch((e: Error) => setError(e.message));
  }, [leadId]);

  async function book(slot: Slot) {
    setBusy(slot.start);
    setError(null);
    const res = await fetch("/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ leadId, ...slot }) });
    setBusy(null);
    if (!res.ok) {
      setError((await res.json()).error ?? "Booking failed");
      return;
    }
    setBooked(slot);
    onBooked?.(slot);
    router.refresh();
  }

  if (booked) return <p className="text-sm text-neon">✓ Booked {fmt(booked.start)} UTC. The rep has been notified.</p>;
  if (error) return <p role="alert" className="text-sm text-danger">{error}</p>;
  if (!slots) return <p className="animate-pulse text-sm text-muted">Loading open slots…</p>;
  if (slots.length === 0) return <p className="text-sm text-muted">No open slots in the next 7 days.</p>;
  return (
    <div>
      <p className="mb-3 text-xs text-muted">30-minute strategy call · times in UTC</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((s) => (
          <button key={s.start} type="button" disabled={busy !== null} onClick={() => book(s)} className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-left text-xs transition hover:border-neon hover:text-neon active:scale-[0.98] disabled:cursor-wait disabled:opacity-50">
            {busy === s.start ? "Booking…" : fmt(s.start)}
          </button>
        ))}
      </div>
    </div>
  );
}
