import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, BellOff, CalendarClock, CheckCircle2, ExternalLink, Ticket, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export interface Reservation {
  what?: string;
  leadTime?: string;
  urgency?: string;
  how?: string;
}

/** Parse "Book 3 days ahead" / "2 weeks in advance" / "same day" → days of lead time. */
export function parseLeadDays(leadTime?: string): number {
  if (!leadTime) return 1;
  const s = leadTime.toLowerCase();
  if (s.includes("same day") || s.includes("walk")) return 0;
  const m = s.match(/(\d+)\s*(hour|day|week|month)/);
  if (!m) return 1;
  const n = parseInt(m[1], 10);
  if (m[2].startsWith("hour")) return Math.max(0, Math.round(n / 24));
  if (m[2].startsWith("week")) return n * 7;
  if (m[2].startsWith("month")) return n * 30;
  return n;
}

const urgencyStyle = (u?: string) => {
  const s = (u || "").toLowerCase();
  if (s === "high") return "bg-rose-50 text-rose-700 border-rose-200";
  if (s === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

interface Props {
  dayNum: number;
  date?: string;
  reservations: Reservation[];
  booked: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

const BookingChecklist = ({ dayNum, date, reservations, booked, onToggle }: Props) => {
  const [remindersOn, setRemindersOn] = useState(() => localStorage.getItem("trip-booking-reminders") === "on");
  const notified = useRef<Set<string>>(new Set());

  const items = useMemo(() => {
    const dayDate = date ? new Date(date) : null;
    return reservations
      .filter((r) => r?.what)
      .map((r, i) => {
        const leadDays = parseLeadDays(r.leadTime);
        const bookBy = dayDate ? new Date(dayDate.getTime() - leadDays * 86400000) : null;
        const daysLeft = bookBy ? Math.ceil((bookBy.getTime() - Date.now()) / 86400000) : null;
        return {
          key: `d${dayNum}-${i}-${(r.what || "").slice(0, 40)}`,
          ...r,
          leadDays,
          bookBy,
          daysLeft,
          overdue: daysLeft !== null && daysLeft < 0,
          dueSoon: daysLeft !== null && daysLeft >= 0 && daysLeft <= 2,
        };
      });
  }, [reservations, date, dayNum]);

  const pending = items.filter((i) => !booked[i.key]);
  const doneCount = items.length - pending.length;

  // Fire reminders for pending bookings whose lead-time window is open or closing.
  useEffect(() => {
    if (!remindersOn) return;
    for (const it of pending) {
      if (!it.overdue && !it.dueSoon) continue;
      if (notified.current.has(it.key)) continue;
      notified.current.add(it.key);
      const title = it.overdue ? `Booking overdue — Day ${dayNum}` : `Book soon — Day ${dayNum}`;
      const body = `${it.what}${it.bookBy ? ` · book by ${it.bookBy.toLocaleDateString()}` : ""}`;
      toast(title, { description: body, icon: <BellRing className="w-4 h-4" /> });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification(title, { body }); } catch { /* noop */ }
      }
    }
  }, [remindersOn, pending, dayNum]);

  const toggleReminders = async () => {
    if (remindersOn) {
      setRemindersOn(false);
      localStorage.setItem("trip-booking-reminders", "off");
      toast("Reminders off");
      return;
    }
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch { /* noop */ }
    }
    notified.current.clear();
    setRemindersOn(true);
    localStorage.setItem("trip-booking-reminders", "on");
    toast.success("Reminders on", { description: "You'll be alerted before each booking lead time." });
  };

  if (!items.length) return null;

  return (
    <div className="px-4 py-3 border-b border-black/5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" /> Booking checklist
          <span className="normal-case tracking-normal text-muted-foreground/70">({doneCount}/{items.length} booked)</span>
        </p>
        <Button size="sm" variant="ghost" className="rounded-full text-xs h-7" onClick={toggleReminders}>
          {remindersOn ? <BellRing className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <BellOff className="w-3.5 h-3.5 mr-1.5" />}
          {remindersOn ? "Reminders on" : "Remind me"}
        </Button>
      </div>

      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const isBooked = !!booked[it.key];
            return (
              <motion.li
                key={it.key}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 transition ${
                  isBooked ? "border-black/5 bg-[#FAFAFA] opacity-70" : it.overdue ? "border-rose-200 bg-rose-50/50" : "border-black/5 bg-white"
                }`}
              >
                <Checkbox
                  checked={isBooked}
                  onCheckedChange={(v) => onToggle(it.key, !!v)}
                  className="mt-0.5"
                  aria-label={`Mark ${it.what} as booked`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium ${isBooked ? "line-through text-muted-foreground" : "text-foreground"}`}>{it.what}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge variant="outline" className={`text-[10px] rounded-full capitalize ${urgencyStyle(it.urgency)}`}>
                      {it.urgency || "low"} urgency
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CalendarClock className="w-3 h-3" />
                      {it.bookBy
                        ? `Book by ${it.bookBy.toLocaleDateString([], { month: "short", day: "numeric" })}`
                        : it.leadTime || "Book ahead"}
                      {it.daysLeft !== null && !isBooked && (
                        <span className={it.overdue ? "text-rose-600 font-semibold" : it.dueSoon ? "text-amber-600 font-semibold" : ""}>
                          {" "}· {it.overdue ? `${Math.abs(it.daysLeft)}d overdue` : `${it.daysLeft}d left`}
                        </span>
                      )}
                    </span>
                    {it.how && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />{it.how}
                      </span>
                    )}
                  </div>
                </div>
                {isBooked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : it.overdue ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                ) : null}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default BookingChecklist;
