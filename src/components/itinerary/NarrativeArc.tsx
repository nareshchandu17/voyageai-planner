import { motion } from "framer-motion";
import { BookOpen, Compass, Mountain, Sunrise, Heart, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type NarrativePhase = "orientation" | "build" | "peak" | "wind-down" | "close";

const phaseConfig: Record<NarrativePhase, { label: string; icon: typeof Compass; color: string; intensity: number; description: string }> = {
  orientation: { label: "Arrival & Discovery", icon: Compass, color: "text-blue-400", intensity: 30, description: "Settling in, first impressions, local orientation" },
  build: { label: "Building Momentum", icon: Sunrise, color: "text-emerald-400", intensity: 60, description: "Deepening exploration, iconic experiences" },
  peak: { label: "Peak Experience", icon: Mountain, color: "text-amber-400", intensity: 100, description: "The climax — most memorable moments" },
  "wind-down": { label: "Reflection & Savoring", icon: Heart, color: "text-purple-400", intensity: 55, description: "Slower pace, revisiting favorites, reflection" },
  close: { label: "Farewell", icon: Flag, color: "text-rose-400", intensity: 25, description: "Last experiences, meaningful closure" },
};

/** Assign narrative phases to days based on trip length */
export const assignNarrativePhases = (totalDays: number): NarrativePhase[] => {
  if (totalDays <= 1) return ["peak"];
  if (totalDays === 2) return ["orientation", "peak"];
  if (totalDays === 3) return ["orientation", "peak", "close"];
  if (totalDays === 4) return ["orientation", "build", "peak", "close"];
  if (totalDays === 5) return ["orientation", "build", "peak", "wind-down", "close"];

  // For longer trips, distribute
  const phases: NarrativePhase[] = ["orientation"];
  const remaining = totalDays - 3; // reserve orientation, peak, close
  const buildDays = Math.ceil(remaining * 0.4);
  const windDays = remaining - buildDays;

  for (let i = 0; i < buildDays; i++) phases.push("build");
  phases.push("peak");
  for (let i = 0; i < windDays; i++) phases.push("wind-down");
  phases.push("close");

  return phases;
};

/** Get narrative label for a day */
export const getNarrativeLabel = (phase: NarrativePhase): string => phaseConfig[phase]?.label || phase;

interface NarrativeArcProps {
  totalDays: number;
  activeDay: number;
  onDayClick?: (dayNum: number) => void;
}

export const NarrativeArc = ({ totalDays, activeDay, onDayClick }: NarrativeArcProps) => {
  const phases = assignNarrativePhases(totalDays);

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h5 className="text-sm font-semibold text-foreground">Trip Story Arc</h5>
        <span className="text-[10px] text-muted-foreground ml-auto">Narrative pacing across your journey</span>
      </div>

      {/* Arc Visualization */}
      <div className="relative">
        {/* Background curve */}
        <svg viewBox={`0 0 ${totalDays * 100} 80`} className="w-full h-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
              <stop offset="60%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d={phases.map((phase, i) => {
              const x = (i / (totalDays - 1 || 1)) * (totalDays * 100);
              const y = 75 - (phaseConfig[phase].intensity / 100) * 65;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            }).join(" ")}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Fill area under curve */}
          <path
            d={[
              ...phases.map((phase, i) => {
                const x = (i / (totalDays - 1 || 1)) * (totalDays * 100);
                const y = 75 - (phaseConfig[phase].intensity / 100) * 65;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }),
              `L ${(totalDays - 1) * 100} 78`,
              `L 0 78`,
              "Z"
            ].join(" ")}
            fill="url(#arcGradient)"
            opacity="0.15"
          />
        </svg>

        {/* Day dots */}
        <div className="flex justify-between mt-2">
          <TooltipProvider>
            {phases.map((phase, i) => {
              const config = phaseConfig[phase];
              const Icon = config.icon;
              const isActive = i + 1 === activeDay;

              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onDayClick?.(i + 1)}
                      className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        isActive && "scale-110"
                      )}
                    >
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </motion.div>
                      <span className={cn("text-[9px] font-medium whitespace-nowrap", isActive ? "text-foreground" : "text-muted-foreground")}>
                        Day {i + 1}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs font-semibold">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground max-w-[180px]">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

/** Narrative phase badge for day headers */
export const NarrativePhaseBadge = ({ phase }: { phase: NarrativePhase }) => {
  const config = phaseConfig[phase];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-[10px] font-medium", config.color)}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
};
