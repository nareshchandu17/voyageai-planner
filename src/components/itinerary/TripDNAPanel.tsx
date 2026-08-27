import { motion } from "framer-motion";
import { Dna, Star, PiggyBank, Languages, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TripDNATrait { trait?: string; weight?: number }
export interface SignatureExperience { name?: string; day?: number; why?: string; imageQuery?: string }
export interface MoneySaver { tip?: string; savings?: string }
export interface LocalPhrase { phrase?: string; meaning?: string; pronunciation?: string }

export interface TripDNAProps {
  tripDNA?: TripDNATrait[];
  signatureExperiences?: SignatureExperience[];
  moneySavers?: MoneySaver[];
  localPhrases?: LocalPhrase[];
}

const BAR_COLORS = ["bg-primary", "bg-accent", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500"];

export const TripDNAPanel = ({ tripDNA, signatureExperiences, moneySavers, localPhrases }: TripDNAProps) => {
  const hasAny = !!(tripDNA?.length || signatureExperiences?.length || moneySavers?.length || localPhrases?.length);
  if (!hasAny) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 md:p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
            <Dna className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground leading-tight">Trip DNA</h3>
            <p className="text-[11px] text-muted-foreground">What this journey is really made of</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {!!tripDNA?.length && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Trait mix</p>
              <div className="space-y-2">
                {tripDNA.slice(0, 6).map((t, i) => {
                  const raw = typeof t.weight === "number" ? t.weight : 50;
                  const pct = Math.max(4, Math.min(100, raw <= 1 ? raw * 100 : raw));
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[11px] font-medium text-foreground/80 w-24 shrink-0 truncate capitalize">{t.trait}</span>
                      <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                          className={cn("h-full rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(pct)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!signatureExperiences?.length && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Signature experiences</p>
              <div className="space-y-2">
                {signatureExperiences.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3 py-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {e.name}
                        {e.day ? <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">Day {e.day}</span> : null}
                      </p>
                      {e.why && <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{e.why}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!moneySavers?.length && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Money savers</p>
              <div className="space-y-1.5">
                {moneySavers.slice(0, 6).map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground/80 leading-relaxed">{m.tip}</span>
                    {m.savings && (
                      <span className="ml-auto shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        {m.savings}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!localPhrases?.length && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                <Languages className="w-3 h-3 inline mr-1 -mt-0.5" />Local phrases
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {localPhrases.slice(0, 8).map((p, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-foreground">{p.phrase}</p>
                    <p className="text-[10px] text-muted-foreground">{p.meaning}</p>
                    {p.pronunciation && (
                      <p className="text-[10px] text-primary/80 flex items-center gap-1 mt-0.5">
                        <Volume2 className="w-2.5 h-2.5" />{p.pronunciation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TripDNAPanel;
