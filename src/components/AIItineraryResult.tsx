import { motion } from "framer-motion";
import {
  MapPin, Clock, DollarSign, Sun, CloudRain, Cloud, Snowflake,
  Utensils, Camera, ShoppingBag, Bus, TreePine, PartyPopper,
  Lightbulb, AlertTriangle, Luggage, Ticket
} from "lucide-react";
import PlaceCard from "./PlaceCard";
import EventCard from "./EventCard";

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  weather?: { condition: string; temp: string; advisory?: string };
  activities: Array<{
    time: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    cost: number;
    type: string;
    tip?: string;
  }>;
  meals?: {
    breakfast?: { name: string; cuisine: string; priceRange: string; location: string };
    lunch?: { name: string; cuisine: string; priceRange: string; location: string };
    dinner?: { name: string; cuisine: string; priceRange: string; location: string };
  };
  dailyBudget?: number;
  travelTip?: string;
}

interface ItineraryData {
  title: string;
  summary: string;
  totalBudgetEstimate?: number;
  currency?: string;
  days: ItineraryDay[];
  packingTips?: string[];
  budgetBreakdown?: Record<string, number>;
  warnings?: string[];
}

const weatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-4 h-4" />;
  if (c.includes("cloud")) return <Cloud className="w-4 h-4" />;
  if (c.includes("snow")) return <Snowflake className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
};

const activityIcon = (type: string) => {
  switch (type) {
    case "restaurant": return <Utensils className="w-4 h-4" />;
    case "attraction": return <Camera className="w-4 h-4" />;
    case "shopping": return <ShoppingBag className="w-4 h-4" />;
    case "transport": return <Bus className="w-4 h-4" />;
    case "free": return <TreePine className="w-4 h-4" />;
    case "nightlife": return <PartyPopper className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

interface Props {
  data: ItineraryData;
  weatherData?: any;
}

const AIItineraryResult = ({ data, weatherData }: Props) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{data.title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{data.summary}</p>
        {data.totalBudgetEstimate && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-accent/10 text-accent">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">Estimated: ${data.totalBudgetEstimate.toLocaleString()} {data.currency || "USD"}</span>
          </div>
        )}
      </motion.div>

      {/* Warnings */}
      {data.warnings?.length ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            {data.warnings.map((w, i) => <p key={i} className="text-sm text-destructive">{w}</p>)}
          </div>
        </motion.div>
      ) : null}

      {/* Weather strip */}
      {weatherData?.forecast?.length ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" /> Weather Forecast
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {weatherData.forecast.map((f: any) => (
              <div key={f.date} className="flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-lg bg-secondary/50">
                <span className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</span>
                {weatherIcon(f.weather)}
                <span className="text-sm font-semibold text-foreground">{f.temp}°C</span>
                <span className="text-[10px] text-muted-foreground">{f.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Days */}
      {data.days.map((day, idx) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + idx * 0.1 }}
          className="glass-card overflow-hidden"
        >
          {/* Day header */}
          <div className="gradient-ocean p-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-primary-foreground">
                Day {day.day}: {day.theme}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {new Date(day.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {day.weather && (
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                {weatherIcon(day.weather.condition)}
                <span>{day.weather.temp}</span>
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Weather advisory */}
            {day.weather?.advisory && (
              <div className="text-sm bg-primary/5 text-primary rounded-lg p-3 flex items-start gap-2">
                <Cloud className="w-4 h-4 mt-0.5 shrink-0" />
                {day.weather.advisory}
              </div>
            )}

            {/* Activities */}
            <div className="space-y-3">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {activityIcon(act.type)}
                    </div>
                    {i < day.activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{act.title}</p>
                        <p className="text-xs text-muted-foreground">{act.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{act.location}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{act.duration}</span>
                      {act.cost > 0 && <span className="text-xs text-accent flex items-center gap-1"><DollarSign className="w-3 h-3" />${act.cost}</span>}
                    </div>
                    {act.tip && (
                      <div className="mt-2 text-xs text-primary bg-primary/5 rounded-md px-2 py-1 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" /> {act.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Meals */}
            {day.meals && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-accent" /> Dining
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                    const m = day.meals?.[meal];
                    if (!m) return null;
                    return (
                      <div key={meal} className="bg-secondary/50 rounded-lg p-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{meal}</p>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.cuisine} · {m.priceRange}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily tip */}
            {day.travelTip && (
              <div className="text-xs text-muted-foreground italic border-t border-border pt-3 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" /> {day.travelTip}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Budget breakdown */}
      {data.budgetBreakdown && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" /> Budget Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.budgetBreakdown).map(([k, v]) => (
              <div key={k} className="text-center p-3 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground capitalize">{k}</p>
                <p className="text-lg font-bold text-foreground">${v.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Packing tips */}
      {data.packingTips?.length ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-primary" /> Packing Tips
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.packingTips.map((tip, i) => (
              <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg">{tip}</span>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default AIItineraryResult;
