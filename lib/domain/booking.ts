import type { Booking } from "./types";

export const BOOKING_CONFIG = {
  slotMinutes: 30,
  dayStartHour: 9,
  dayEndHour: 17,
  workingDays: [1, 2, 3, 4, 5],
  minLeadMinutes: 60,
} as const;

export interface Slot {
  start: string;
  end: string;
}

/** Returns open slots (UTC) for the next `days` days, excluding overlaps with existing bookings for the rep. */
export function availableSlots(opts: { from: Date; days: number; bookings: Booking[]; repId: string; limit?: number }): Slot[] {
  const { from, days, bookings, repId, limit = 40 } = opts;
  const taken = bookings.filter((b) => b.repId === repId).map((b) => [Date.parse(b.start), Date.parse(b.end)] as const);
  const earliest = from.getTime() + BOOKING_CONFIG.minLeadMinutes * 60_000;
  const slotMs = BOOKING_CONFIG.slotMinutes * 60_000;
  const out: Slot[] = [];

  for (let d = 0; d <= days && out.length < limit; d++) {
    const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + d));
    if (!(BOOKING_CONFIG.workingDays as readonly number[]).includes(day.getUTCDay())) continue;
    for (let h = BOOKING_CONFIG.dayStartHour * 60; h < BOOKING_CONFIG.dayEndHour * 60 && out.length < limit; h += BOOKING_CONFIG.slotMinutes) {
      const start = day.getTime() + h * 60_000;
      const end = start + slotMs;
      if (start < earliest) continue;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      out.push({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    }
  }
  return out;
}

export function isSlotOpen(slot: Slot, bookings: Booking[], repId: string): boolean {
  const s = Date.parse(slot.start);
  const e = Date.parse(slot.end);
  if (Number.isNaN(s) || Number.isNaN(e) || e - s !== BOOKING_CONFIG.slotMinutes * 60_000) return false;
  return !bookings.some((b) => b.repId === repId && s < Date.parse(b.end) && e > Date.parse(b.start));
}
