import { motion } from "framer-motion";
import {
  Sparkles, CloudRain, CalendarClock, PieChart, Backpack,
  Clock, AlertCircle, Utensils, Mountain, Palette, Compass, Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DayIntelligence {
  signatureMoment?: { title?: string; time?: string; why?: string; where?: string };
  dayScorecard?: { culture?: number; food?: number; nature?: number; adventure?: number; relaxation?: number };
  rainPlanB?: { original?: string; alternative?: string; why?: string }[];
  reservations?: { what?: string; leadTime?: string; urgency?: "low" | "medium" | "high" | string; how?: string }[];
  costBreakdown?: { activities?: number; food?: number; transport?: number; extras?: number };
  packToday?: string[];
}

const SCORE_META: { key: keyof NonNullable<DayIntelligence["dayScorecard"]>; label: string; icon: typeof Palette; color: string }[] = [
  { key: "culture", label: "Culture", icon: Palette, color: "bg-violet-500" },
  { key: "food", label: "Food", icon: Utensils, color: "bg-amber-500" },
  { key: "nature", label: "Nature", icon: Mountain, color: "bg-emerald-500" },
  { key: "adventure", label: "Adventure", icon: Compass, color: "bg-rose-500" },
  { key: "relaxation", label: "Relaxation", icon: Waves, color: "bg-sky-500" },
];

const urgencyStyle = (u?: string) => {
  switch ((u || "").toLowerCase()) {
    case "high": return "text-rose-600 bg-rose-500/10 border-rose-500/20";
    case "medium": return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    default: return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  }
};

const Section = ({ icon: Icon, title, children, className }: {
  icon: typeof Sparkles; title: string; children: React.ReactNode; className?: string;
}) => (
  <div className={cn("rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-3.5", className)}>
    <div className="flex items-center gap-1.5 mb-2.5">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <h6 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h6>
    </div>
    {children}
  </div>
);

export const DayIntelligencePanel = ({ day, currency = "USD" }: { day: DayIntelligence; currency?: string }) => {
  const { signatureMoment, dayScorecard, rainPlanB, reservations, costBreakdown, packToday } = day || {};
  const hasScores = dayScorecard && Object.values(dayScorecard).some(v => typeof v === "number");
  const costEntries = costBreakdown
    ? (Object.entries(costBreakdown).filter(([, v]) => typeof v === "number" && v > 0) as [string, number][])
    : [];
  const costTotal = costEntries.reduce((s, [, v]) => s + v, 0);

  if (!signatureMoment?.title && !hasScores && !rainPlanB?.length && !reservations?.length && !costEntries.length && !packToday?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      className="mb-5 space-y-3"
    >
      {signatureMoment?.title && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_60%)]" />
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">Signature moment</p>
              <p className="text-sm font-semibold text-foreground">
                {signatureMoment.title}
                {signatureMoment.time && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Clock className="w-3 h-3" />{signatureMoment.time}
                  </span>
                )}
              </p>
              {signatureMoment.where && <p className="text-[11px] text-muted-foreground mt-0.5">{signatureMoment.where}</p>}
              {signatureMoment.why && <p className="text-xs text-foreground/75 mt-1.5 leading-relaxed">{signatureMoment.why}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hasScores && (
          <Section icon={PieChart} title="Day scorecard">
            <div className="space-y-2">
              {SCORE_META.map(({ key, label, icon: Icon, color }) => {
                const raw = dayScorecard?.[key];
                if (typeof raw !== "number") return null;
                const pct = Math.max(0, Math.min(100, raw <= 10 ? raw * 10 : raw));
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={cn("h-full rounded-full", color)}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground/70 w-7 text-right">{Math.round(pct / 10)}/10</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {costEntries.length > 0 && (
          <Section icon={PieChart} title={`Cost split · ${currency}`}>
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-secondary mb-2.5">
              {costEntries.map(([k, v], i) => (
                <div
                  key={k}
                  className={["bg-primary", "bg-amber-500", "bg-sky-500", "bg-violet-500"][i % 4]}
                  style={{ width: `${(v / costTotal) * 100}%` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {costEntries.map(([k, v], i) => (
                <div key={k} className="flex items-center gap-1.5 text-[11px]">
                  <span className={cn("w-2 h-2 rounded-full", ["bg-primary", "bg-amber-500", "bg-sky-500", "bg-violet-500"][i % 4])} />
                  <span className="capitalize text-muted-foreground">{k}</span>
                  <span className="ml-auto font-medium text-foreground">${v}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border/60 flex justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground">Day total</span>
              <span className="text-foreground">${costTotal}</span>
            </div>
          </Section>
        )}

        {!!rainPlanB?.length && (
          <Section icon={CloudRain} title="Rain plan B">
            <div className="space-y-2">
              {rainPlanB.map((p, i) => (
                <div key={i} className="text-[11px] leading-relaxed">
                  <span className="text-muted-foreground line-through">{p.original}</span>
                  <span className="mx-1.5 text-primary">→</span>
                  <span className="font-medium text-foreground">{p.alternative}</span>
                  {p.why && <span className="block text-muted-foreground/80 mt-0.5">{p.why}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {!!reservations?.length && (
          <Section icon={CalendarClock} title="Book ahead">
            <div className="space-y-2">
              {reservations.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground">{r.what}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {r.leadTime && (
                        <span className="text-[10px] text-muted-foreground bg-secondary/70 px-1.5 py-0.5 rounded-md">{r.leadTime}</span>
                      )}
                      {r.urgency && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md border capitalize", urgencyStyle(r.urgency))}>
                          {r.urgency} urgency
                        </span>
                      )}
                    </div>
                    {r.how && <p className="text-[10px] text-muted-foreground/80 mt-0.5">{r.how}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {!!packToday?.length && (
          <Section icon={Backpack} title="Pack for today">
            <div className="flex flex-wrap gap-1.5">
              {packToday.map((item, i) => (
                <span key={i} className="text-[11px] bg-secondary/70 text-foreground/80 px-2 py-1 rounded-lg">{item}</span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </motion.div>
  );
};

export default DayIntelligencePanel;
