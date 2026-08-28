import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, PieChart } from "lucide-react";

export interface CostBreakdown {
  activities: number;
  food: number;
  transport: number;
  extras: number;
  total: number;
}

const SEGMENTS: { key: keyof Omit<CostBreakdown, "total">; label: string; className: string; dot: string }[] = [
  { key: "activities", label: "Activities", className: "bg-primary", dot: "bg-primary" },
  { key: "food", label: "Food", className: "bg-amber-400", dot: "bg-amber-400" },
  { key: "transport", label: "Transport", className: "bg-sky-400", dot: "bg-sky-400" },
  { key: "extras", label: "Extras", className: "bg-violet-400", dot: "bg-violet-400" },
];

export const emptyBreakdown = (): CostBreakdown => ({ activities: 0, food: 0, transport: 0, extras: 0, total: 0 });

/** Derive a cost breakdown from raw activities when the AI did not supply one. */
export function deriveBreakdown(
  activities: { cost?: number; type?: string }[],
  provided?: Partial<CostBreakdown> | null,
): CostBreakdown {
  if (provided && typeof provided.total === "number" && provided.total > 0) {
    const b = {
      activities: Number(provided.activities) || 0,
      food: Number(provided.food) || 0,
      transport: Number(provided.transport) || 0,
      extras: Number(provided.extras) || 0,
      total: Number(provided.total) || 0,
    };
    return b;
  }
  const b = emptyBreakdown();
  for (const a of activities) {
    const cost = Number(a.cost) || 0;
    const t = (a.type || "").toLowerCase();
    if (t.includes("food") || t.includes("restaurant") || t.includes("meal") || t.includes("cafe")) b.food += cost;
    else if (t.includes("transport") || t.includes("transit") || t.includes("train") || t.includes("metro")) b.transport += cost;
    else if (t.includes("shopping") || t.includes("nightlife")) b.extras += cost;
    else b.activities += cost;
  }
  b.total = b.activities + b.food + b.transport + b.extras;
  return b;
}

interface Props {
  breakdown: CostBreakdown;
  previous?: CostBreakdown | null;
  currency: string;
  /** Totals of earlier regenerations, oldest → newest, for the variance trail. */
  trail?: { label: string; total: number }[];
}

const DayCostBreakdown = ({ breakdown, previous, currency, trail = [] }: Props) => {
  const total = breakdown.total || 1;
  const delta = previous ? breakdown.total - previous.total : 0;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaClass = delta > 0 ? "text-rose-600 bg-rose-50" : delta < 0 ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground bg-muted";
  const trailMax = Math.max(1, ...trail.map((t) => t.total), breakdown.total);

  return (
    <div className="px-4 py-3 border-b border-black/5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5" /> Cost breakdown
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{currency} {Math.round(breakdown.total)}</span>
          {previous && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${deltaClass}`}>
              <DeltaIcon className="w-3 h-3" />
              {delta === 0 ? "no change" : `${delta > 0 ? "+" : "−"}${currency} ${Math.abs(Math.round(delta))}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-[#F1F1F3]">
        {SEGMENTS.map((s) => {
          const val = breakdown[s.key] || 0;
          if (val <= 0) return null;
          return (
            <motion.div
              key={s.key}
              initial={{ width: 0 }}
              animate={{ width: `${(val / total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={s.className}
              title={`${s.label}: ${currency} ${Math.round(val)}`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {SEGMENTS.map((s) => {
          const val = breakdown[s.key] || 0;
          const prevVal = previous?.[s.key];
          const d = typeof prevVal === "number" ? val - prevVal : 0;
          return (
            <div key={s.key} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span>{s.label}</span>
              <span className="font-semibold text-foreground">{currency} {Math.round(val)}</span>
              {previous && d !== 0 && (
                <span className={d > 0 ? "text-rose-600" : "text-emerald-600"}>
                  ({d > 0 ? "+" : "−"}{Math.abs(Math.round(d))})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {trail.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Budget variance across regenerations</p>
          <div className="flex items-end gap-2 h-14">
            {[...trail, { label: "Now", total: breakdown.total }].map((t, i, arr) => (
              <div key={`${t.label}-${i}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(6, (t.total / trailMax) * 40)}px` }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`w-full rounded-t-md ${i === arr.length - 1 ? "bg-foreground" : "bg-black/15"}`}
                  title={`${t.label}: ${currency} ${Math.round(t.total)}`}
                />
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCostBreakdown;
