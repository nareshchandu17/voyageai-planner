import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import {
  MapPin, Clock, DollarSign, Sun, CloudRain, Cloud, Snowflake,
  Utensils, Camera, ShoppingBag, Bus, TreePine, PartyPopper,
  Lightbulb, AlertTriangle, Luggage, Ticket, Compass, Plane, Download,
  ChevronRight, ChevronDown, Star, Sunrise, Sunset as SunsetIcon, Moon, Expand, Navigation, Car, TramFront, Footprints, LocateFixed, Loader2, Route, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PlaceCard from "./PlaceCard";
import EventCard from "./EventCard";
import BeforeTripSection from "./BeforeTripSection";
import DuringTripSection from "./DuringTripSection";
import { exportBeforeTripPDF } from "@/lib/exportPDF";
import { cn } from "@/lib/utils";
import { fetchDirectionsSteps, type DirectionsDetail, type DirectionStep, type TravelMode } from "@/lib/streamChat";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
  address?: string;
}

interface RouteEstimate {
  recommendedMode: "walking" | "transit" | "driving";
  durationText: string;
  distanceText: string;
  modes?: Partial<Record<"walking" | "transit" | "driving", { durationText: string; distanceText: string; durationValue: number }>>;
}

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
  coordinates?: Coordinates;
  nextLeg?: RouteEstimate | null;
}

interface MealInfo {
  name: string;
  cuisine: string;
  priceRange: string;
  location: string;
  imageQuery?: string;
  imageUrl?: string;
  coordinates?: Coordinates;
}

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  imageQuery?: string;
  imageUrl?: string;
   mapCenter?: Coordinates;
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

