export interface BookingReminderTrip {
  id: string;
  destination: string;
  title: string;
  itinerary_data: unknown;
}

export interface BookingReminderDraft {
  trip_id: string;
  kind: "booking";
  title: string;
  body: string;
  href: string;
  dedupe_key: string;
}

export function parseLeadDays(leadTime?: string): number {
  if (!leadTime) return 1;
  const value = leadTime.toLowerCase();
  if (value.includes("same day") || value.includes("walk")) return 0;
  const match = value.match(/(\d+)\s*(hour|day|week|month)/);
  if (!match) return 1;
  const count = Number.parseInt(match[1], 10);
  if (match[2].startsWith("hour")) return Math.max(0, Math.round(count / 24));
  if (match[2].startsWith("week")) return count * 7;
  if (match[2].startsWith("month")) return count * 30;
  return count;
}

function localDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const result = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(result.getTime()) ? null : result;
}

function dayNumber(value: Date): number {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86_400_000;
}

export function buildBookingReminderDrafts(
  trips: BookingReminderTrip[],
  today: Date,
): BookingReminderDraft[] {
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const drafts: BookingReminderDraft[] = [];

  for (const trip of trips) {
    const data = trip.itinerary_data && typeof trip.itinerary_data === "object"
      ? trip.itinerary_data as Record<string, unknown>
      : {};
    const days = Array.isArray(data.days) ? data.days : Array.isArray(data.itinerary) ? data.itinerary : [];
    const booked = data.bookedReservations && typeof data.bookedReservations === "object"
      ? data.bookedReservations as Record<string, boolean>
      : {};

    days.forEach((rawDay, index) => {
      if (!rawDay || typeof rawDay !== "object") return;
      const day = rawDay as Record<string, unknown>;
      if (typeof day.date !== "string" || !Array.isArray(day.reservations)) return;
      const tripDay = localDate(day.date);
      if (!tripDay) return;
      const dayNum = typeof day.day === "number" ? day.day : index + 1;

      day.reservations.forEach((rawReservation, reservationIndex) => {
        if (!rawReservation || typeof rawReservation !== "object") return;
        const reservation = rawReservation as Record<string, unknown>;
        if (typeof reservation.what !== "string" || !reservation.what.trim()) return;

        const what = reservation.what;
        const key = `d${dayNum}-${reservationIndex}-${what.slice(0, 40)}`;
        if (booked[key]) return;

        const leadDays = parseLeadDays(typeof reservation.leadTime === "string" ? reservation.leadTime : undefined);
        const bookBy = new Date(tripDay.getFullYear(), tripDay.getMonth(), tripDay.getDate() - leadDays);
        const daysLeft = dayNumber(bookBy) - dayNumber(todayStart);
        if (daysLeft > 2) return;

        const overdue = daysLeft < 0;
        const bookByLabel = bookBy.toLocaleDateString([], { month: "short", day: "numeric" });
        drafts.push({
          trip_id: trip.id,
          kind: "booking",
          title: overdue ? `Booking deadline passed · Day ${dayNum}` : `Booking due soon · Day ${dayNum}`,
          body: `${trip.destination} · ${what} · book by ${bookByLabel}`,
          href: `/itinerary?id=${encodeURIComponent(trip.id)}`,
          dedupe_key: `booking:${trip.id}:${key}:${todayKey}`,
        });
      });
    });
  }

  return drafts;
}