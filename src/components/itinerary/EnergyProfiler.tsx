import { motion } from "framer-motion";
import { Battery, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Energy cost factors by activity type */
const ENERGY_COSTS: Record<string, number> = {
  attraction: 3,
  restaurant: 1,
  transport: 2,
  free: 2,
  shopping: 2,
  nightlife: 3,
  hiking: 5,
  adventure: 5,
  museum: 2,
  temple: 2,
  default: 2,
};

/** Returns energy cost 1-5 for an activity */
export const getActivityEnergy = (activity: { type: string; duration: string }): number => {
  const base = ENERGY_COSTS[activity.type] || ENERGY_COSTS.default;
  const hours = parseFloat(activity.duration) || 1;
  const scaled = Math.min(5, Math.max(1, Math.round(base * (hours / 2))));
  return scaled;
};

/** Calculate total energy for a day */
export const getDayEnergy = (activities: { type: string; duration: string }[]): number => {
  return activities.reduce((sum, a) => sum + getActivityEnergy(a), 0);
};

/** Max sustainable energy per day (researched average) */
const MAX_COMFORTABLE_ENERGY = 15;
const BURNOUT_THRESHOLD = 20;

interface EnergyBarProps {
  activities: { type: string; duration: string }[];
  dayNum: number;
  compact?: boolean;
}

export const EnergyBar = ({ activities, dayNum, compact }: EnergyBarProps) => {
  const totalEnergy = getDayEnergy(activities);
  const percentage = Math.min(100, (totalEnergy / BURNOUT_THRESHOLD) * 100);
  const isBurnout = totalEnergy > MAX_COMFORTABLE_ENERGY;
  const isOverloaded = totalEnergy > BURNOUT_THRESHOLD;

  const color = isOverloaded
    ? "from-red-500 to-red-400"
    : isBurnout
    ? "from-yellow-500 to-orange-400"
    : "from-green-500 to-emerald-400";

  const BatteryIcon = isOverloaded ? BatteryWarning : isBurnout ? BatteryLow : totalEnergy > 10 ? BatteryMedium : BatteryFull;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <BatteryIcon className={cn("w-4 h-4", isOverloaded ? "text-red-500" : isBurnout ? "text-yellow-500" : "text-green-500")} />
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className={cn("h-full rounded-full bg-gradient-to-r", color)}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Day {dayNum} energy: {totalEnergy}/{BURNOUT_THRESHOLD}</p>
            {isBurnout && <p className="text-xs text-yellow-500">⚠️ High energy day — consider rebalancing</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className={cn("w-4 h-4", isOverloaded ? "text-red-500" : isBurnout ? "text-yellow-500" : "text-green-500")} />
          <span className="text-sm font-semibold text-foreground">Day {dayNum} Energy Profile</span>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
          isOverloaded ? "bg-red-500/10 text-red-500" : isBurnout ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"
        )}>
          {isOverloaded ? "🔥 Overloaded" : isBurnout ? "⚠️ High Energy" : "✅ Balanced"}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">Energy: {totalEnergy} units</span>
        <span className="text-[10px] text-muted-foreground">Threshold: {MAX_COMFORTABLE_ENERGY}</span>
      </div>
    </div>
  );
};

/** Small inline badge for activity cards */
export const ActivityEnergyBadge = ({ activity }: { activity: { type: string; duration: string } }) => {
  const energy = getActivityEnergy(activity);
  const dots = Array.from({ length: 5 }, (_, i) => i < energy);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-[10px]">
            <Battery className="w-3 h-3 text-muted-foreground" />
            {dots.map((filled, i) => (
              <span key={i} className={cn("w-1.5 h-1.5 rounded-full", filled ? (energy >= 4 ? "bg-orange-400" : energy >= 3 ? "bg-yellow-400" : "bg-green-400") : "bg-muted")} />
            ))}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Energy cost: {energy}/5</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/** Auto-rebalance suggestion — supports both local rebalance and AI regenerate */
export const RebalanceButton = ({
  days,
  onRebalance,
  onRegenerateBalanced,
  regenerating,
}: {
  days: any[];
  onRebalance: (rebalanced: any[]) => void;
  onRegenerateBalanced?: () => void;
  regenerating?: boolean;
}) => {
  const overloadedDays = days.filter(d => getDayEnergy(d.activities || []) > MAX_COMFORTABLE_ENERGY);

  if (overloadedDays.length === 0) return null;

  const handleRebalance = () => {
    // Move highest-energy activity from each overloaded day to an underloaded one
    const rebalanced = days.map(d => ({ ...d, activities: [...(d.activities || [])] }));

    for (const day of rebalanced) {
      const energy = getDayEnergy(day.activities);
      if (energy > MAX_COMFORTABLE_ENERGY) {
        day.activities.sort((a: any, b: any) => getActivityEnergy(b) - getActivityEnergy(a));
        const underloaded = rebalanced.find(d => d.day !== day.day && getDayEnergy(d.activities) < MAX_COMFORTABLE_ENERGY - 3);
        if (underloaded && day.activities.length > 2) {
          const moved = day.activities.splice(0, 1)[0];
          underloaded.activities.push(moved);
        }
      }
    }

    onRebalance(rebalanced);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleRebalance} className="gap-2 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/10">
        <RefreshCw className="w-3.5 h-3.5" />
        Quick Rebalance ({overloadedDays.length} overloaded {overloadedDays.length === 1 ? "day" : "days"})
      </Button>
      {onRegenerateBalanced && (
        <Button variant="default" size="sm" onClick={onRegenerateBalanced} disabled={regenerating} className="gap-2">
          <Zap className="w-3.5 h-3.5" />
          {regenerating ? "AI Replanning…" : "AI Smart Rebalance"}
        </Button>
      )}
    </div>
  );
};