const mapStopStyles = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-primary/15 text-primary",
  "bg-accent/15 text-accent",
];

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
  const [selectedStopKey, setSelectedStopKey] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapDay, setMapDay] = useState<number>(data.days[0]?.day || 1);
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const activityRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { setActivePhase(autoPhase); }, [autoPhase]);
  useEffect(() => { setMapDay(activeDay); }, [activeDay]);

  const hasBeforeTrip = !!data.beforeTrip;
  const hasDuringTrip = !!data.duringTrip;

  const activeMapDayData = useMemo(
    () => data.days.find((day) => day.day === mapDay) || data.days[0],
    [data.days, mapDay],
  );

  const scrollToDay = (dayNum: number) => {
    setActiveDay(dayNum);
    dayRefs.current[dayNum]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectStop = (dayNum: number, stopKey: string) => {
    setActiveDay(dayNum);
    setMapDay(dayNum);
    setSelectedStopKey(stopKey);
    activityRefs.current[stopKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <Button variant="glass" size="sm" onClick={() => setIsMapOpen(true)} className="flex items-center gap-2">
            <Expand className="w-4 h-4" /> Full-Screen Map
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
            selectedStopKey={selectedStopKey}
            setSelectedStopKey={setSelectedStopKey}
            onSelectStop={handleSelectStop}
            activityRefs={activityRefs}
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
            selectedStopKey={selectedStopKey}
            setSelectedStopKey={setSelectedStopKey}
            onSelectStop={handleSelectStop}
            activityRefs={activityRefs}
          />
        </>
      )}

      <FullScreenMapDialog
        open={isMapOpen}
        onOpenChange={setIsMapOpen}
        days={data.days}
        selectedDay={mapDay}
        onSelectDay={(dayNum) => {
          setMapDay(dayNum);
          scrollToDay(dayNum);
        }}
        selectedStopKey={selectedStopKey}
        onSelectStop={handleSelectStop}
        day={activeMapDayData}
      />
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
  selectedStopKey: string | null;
  setSelectedStopKey: (key: string | null) => void;
  onSelectStop: (dayNum: number, stopKey: string) => void;
  activityRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const DayByDaySection = ({ days, activeDay, dayRefs, scrollToDay, groupActivities, destinationPhotos, selectedStopKey, setSelectedStopKey, onSelectStop, activityRefs }: DayByDaySectionProps) => {
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
            selectedStopKey={selectedStopKey}
            setSelectedStopKey={setSelectedStopKey}
            onSelectStop={onSelectStop}
            activityRefs={activityRefs}
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
  selectedStopKey: string | null;
  setSelectedStopKey: (key: string | null) => void;
  onSelectStop: (dayNum: number, stopKey: string) => void;
  activityRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const DaySection = ({ day, idx, dayRefs, groupActivities, destinationPhotos, selectedStopKey, setSelectedStopKey, onSelectStop, activityRefs }: DaySectionProps) => {
  const grouped = groupActivities(day.activities);
  const dayImage = day.imageUrl || destinationPhotos[idx + 1]?.url || destinationPhotos[idx + 1]?.small;
  const mappedActivities = day.activities.filter((activity) => activity.coordinates?.lat && activity.coordinates?.lng);

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

      <DayMapSection day={day} activities={mappedActivities} selectedStopKey={selectedStopKey} onSelectStop={onSelectStop} />

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
              {acts.map((act, i) => {
                const allActs = day.activities;
                const globalIdx = allActs.indexOf(act);
                const nextAct = globalIdx >= 0 && globalIdx < allActs.length - 1 ? allActs[globalIdx + 1] : undefined;
                return (
                <ActivityCard
                  key={i}
                  activity={act}
                  nextActivity={nextAct}
                  stopKey={`day-${day.day}-${act.time}-${act.title}`}
                  selected={selectedStopKey === `day-${day.day}-${act.time}-${act.title}`}
                  onSelect={() => {
                    const stopKey = `day-${day.day}-${act.time}-${act.title}`;
                    setSelectedStopKey(stopKey);
                    onSelectStop(day.day, stopKey);
                  }}
                  cardRef={(el) => { activityRefs.current[`day-${day.day}-${act.time}-${act.title}`] = el; }}
                />
              )})}
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

const getMapCenter = (day: ItineraryDay, activities: Activity[]) => {
  if (day.mapCenter?.lat && day.mapCenter?.lng) {
    return [day.mapCenter.lat, day.mapCenter.lng] as [number, number];
  }

  const firstActivity = activities[0]?.coordinates;
  if (firstActivity?.lat && firstActivity?.lng) {
    return [firstActivity.lat, firstActivity.lng] as [number, number];
  }

  return [20, 0] as [number, number];
};

const RouteBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      return;
    }

    map.fitBounds(points, {
      padding: [36, 36],
      animate: true,
    });
  }, [map, points]);

  return null;
};

/* ============================================================
   TRANSPORT MODE SELECTOR + STEP-BY-STEP DIRECTIONS
   ============================================================ */

/** CO2 emission factors in g/km — average estimates */
const CO2_FACTORS: Record<TravelMode, number> = { walking: 0, transit: 50, driving: 170 };

/** Parse a distance string like "3.2 km" or "1.5 mi" into km */
const parseDistanceKm = (text?: string): number | null => {
  if (!text) return null;
  const match = text.match(/([\d.]+)\s*(km|mi)/i);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return match[2].toLowerCase() === "mi" ? val * 1.60934 : val;
};

