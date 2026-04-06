import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Compass, Mountain, Sunrise, Heart, Flag, GripVertical, Zap, TrendingUp, TrendingDown, Activity, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArcPreset {
  id: string;
  label: string;
  icon: typeof Zap;
  description: string;
  /** Returns intensity (0-100) for each day index given totalDays */
  generate: (totalDays: number) => Record<number, number>;
}

const arcPresets: ArcPreset[] = [
  {
    id: "slow-start",
    label: "Slow Start",
    icon: Coffee,
    description: "Ease in gently, peak late, end strong",
    generate: (n) => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) {
        const t = i / Math.max(n - 1, 1);
        m[i] = Math.round(20 + 70 * Math.pow(t, 1.8));
      }
      return m;
    },
  },
  {
    id: "peak-early",
    label: "Peak Early",
    icon: TrendingDown,
    description: "Hit the highlights first, then unwind",
    generate: (n) => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) {
        const t = i / Math.max(n - 1, 1);
        m[i] = Math.round(95 - 70 * Math.pow(t, 1.5));
      }
      return m;
    },
  },
  {
    id: "balanced",
    label: "Balanced",
    icon: Activity,
    description: "Even energy throughout the trip",
    generate: (n) => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) m[i] = 60;
      return m;
    },
  },
  {
    id: "classic-arc",
    label: "Classic Arc",
    icon: TrendingUp,
    description: "Build up, peak in the middle, wind down",
    generate: (n) => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) {
        const t = i / Math.max(n - 1, 1);
        m[i] = Math.round(25 + 75 * Math.sin(t * Math.PI));
      }
      return m;
    },
  },
  {
    id: "max-intensity",
    label: "Go All Out",
    icon: Zap,
    description: "Maximum activities every single day",
    generate: (n) => {
      const m: Record<number, number> = {};
      for (let i = 0; i < n; i++) m[i] = 95;
      return m;
    },
  },
];

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

  const phases: NarrativePhase[] = ["orientation"];
  const remaining = totalDays - 3;
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
  onIntensityChange?: (dayIndex: number, newIntensity: number) => void;
}

export const NarrativeArc = ({ totalDays, activeDay, onDayClick, onIntensityChange }: NarrativeArcProps) => {
  const phases = assignNarrativePhases(totalDays);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [customIntensities, setCustomIntensities] = useState<Record<number, number>>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const getIntensity = (index: number, phase: NarrativePhase) =>
    customIntensities[index] ?? phaseConfig[phase].intensity;

  const applyPreset = useCallback((preset: ArcPreset) => {
    const intensities = preset.generate(totalDays);
    setCustomIntensities(intensities);
    setActivePreset(preset.id);
    // Notify parent of all changes
    if (onIntensityChange) {
      Object.entries(intensities).forEach(([idx, val]) => onIntensityChange(Number(idx), val));
    }
  }, [totalDays, onIntensityChange]);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(index);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging === null || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const svgY = e.clientY - rect.top;
    const svgHeight = rect.height;
    // Map y position to intensity (top=100, bottom=0)
    const rawIntensity = ((svgHeight - svgY) / svgHeight) * 120;
    const clamped = Math.max(10, Math.min(100, rawIntensity));

    setCustomIntensities(prev => ({ ...prev, [dragging]: Math.round(clamped) }));
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (dragging !== null && onIntensityChange && customIntensities[dragging] !== undefined) {
      onIntensityChange(dragging, customIntensities[dragging]);
    }
    setDragging(null);
  }, [dragging, customIntensities, onIntensityChange]);

  const viewBoxWidth = totalDays * 100;
  const viewBoxHeight = 80;

  const points = phases.map((phase, i) => {
    const intensity = getIntensity(i, phase);
    const x = totalDays === 1 ? viewBoxWidth / 2 : (i / (totalDays - 1)) * viewBoxWidth;
    const y = viewBoxHeight - 5 - (intensity / 100) * (viewBoxHeight - 15);
    return { x, y, intensity };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = [
    ...points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${viewBoxHeight - 2}`,
    `L ${points[0].x} ${viewBoxHeight - 2}`,
    "Z"
  ].join(" ");

  const hasCustom = Object.keys(customIntensities).length > 0;

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h5 className="text-sm font-semibold text-foreground">Trip Story Arc</h5>
        <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
          <GripVertical className="w-3 h-3" /> Drag dots to reshape pacing
        </span>
        {hasCustom && (
          <button
            onClick={() => setCustomIntensities({})}
            className="text-[10px] text-primary hover:underline ml-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Arc Visualization */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-20 select-none touch-none"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
              <stop offset="60%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Fill under curve */}
          <path d={fillD} fill="url(#arcGradient)" opacity="0.15" />
          {/* Curve line */}
          <path d={pathD} fill="none" stroke="url(#arcGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Draggable dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={dragging === i ? 8 : 6}
              fill={i + 1 === activeDay ? "hsl(var(--primary))" : customIntensities[i] !== undefined ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
              stroke="hsl(var(--background))"
              strokeWidth="2"
              className="cursor-grab active:cursor-grabbing transition-all"
              style={{ filter: dragging === i ? "drop-shadow(0 0 6px hsl(var(--primary) / 0.5))" : undefined }}
              onPointerDown={(e) => handlePointerDown(i, e)}
            />
          ))}
        </svg>

        {/* Day labels */}
        <div className="flex justify-between mt-2">
          <TooltipProvider>
            {phases.map((phase, i) => {
              const config = phaseConfig[phase];
              const Icon = config.icon;
              const isActive = i + 1 === activeDay;
              const intensity = getIntensity(i, phase);
              const isCustom = customIntensities[i] !== undefined;

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
                            : isCustom
                              ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </motion.div>
                      <span className={cn("text-[9px] font-medium whitespace-nowrap", isActive ? "text-foreground" : "text-muted-foreground")}>
                        Day {i + 1}
                      </span>
                      {isCustom && (
                        <span className="text-[8px] text-accent font-medium">{intensity}%</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs font-semibold">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground max-w-[180px]">{config.description}</p>
                    {isCustom && <p className="text-[10px] text-accent mt-1">Custom intensity: {intensity}%</p>}
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
