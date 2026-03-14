import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, DollarSign, Sun, CloudRain, Cloud, Snowflake,
  Utensils, Camera, ShoppingBag, Bus, TreePine, PartyPopper,
  Lightbulb, AlertTriangle, Luggage, Ticket, Compass, Plane, Download,
  ChevronRight, Star, Sunrise, Sunset as SunsetIcon, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaceCard from "./PlaceCard";
import EventCard from "./EventCard";
import BeforeTripSection from "./BeforeTripSection";
import DuringTripSection from "./DuringTripSection";
import { exportBeforeTripPDF } from "@/lib/exportPDF";
import { cn } from "@/lib/utils";

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  type: string;
  tip?: string;
  imageQuery?: string;
  imageUrl?: string;
}

interface MealInfo {
  name: string;
  cuisine: string;
  priceRange: string;
  location: string;
  imageQuery?: string;
  imageUrl?: string;
}

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  imageQuery?: string;
  imageUrl?: string;
  weather?: { condition: string; temp: string; advisory?: string };
  activities: Activity[];
  meals?: {
    breakfast?: MealInfo;
    lunch?: MealInfo;
    dinner?: MealInfo;
  };
  dailyBudget?: number;
  travelTip?: string;
}

interface ItineraryData {
  title: string;
  summary: string;
  totalBudgetEstimate?: number;
  currency?: string;
  beforeTrip?: any;
  duringTrip?: any;
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

const getTimeOfDay = (time: string): "morning" | "afternoon" | "evening" => {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const timeOfDayIcon = (tod: string) => {
  if (tod === "morning") return <Sunrise className="w-4 h-4" />;
  if (tod === "afternoon") return <Sun className="w-4 h-4" />;
  return <Moon className="w-4 h-4" />;
};

const timeOfDayLabel = (tod: string) => {
  if (tod === "morning") return "Morning";
  if (tod === "afternoon") return "Afternoon";
  return "Evening";
};

interface Props {
  data: ItineraryData;
  weatherData?: any;
  nearbyPlaces?: any;
  upcomingEvents?: any;
  destinationPhotos?: Array<{ id: string; url: string; small: string; thumb: string; alt: string; credit?: string; creditLink?: string }>;
  tripStartDate?: Date;
}

type Phase = "before" | "during";

const AIItineraryResult = ({ data, weatherData, nearbyPlaces, upcomingEvents, destinationPhotos = [], tripStartDate }: Props) => {
  const autoPhase = useMemo<Phase>(() => {
    if (!tripStartDate) return "before";
    return new Date() >= tripStartDate ? "during" : "before";
  }, [tripStartDate]);

  const [activePhase, setActivePhase] = useState<Phase>(autoPhase);
  const [activeDay, setActiveDay] = useState(1);
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => { setActivePhase(autoPhase); }, [autoPhase]);

  const hasBeforeTrip = !!data.beforeTrip;
  const hasDuringTrip = !!data.duringTrip;

  const scrollToDay = (dayNum: number) => {
    setActiveDay(dayNum);
    dayRefs.current[dayNum]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Group activities by time of day
  const groupActivities = (activities: Activity[]) => {
    const groups: Record<string, Activity[]> = { morning: [], afternoon: [], evening: [] };
    activities.forEach(a => {
      const tod = getTimeOfDay(a.time);
      groups[tod].push(a);
    });
    return groups;
  };

  const heroPhoto = destinationPhotos[0];
  const totalDays = data.days.length;
  const totalBudget = data.totalBudgetEstimate || data.days.reduce((sum, d) => sum + (d.dailyBudget || 0), 0);

  return (
    <div className="space-y-6">
      {/* ===== CINEMATIC TRIP HERO ===== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ height: "clamp(280px, 45vh, 420px)" }}
      >
        {heroPhoto ? (
          <img src={heroPhoto.url} alt={heroPhoto.alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-ocean" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl md:text-5xl font-bold text-white mb-2 leading-tight"
          >
            {data.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/75 max-w-2xl text-sm md:text-base mb-5"
          >
            {data.summary}
          </motion.p>
          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium">
              📅 {totalDays} Days
            </span>
            {totalBudget > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5" /> ${totalBudget.toLocaleString()} {data.currency || "USD"}
              </span>
            )}
            {data.days[0]?.weather && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium">
                {weatherIcon(data.days[0].weather.condition)} {data.days[0].weather.temp}
              </span>
            )}
          </motion.div>
        </div>
        {heroPhoto?.credit && (
          <a href={heroPhoto.creditLink} target="_blank" rel="noopener noreferrer"
            className="absolute top-3 right-3 text-[10px] text-white/50 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md hover:text-white/80 transition-colors">
            📷 {heroPhoto.credit}
          </a>
        )}
      </motion.div>

      {/* Warnings */}
      {data.warnings?.length ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            {data.warnings.map((w, i) => <p key={i} className="text-sm text-destructive">{w}</p>)}
          </div>
        </motion.div>
      ) : null}

      {/* Phase Toggle */}
      {(hasBeforeTrip || hasDuringTrip) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex bg-secondary/80 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
            <button
              onClick={() => setActivePhase("before")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                activePhase === "before" ? "gradient-ocean text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Compass className="w-4 h-4" /> Before Trip
            </button>
            <button
              onClick={() => setActivePhase("during")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                activePhase === "during" ? "gradient-ocean text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Plane className="w-4 h-4" /> During Trip
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportBeforeTripPDF(data)} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </motion.div>
      )}

      {/* ===== BEFORE TRIP PHASE ===== */}
      {activePhase === "before" && (
        <>
          {hasBeforeTrip && <BeforeTripSection data={data.beforeTrip} />}

          {nearbyPlaces?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Top Recommended Places
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {nearbyPlaces.slice(0, 6).map((place: any, i: number) => <PlaceCard key={i} {...place} />)}
              </div>
            </motion.div>
          )}

          {upcomingEvents?.events?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-accent" /> Local Events During Your Trip
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.events.slice(0, 4).map((ev: any, i: number) => <EventCard key={i} {...ev} />)}
              </div>
            </motion.div>
          )}

          {weatherData?.forecast?.length ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" /> Live Weather Forecast
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

          {/* Day-by-Day Itinerary */}
          <DayByDaySection
            days={data.days}
            activeDay={activeDay}
            dayRefs={dayRefs}
            scrollToDay={scrollToDay}
            groupActivities={groupActivities}
            destinationPhotos={destinationPhotos}
          />

          {!hasBeforeTrip && data.budgetBreakdown && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
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

          {!hasBeforeTrip && data.packingTips?.length ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
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
        </>
      )}

      {/* ===== DURING TRIP PHASE ===== */}
      {activePhase === "during" && (
        <>
          {hasDuringTrip && <DuringTripSection data={data.duringTrip} />}
          <DayByDaySection
            days={data.days}
            activeDay={activeDay}
            dayRefs={dayRefs}
            scrollToDay={scrollToDay}
            groupActivities={groupActivities}
            destinationPhotos={destinationPhotos}
          />
        </>
      )}
    </div>
  );
};

/* ============================================================
   DAY-BY-DAY SECTION with sticky nav + premium day cards
   ============================================================ */
interface DayByDaySectionProps {
  days: ItineraryDay[];
  activeDay: number;
  dayRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  scrollToDay: (dayNum: number) => void;
  groupActivities: (activities: Activity[]) => Record<string, Activity[]>;
  destinationPhotos: any[];
}

const DayByDaySection = ({ days, activeDay, dayRefs, scrollToDay, groupActivities, destinationPhotos }: DayByDaySectionProps) => {
  const navRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      {/* Header */}
      <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        📅 Day-by-Day Itinerary
      </h3>

      {/* Sticky Day Navigation */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 mb-6" ref={navRef}>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {days.map(day => (
            <button
              key={day.day}
              onClick={() => scrollToDay(day.day)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeDay === day.day
                  ? "gradient-ocean text-primary-foreground shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Day Sections */}
      <div className="space-y-10">
        {days.map((day, idx) => (
          <DaySection
            key={day.day}
            day={day}
            idx={idx}
            dayRefs={dayRefs}
            groupActivities={groupActivities}
            destinationPhotos={destinationPhotos}
          />
        ))}
      </div>
    </motion.div>
  );
};

/* ============================================================
   PREMIUM DAY SECTION
   ============================================================ */
interface DaySectionProps {
  day: ItineraryDay;
  idx: number;
  dayRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  groupActivities: (activities: Activity[]) => Record<string, Activity[]>;
  destinationPhotos: any[];
}

const DaySection = ({ day, idx, dayRefs, groupActivities, destinationPhotos }: DaySectionProps) => {
  const grouped = groupActivities(day.activities);
  const dayImage = day.imageUrl || destinationPhotos[idx + 1]?.url || destinationPhotos[idx + 1]?.small;

  return (
    <motion.div
      ref={el => { dayRefs.current[day.day] = el; }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="scroll-mt-32"
    >
      {/* Day Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: "clamp(180px, 28vh, 280px)" }}>
        {dayImage ? (
          <img src={dayImage} alt={day.theme} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
                {new Date(day.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h4 className="font-display text-2xl md:text-3xl font-bold text-white">
                Day {day.day}: {day.theme}
              </h4>
            </div>
            <div className="flex gap-2 shrink-0">
              {day.weather && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium">
                  {weatherIcon(day.weather.condition)} {day.weather.temp}
                </span>
              )}
              {day.dailyBudget != null && day.dailyBudget > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium">
                  <DollarSign className="w-3 h-3" /> ${day.dailyBudget}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weather advisory */}
      {day.weather?.advisory && (
        <div className="text-sm bg-primary/5 text-primary rounded-xl p-3 mb-4 flex items-start gap-2">
          <Cloud className="w-4 h-4 mt-0.5 shrink-0" /> {day.weather.advisory}
        </div>
      )}

      {/* Time-of-day groups */}
      {(["morning", "afternoon", "evening"] as const).map(tod => {
        const acts = grouped[tod];
        if (!acts || acts.length === 0) return null;
        return (
          <div key={tod} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {timeOfDayIcon(tod)}
              <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">{timeOfDayLabel(tod)}</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {acts.map((act, i) => (
                <ActivityCard key={i} activity={act} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Meals */}
      {day.meals && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-accent" />
            <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">Dining</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["breakfast", "lunch", "dinner"] as const).map(meal => {
              const m = day.meals?.[meal];
              if (!m) return null;
              return <MealCard key={meal} meal={m} mealType={meal} />;
            })}
          </div>
        </div>
      )}

      {/* Daily Tip */}
      {day.travelTip && (
        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-4 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <span className="italic">{day.travelTip}</span>
        </div>
      )}
    </motion.div>
  );
};

/* ============================================================
   VISUAL ACTIVITY CARD
   ============================================================ */
const ActivityCard = ({ activity }: { activity: Activity }) => {
  const hasImage = !!activity.imageUrl;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all"
    >
      {/* Activity image */}
      {hasImage && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={activity.imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Type badge */}
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium uppercase tracking-wider">
            {activityIcon(activity.type)} {activity.type}
          </span>
          {/* Time badge */}
          <span className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium">
            {activity.time}
          </span>
        </div>
      )}

      <div className={cn("p-3.5", !hasImage && "pt-4")}>
        {!hasImage && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-primary">
              {activityIcon(activity.type)} {activity.type}
            </span>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
        )}