/** Returns formatted CO2 string, e.g. "0 g" or "540 g" or "1.2 kg" */
const estimateCO2 = (mode: TravelMode, distanceText?: string): string | null => {
  const km = parseDistanceKm(distanceText);
  if (km === null) return null;
  const grams = Math.round(km * CO2_FACTORS[mode]);
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${grams} g`;
};

const co2Color = (mode: TravelMode) => {
  if (mode === "walking") return "text-green-500";
  if (mode === "transit") return "text-yellow-500";
  return "text-orange-500";
};

const TransportModeSelector = ({ currentMode, modes, onModeChange }: {
  currentMode: TravelMode;
  modes?: Partial<Record<TravelMode, { durationText: string; distanceText: string; durationValue: number }>>;
  onModeChange: (mode: TravelMode) => void;
}) => {
  const available = modes ? (Object.keys(modes) as TravelMode[]) : [];
  if (available.length <= 1) return null;

  return (
    <div className="flex gap-1">
      {(["walking", "transit", "driving"] as const).map(mode => {
        const data = modes?.[mode];
        if (!data) return null;
        const co2 = estimateCO2(mode, data.distanceText);
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
              currentMode === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            )}
          >
            {transportModeIcon(mode)}
            <span>{data.durationText}</span>
            {co2 && (
              <span className={cn("ml-0.5 flex items-center gap-0.5", currentMode === mode ? "text-primary-foreground/80" : co2Color(mode))}>
                <Leaf className="w-2.5 h-2.5" />{co2}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const StepByStepDirections = ({ origin, destination, mode }: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mode: TravelMode;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [directions, setDirections] = useState<DirectionsDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<string>("");

  const fetchKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;

  const loadSteps = useCallback(async () => {
    if (fetchedRef.current === fetchKey) return;
    setLoading(true);
    fetchedRef.current = fetchKey;
    const result = await fetchDirectionsSteps(origin, destination, mode);
    setDirections(result);
    setLoading(false);
  }, [fetchKey, origin, destination, mode]);

  const handleToggle = () => {
    if (!expanded && !directions && fetchedRef.current !== fetchKey) {
      loadSteps();
    }
    setExpanded(prev => !prev);
  };

  // Refetch when mode changes and already expanded
  useEffect(() => {
    if (expanded && fetchedRef.current !== fetchKey) {
      loadSteps();
    }
  }, [expanded, fetchKey, loadSteps]);

  return (
    <div className="mt-1">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
      >
        <Route className="w-3 h-3" />
        {expanded ? "Hide" : "Show"} step-by-step
        <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading directions...
              </div>
            ) : directions?.steps?.length ? (
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {directions.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 text-[11px]">
                    <div className="mt-1 shrink-0">
                      {step.travelMode === "transit" ? (
                        <TramFront className="w-3 h-3 text-accent" />
                      ) : step.travelMode === "walking" ? (
                        <Footprints className="w-3 h-3 text-primary" />
                      ) : (
                        <Car className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground/80">{step.instruction}</p>
                      <div className="flex gap-2 mt-0.5 text-muted-foreground">
                        <span>{step.distance}</span>
                        <span>·</span>
                        <span>{step.duration}</span>
                      </div>
                      {step.transit && (
                        <div className="mt-1 rounded-md bg-accent/10 px-2 py-1 text-[10px] text-accent">
                          🚉 {step.transit.line} ({step.transit.vehicle}) · {step.transit.departureStop} → {step.transit.arrivalStop} · {step.transit.numStops} stops
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-[11px] text-muted-foreground">No step-by-step directions available for this route.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DayMapSection = ({ day, activities, selectedStopKey, onSelectStop }: { day: ItineraryDay; activities: Activity[]; selectedStopKey: string | null; onSelectStop: (dayNum: number, stopKey: string) => void; }) => {
  const routePoints = activities.map((activity) => [activity.coordinates!.lat, activity.coordinates!.lng] as [number, number]);
  const center = getMapCenter(day, activities);
  const [preferredModes, setPreferredModes] = useState<Record<number, TravelMode>>({});

  if (!activities.length) {
    return (
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">Interactive Route Map</h5>
        </div>
        <p className="text-sm text-muted-foreground">Location pins will appear here as soon as this itinerary includes mapped places for the day.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 md:p-5 mb-6 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">Interactive Route Map</h5>
          </div>
          <p className="text-sm text-muted-foreground">Follow the day in sequence with pinned stops and route lines between each location.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity, index) => {
            const stopKey = `day-${day.day}-${activity.time}-${activity.title}`;
            return (
            <span
              key={`${activity.title}-${index}`}
              onClick={() => onSelectStop(day.day, stopKey)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-transform hover:-translate-y-0.5",
                mapStopStyles[index % mapStopStyles.length],
                selectedStopKey === stopKey && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-[10px] font-semibold">
                {index + 1}
              </span>
              {activity.title}
            </span>
          )})}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
        <div className="h-[360px] overflow-hidden rounded-2xl border border-border/50 bg-secondary/30">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RouteBounds points={routePoints} />
            {routePoints.length > 1 && (
              <Polyline positions={routePoints} pathOptions={{ color: "hsl(var(--primary))", weight: 4, opacity: 0.8 }} />
            )}
            {activities.map((activity, index) => {
              const point = activity.coordinates;
              const stopKey = `day-${day.day}-${activity.time}-${activity.title}`;
              if (!point) return null;

              return (
                <CircleMarker
                  key={`${activity.title}-${activity.time}-${index}`}
                  center={[point.lat, point.lng]}
                  eventHandlers={{ click: () => onSelectStop(day.day, stopKey) }}
                  radius={10}
                  pathOptions={{
                    color: selectedStopKey === stopKey ? "hsl(var(--accent))" : "hsl(var(--background))",
                    weight: selectedStopKey === stopKey ? 4 : 2,
                    fillColor: selectedStopKey === stopKey ? "hsl(var(--accent))" : index === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{index + 1}. {activity.title}</p>
                      <p className="text-xs opacity-80">{activity.time} · {activity.location}</p>
                      <p className="text-xs opacity-70">{activity.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => {
            const stopKey = `day-${day.day}-${activity.time}-${activity.title}`;
            const selectedMode = preferredModes[index] || activity.nextLeg?.recommendedMode || "walking";
            const modeData = activity.nextLeg?.modes?.[selectedMode] || (activity.nextLeg ? { durationText: activity.nextLeg.durationText, distanceText: activity.nextLeg.distanceText } : null);
            const nextActivity = activities[index + 1];

            return (
            <div key={`${activity.title}-route-${index}`} className={cn("rounded-2xl border border-border/60 bg-card/80 p-4 transition-all", selectedStopKey === stopKey && "border-primary/60 shadow-lg shadow-primary/10") }>
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", mapStopStyles[index % mapStopStyles.length])}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{activity.location}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                      <Clock className="w-3 h-3" /> {activity.duration}
                    </span>
                    {activity.cost > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-accent">
                        <DollarSign className="w-3 h-3" /> ${activity.cost}
                      </span>
                    )}
                  </div>
                  {index < activities.length - 1 && activity.nextLeg && (
                    <div className="mt-3 space-y-2">
                      {/* Transport mode selector */}
                      <TransportModeSelector
                        currentMode={selectedMode}
                        modes={activity.nextLeg.modes}
                        onModeChange={(mode) => setPreferredModes(prev => ({ ...prev, [index]: mode }))}
                      />
                      {/* Summary for selected mode */}
                      {modeData && (() => {
                        const co2 = estimateCO2(selectedMode, modeData.distanceText);
                        return (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {transportModeIcon(selectedMode)}
                            <span>{selectedMode} · {modeData.durationText} · {modeData.distanceText}</span>
                            {co2 && (
                              <span className={cn("flex items-center gap-0.5 font-medium", co2Color(selectedMode))}>
                                <Leaf className="w-3 h-3" /> {co2} CO₂
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      {/* Step-by-step directions */}
                      {activity.coordinates && nextActivity?.coordinates && (
                        <StepByStepDirections
                          origin={activity.coordinates}
                          destination={nextActivity.coordinates}
                          mode={selectedMode}
                        />
                      )}
                    </div>
                  )}
                  {index < activities.length - 1 && !activity.nextLeg && (
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      Route continues to the next stop
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   VISUAL ACTIVITY CARD
   ============================================================ */
const transportModeIcon = (mode: RouteEstimate["recommendedMode"]) => {
  if (mode === "walking") return <Footprints className="w-3 h-3 text-primary" />;
  if (mode === "transit") return <TramFront className="w-3 h-3 text-primary" />;
  return <Car className="w-3 h-3 text-primary" />;
};

const RouteLegDisplay = ({ activity, nextActivity }: { activity: Activity; nextActivity?: Activity }) => {
  const [selectedMode, setSelectedMode] = useState<TravelMode>(activity.nextLeg?.recommendedMode || "walking");
  const modeData = activity.nextLeg?.modes?.[selectedMode];

  return (
    <div className="mt-2.5 space-y-1.5">
      <TransportModeSelector
        currentMode={selectedMode}
        modes={activity.nextLeg?.modes}
        onModeChange={setSelectedMode}
      />
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
          {transportModeIcon(selectedMode)} {selectedMode}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
          <Navigation className="w-3 h-3 text-primary" /> {modeData?.durationText || activity.nextLeg?.durationText}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
          <LocateFixed className="w-3 h-3 text-primary" /> {modeData?.distanceText || activity.nextLeg?.distanceText}
        </span>
      </div>
      {activity.coordinates && nextActivity?.coordinates && (
        <StepByStepDirections
          origin={activity.coordinates}
          destination={nextActivity.coordinates}
          mode={selectedMode}
        />
      )}
    </div>
  );
};

const ActivityCard = ({ activity, stopKey, selected, onSelect, cardRef, nextActivity }: { activity: Activity; stopKey: string; selected: boolean; onSelect: () => void; cardRef: (el: HTMLDivElement | null) => void; nextActivity?: Activity }) => {
  const hasImage = !!activity.imageUrl;

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={cn("group relative cursor-pointer rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all", selected && "border-primary/60 shadow-lg shadow-primary/10 ring-2 ring-primary/20")}
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

        {activity.nextLeg && (
          <RouteLegDisplay activity={activity} nextActivity={nextActivity} />
        )}
      </div>
    </motion.div>
  );
};

const FullScreenMapDialog = ({
  open,
  onOpenChange,
  days,
  selectedDay,
  onSelectDay,
  selectedStopKey,
  onSelectStop,
  day,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: ItineraryDay[];
  selectedDay: number;
  onSelectDay: (dayNum: number) => void;
  selectedStopKey: string | null;
  onSelectStop: (dayNum: number, stopKey: string) => void;
  day: ItineraryDay;
}) => {
  const selectedIndex = Math.max(0, days.findIndex((item) => item.day === selectedDay));
  const mappedActivities = day?.activities.filter((activity) => activity.coordinates?.lat && activity.coordinates?.lng) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] h-[92vh] p-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-border/60 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <DialogTitle className="font-display text-2xl text-foreground">Immersive Trip Navigator</DialogTitle>
                <DialogDescription>Switch days, scrub the journey timeline, and tap pins to jump to the matching itinerary card.</DialogDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((item) => (
                  <Button
                    key={item.day}
                    variant={selectedDay === item.day ? "ocean" : "outline"}
                    size="sm"
                    onClick={() => onSelectDay(item.day)}
                  >
                    Day {item.day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Timeline scrubber</p>
                <Slider
                  value={[selectedIndex]}
                  min={0}
                  max={Math.max(days.length - 1, 0)}
                  step={1}
                  onValueChange={(value) => onSelectDay(days[value[0]]?.day || days[0]?.day || 1)}
                />
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current focus</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Day {day?.day}: {day?.theme}</p>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
            <div className="overflow-y-auto border-b border-border/60 p-5 lg:border-b-0 lg:border-r">
              <div className="space-y-3">
                {mappedActivities.map((activity) => {
                  const stopKey = `day-${day.day}-${activity.time}-${activity.title}`;
                  return (
                    <button
                      key={stopKey}
                      onClick={() => onSelectStop(day.day, stopKey)}
                      className={cn("w-full rounded-2xl border border-border/60 bg-card/80 p-4 text-left transition-all hover:border-primary/40", selectedStopKey === stopKey && "border-primary/60 shadow-lg shadow-primary/10")}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.location}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2.5 py-1">{activity.duration}</span>
                        {activity.nextLeg && <span className="rounded-full bg-secondary px-2.5 py-1">{activity.nextLeg.durationText}</span>}
                        {activity.nextLeg && <span className="rounded-full bg-secondary px-2.5 py-1">{activity.nextLeg.distanceText}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 p-5">
              <DayMapSection day={day} activities={mappedActivities} selectedStopKey={selectedStopKey} onSelectStop={onSelectStop} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
