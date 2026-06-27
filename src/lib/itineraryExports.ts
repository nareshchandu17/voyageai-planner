// Export helpers for itineraries — Google Maps, Apple Maps, ICS calendar, Markdown.

export interface ExportActivity {
  time?: string;
  title?: string;
  name?: string;
  location?: string;
  address?: string;
  description?: string;
  duration?: string;
}
export interface ExportDay {
  day: number;
  date?: string;
  theme?: string;
  activities: ExportActivity[];
}

const pad = (n: number) => String(n).padStart(2, "0");

const toICSDate = (date: string, time?: string) => {
  // date: YYYY-MM-DD, time: HH:MM
  const [y, m, d] = (date || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (time || "09:00").split(":").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hh || 9)}${pad(mm || 0)}00`;
};

export const buildGoogleMapsRoute = (activities: ExportActivity[]) => {
  const stops = activities
    .map((a) => a.address || a.location || a.title || a.name || "")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s));
  if (!stops.length) return null;
  if (stops.length === 1) return `https://www.google.com/maps/search/?api=1&query=${stops[0]}`;
  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1).join("|");
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
};

export const buildAppleMapsRoute = (activities: ExportActivity[]) => {
  const stops = activities
    .map((a) => a.address || a.location || a.title || a.name || "")
    .filter(Boolean);
  if (!stops.length) return null;
  const q = encodeURIComponent(stops[0]);
  return `https://maps.apple.com/?q=${q}`;
};

export const buildICS = (tripTitle: string, days: ExportDay[]) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lovable Travel//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const day of days) {
    if (!day.date) continue;
    for (const a of day.activities) {
      const start = toICSDate(day.date, a.time);
      if (!start) continue;
      const uid = `${day.date}-${a.time || "0900"}-${Math.random().toString(36).slice(2, 8)}@lovable-travel`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART:${start}`,
        `DTEND:${start}`,
        `SUMMARY:${escapeICS(a.title || a.name || "Activity")}`,
        `LOCATION:${escapeICS(a.address || a.location || "")}`,
        `DESCRIPTION:${escapeICS([tripTitle, a.description, a.duration].filter(Boolean).join(" · "))}`,
        "END:VEVENT"
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

const escapeICS = (s: string) =>
  (s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export const buildMarkdown = (tripTitle: string, destination: string, days: ExportDay[]) => {
  const out: string[] = [`# ${tripTitle || destination}`, "", `**${destination}** · ${days.length} day${days.length > 1 ? "s" : ""}`, ""];
  for (const day of days) {
    out.push(`## Day ${day.day}${day.date ? ` — ${day.date}` : ""}${day.theme ? ` · ${day.theme}` : ""}`, "");
    for (const a of day.activities) {
      out.push(`- **${a.time || ""}** ${a.title || a.name || ""}${a.location ? ` _(${a.location})_` : ""}`);
      if (a.description) out.push(`  - ${a.description}`);
    }
    out.push("");
  }
  return out.join("\n");
};

export const downloadBlob = (filename: string, mime: string, content: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