        <h6 className="font-semibold text-foreground text-sm mb-1 leading-snug">{activity.title}</h6>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{activity.description}</p>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-secondary/60 px-1.5 py-0.5 rounded-md">
            <MapPin className="w-2.5 h-2.5" /> {activity.location}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-secondary/60 px-1.5 py-0.5 rounded-md">
            <Clock className="w-2.5 h-2.5" /> {activity.duration}
          </span>
          {activity.cost > 0 && (
            <span className="text-[10px] text-accent flex items-center gap-0.5 bg-accent/10 px-1.5 py-0.5 rounded-md font-medium">
              <DollarSign className="w-2.5 h-2.5" /> ${activity.cost}
            </span>
          )}
        </div>

        {/* Insider tip */}
        {activity.tip && (
          <div className="mt-2.5 text-[11px] text-primary bg-primary/5 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
            <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" /> {activity.tip}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ============================================================
   MEAL CARD
   ============================================================ */
const MealCard = ({ meal, mealType }: { meal: MealInfo; mealType: string }) => {
  const emoji = mealType === "breakfast" ? "🌅" : mealType === "lunch" ? "☀️" : "🌙";
  const hasImage = !!meal.imageUrl;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card group hover:shadow-sm transition-shadow">
      {hasImage && (
        <div className="h-24 overflow-hidden">
          <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
      )}
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{emoji} {mealType}</p>
        <p className="text-sm font-semibold text-foreground leading-snug">{meal.name}</p>
        <p className="text-xs text-muted-foreground">{meal.cuisine} · {meal.priceRange}</p>
        {meal.location && (
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" /> {meal.location}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIItineraryResult;
