import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";
import { getDayEnergy } from "./EnergyProfiler";

interface DayLike {
  day: number;
  activities: { type: string; duration: string }[];
}

interface Issue {
  severity: "warning" | "info";
  title: string;
  detail: string;
}

interface Props {
  days: DayLike[];
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export const ItineraryQualityWarning = ({ days, onRegenerate, regenerating }: Props) => {
  const issues = useMemo<Issue[]>(() => {
    if (!days?.length || days.length < 2) return [];
    const out: Issue[] = [];
    const counts = days.map((d) => d.activities?.length || 0);
    const energies = days.map((d) => getDayEnergy(d.activities || []));
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const minE = Math.min(...energies);
    const maxE = Math.max(...energies);

    const overloaded = days.filter((_, i) => energies[i] > 20);
    const empty = days.filter((_, i) => counts[i] < 2);

    if (overloaded.length) {
      out.push({
        severity: "warning",
        title: `${overloaded.length} burnout-risk day${overloaded.length > 1 ? "s" : ""}`,
        detail: `Day${overloaded.length > 1 ? "s" : ""} ${overloaded.map((d) => d.day).join(", ")} pack too many high-energy stops. Rebalance to avoid traveler fatigue.`,
      });
    }
    if (empty.length) {
      out.push({
        severity: "info",
        title: `${empty.length} sparse day${empty.length > 1 ? "s" : ""}`,
        detail: `Day${empty.length > 1 ? "s" : ""} ${empty.map((d) => d.day).join(", ")} ${empty.length > 1 ? "have" : "has"} fewer than 2 activities — consider adding hidden gems or local experiences.`,
      });
    }
    if (days.length >= 3 && maxE - minE < 4 && max - min < 2) {
      out.push({
        severity: "info",
        title: "Flat narrative pacing",
        detail: "Every day has roughly the same intensity — without contrast, peaks won't feel like peaks. Try a 'Classic Arc' or 'Slow Start' preset on the Trip Story Arc above.",
      });
    }
    if (days.length >= 4) {
      const lastIdx = days.length - 1;
      if (energies[lastIdx] > energies[0] + 8 && energies[lastIdx] >= 18) {
        out.push({
          severity: "warning",
          title: "Back-loaded peak",
          detail: `Day ${days[lastIdx].day} (your last day) is the most intense — travelers usually want a calmer farewell day to absorb the trip before flying home.`,
        });
      }
    }
    return out;
  }, [days]);

  if (issues.length === 0) return null;

  const hasWarning = issues.some((i) => i.severity === "warning");

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${
        hasWarning
          ? "border-yellow-500/30 bg-yellow-500/10"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${hasWarning ? "text-yellow-500" : "text-primary"}`}>
          {hasWarning ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`text-sm font-semibold ${hasWarning ? "text-yellow-700 dark:text-yellow-400" : "text-foreground"}`}>
              AI Itinerary Quality {hasWarning ? "Warning" : "Tip"}
            </h4>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-background/60 text-muted-foreground">
              {issues.length} signal{issues.length > 1 ? "s" : ""}
            </span>
          </div>
          <ul className="space-y-2">
            {issues.map((iss, idx) => (
              <li key={idx} className="text-xs text-foreground/85">
                <span className="font-semibold">{iss.title}.</span>{" "}
                <span className="text-muted-foreground">{iss.detail}</span>
              </li>
            ))}
          </ul>
          {onRegenerate && hasWarning && (
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {regenerating ? "AI Replanning…" : "AI Smart Rebalance"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItineraryQualityWarning;
