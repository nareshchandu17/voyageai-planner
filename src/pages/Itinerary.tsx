import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, DollarSign, UtensilsCrossed, Camera, Bus, ChevronDown, ChevronUp,
  Sun, Sunset as SunsetIcon, Moon, ArrowLeft, Loader2, Star, Sparkles, Heart,
  Lightbulb, AlertTriangle, Accessibility, Users, Download, Navigation, Calendar as CalIcon,
  FileDown, Map as MapIcon, Cloud, CloudRain, Snowflake, Ticket, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  buildGoogleMapsRoute, buildAppleMapsRoute, buildICS, buildMarkdown, downloadBlob,
} from "@/lib/itineraryExports";
import { exportBeforeTripPDF } from "@/lib/exportPDF";
import DayRouteMap from "@/components/itinerary/DayRouteMap";
import { toast } from "sonner";

interface Activity {
  id?: string;
  time?: string;
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  address?: string;
  duration?: string;
  cost?: number;
  type?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  ticketPrice?: string;
  bestTimeToVisit?: string;
  crowdLevel?: string;
  hiddenGem?: boolean;
  whyVisit?: string;
  localSecret?: string;
  photoTip?: string;
  commonMistake?: string;
  accessibility?: string;
  tip?: string;
  imageQuery?: string;
  imageUrl?: string;
  gallery?: string[];
  period?: "morning" | "afternoon" | "evening";
}

interface Meal {
  name?: string;
  cuisine?: string;
  priceRange?: string;
  location?: string;
  famousFor?: string;
  vegetarianOptions?: boolean;
  imageQuery?: string;
  imageUrl?: string;
}

interface DayData {
  day: number;
  date?: string;
  theme?: string;
  neighborhoodFocus?: string;
  imageQuery?: string;
  imageUrl?: string;
  weather?: { condition?: string; temp?: string; advisory?: string };
  activities: Activity[];
  meals?: { breakfast?: Meal; lunch?: Meal; dinner?: Meal };
  hiddenGems?: { name: string; why?: string; imageQuery?: string; imageUrl?: string }[];
  transportPlan?: string;
  dailyBudget?: number;
  travelTip?: string;
  companionInsight?: string;
  companionInsights?: { morning?: string; afternoon?: string; evening?: string };
}

const periodIcons = { morning: Sun, afternoon: SunsetIcon, evening: Moon } as const;
const typeIcons: Record<string, any> = {
  attraction: Camera, restaurant: UtensilsCrossed, food: UtensilsCrossed,
  transport: Bus, transit: Bus, shopping: MapPin, nightlife: Moon,
  photo_spot: Camera, hidden_gem: Sparkles, free: Compass,
};
const weatherIcons: Record<string, any> = {
  sunny: Sun, clear: Sun, rainy: CloudRain, rain: CloudRain, cloudy: Cloud, snow: Snowflake,
};

const inferPeriod = (time?: string): "morning" | "afternoon" | "evening" => {
  if (!time) return "morning";
  const h = parseInt(time.split(":")[0] || "0", 10);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

const crowdColor = (lvl?: string) => {
  if (!lvl) return "";
  const l = lvl.toLowerCase();
  if (l.includes("low")) return "bg-green-500/15 text-green-600 dark:text-green-400";
  if (l.includes("high")) return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
  return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
};

const Itinerary = () => {
  const [params] = useSearchParams();
  const tripId = params.get("id");
  const { user, isLoading: authLoading } = useAuth();
  const { trips, loading } = useTrips();
  const [expandedDay, setExpandedDay] = useState(1);
  const [galleries, setGalleries] = useState<Record<string, string[]>>({});

  const trip = useMemo(() => {
    if (!trips.length) return null;
    if (tripId) return trips.find((t) => t.id === tripId) || null;
    return trips.find((t) => t.status === "active") || trips.find((t) => t.status === "planned") || trips[0];
  }, [trips, tripId]);

  const days: DayData[] = useMemo(() => {
    const raw = (trip?.itinerary_data as any)?.days || (trip?.itinerary_data as any)?.itinerary || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((d: any, i: number) => ({
      day: d.day ?? i + 1,
      date: d.date || d.title,
      theme: d.theme,
      neighborhoodFocus: d.neighborhoodFocus,
      imageQuery: d.imageQuery,
      weather: d.weather,
      transportPlan: d.transportPlan,
      dailyBudget: d.dailyBudget,
      travelTip: d.travelTip,
      companionInsight: d.companionInsight,
      companionInsights: d.companionInsights,
      meals: d.meals,
      hiddenGems: d.hiddenGems || [],
      activities: (d.activities || d.items || []).map((a: any, j: number) => ({
        id: a.id || `${i}-${j}`,
        time: a.time,
        title: a.title || a.name,
        description: a.description,
        location: a.location,
        address: a.address,
        duration: a.duration,
        cost: typeof a.cost === "number" ? a.cost : typeof a.price === "number" ? a.price : 0,
        type: a.type || a.category || "activity",
        category: a.category,
        rating: a.rating,
        reviewCount: a.reviewCount,
        openingHours: a.openingHours,
        ticketPrice: a.ticketPrice,
        bestTimeToVisit: a.bestTimeToVisit,
        crowdLevel: a.crowdLevel,
        hiddenGem: a.hiddenGem,
        whyVisit: a.whyVisit,
        localSecret: a.localSecret,
        photoTip: a.photoTip,
        commonMistake: a.commonMistake,
        accessibility: a.accessibility,
        tip: a.tip,
        imageQuery: a.imageQuery,
        imageUrl: a.imageUrl,
        period: a.period || inferPeriod(a.time),
      })),
    }));
  }, [trip]);

  // Fetch multi-source galleries for activities + meals lazily
  useEffect(() => {
    if (!days.length) return;
    const queries = new Set<string>();
    for (const d of days) {
      if (d.imageQuery) queries.add(d.imageQuery);
      for (const a of d.activities) if (a.imageQuery) queries.add(a.imageQuery);
      const m = d.meals;
      if (m?.breakfast?.imageQuery) queries.add(m.breakfast.imageQuery);
      if (m?.lunch?.imageQuery) queries.add(m.lunch.imageQuery);
      if (m?.dinner?.imageQuery) queries.add(m.dinner.imageQuery);
      for (const g of d.hiddenGems || []) if (g.imageQuery) queries.add(g.imageQuery);
    }
    const list = Array.from(queries).slice(0, 60);
    if (!list.length) return;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("unsplash-batch", {
          body: { queries: list, perQuery: 4 },
        });
        if (error) return;
        const gal = (data?.galleries || {}) as Record<string, any[]>;
        const map: Record<string, string[]> = {};
        for (const [q, photos] of Object.entries(gal)) {
          map[q] = (photos || []).map((p: any) => p.url).filter(Boolean);
        }
        setGalleries(map);
      } catch {/* noop */}
    })();
  }, [days]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!trip) return <Navigate to="/dashboard" replace />;

  const totalActivities = days.flatMap((d) => d.activities).length;
  const spent = days.flatMap((d) => d.activities).reduce((s, a) => s + (a.cost || 0), 0);
  const totalBudget = Number(trip.budget) || 0;
  const heroImage = trip.image_url || (trip.destination_photos as any)?.[0]?.url || "/placeholder.svg";
  const beforeTrip = (trip.itinerary_data as any)?.beforeTrip;
  const tiers = beforeTrip?.budgetEstimation?.tiers;
  const hotels = beforeTrip?.hotelRecommendations || [];

  const handleExport = async (kind: "gmaps" | "apple" | "ics" | "md" | "pdf") => {
    const dayExport = days.map((d) => ({
      day: d.day, date: d.date, theme: d.theme,
      activities: d.activities.map((a) => ({
        time: a.time, title: a.title, name: a.title, location: a.location,
        address: a.address, description: a.description, duration: a.duration,
      })),
    }));
    const allActs = dayExport.flatMap((d) => d.activities);
    if (kind === "gmaps") {
      const url = buildGoogleMapsRoute(allActs);
      if (url) window.open(url, "_blank"); else toast.error("No mappable activities");
    } else if (kind === "apple") {
      const url = buildAppleMapsRoute(allActs);
      if (url) window.open(url, "_blank"); else toast.error("No mappable activities");
    } else if (kind === "ics") {
      const ics = buildICS(trip.title || trip.destination, dayExport);
      downloadBlob(`${trip.destination}.ics`, "text/calendar", ics);
      toast.success("Calendar file downloaded");
    } else if (kind === "md") {
      const md = buildMarkdown(trip.title || trip.destination, trip.destination, dayExport);
      downloadBlob(`${trip.destination}.md`, "text/markdown", md);
      toast.success("Markdown downloaded");
    } else if (kind === "pdf") {
      try {
        const data: any = trip.itinerary_data || {};
        exportBeforeTripPDF({
          title: data.title || trip.title || trip.destination,
          summary: data.summary || "",
          totalBudgetEstimate: data.totalBudgetEstimate,
          currency: data.currency || trip.currency,
          beforeTrip: data.beforeTrip,
          days: data.days || [],
          warnings: data.warnings,
        });
      } catch { toast.error("PDF export failed"); }
    }
  };

  const renderActivity = (a: Activity, dayIdx: number) => {
    const Icon = typeIcons[a.type || "activity"] || MapPin;
    const gallery = (a.imageQuery && galleries[a.imageQuery]) || [];
    const cover = a.imageUrl || gallery[0];
    return (
      <motion.div
        key={a.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-secondary/40 hover:bg-secondary/60 transition rounded-2xl overflow-hidden border border-border/40"
      >
        {cover && (
          <div className="relative h-44 sm:h-52 overflow-hidden">
            <img src={cover} alt={a.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {a.hiddenGem && (
                <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur"><Sparkles className="w-3 h-3 mr-1" />Hidden gem</Badge>
              )}
              {a.category && (
                <Badge variant="secondary" className="backdrop-blur bg-background/70">{a.category}</Badge>
              )}
              {a.crowdLevel && (
                <Badge className={`backdrop-blur border-0 ${crowdColor(a.crowdLevel)}`}>
                  <Users className="w-3 h-3 mr-1" />{a.crowdLevel} crowd
                </Badge>
              )}
            </div>
            {a.rating && (
              <div className="absolute top-3 right-3 bg-background/80 backdrop-blur rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{a.rating}
                {a.reviewCount && <span className="text-muted-foreground font-normal">({a.reviewCount.toLocaleString()})</span>}
              </div>
            )}
            {gallery.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                {gallery.slice(1, 5).map((g, i) => (
                  <div key={i} className="w-8 h-8 rounded-md overflow-hidden border-2 border-background/80 shadow">
                    <img src={g} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-2">
            {!cover && (
              <div className="w-9 h-9 rounded-lg bg-ocean-lighter flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-ocean" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-display font-semibold text-foreground leading-snug">{a.title}</h4>
                {(a.cost || 0) > 0 && <span className="text-xs font-medium text-sunset shrink-0">{trip.currency} {a.cost}</span>}
              </div>
              {a.location && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</p>}
            </div>
          </div>

          {a.description && <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>}

          <div className="flex gap-3 mt-3 flex-wrap text-xs text-muted-foreground">
            {a.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>}
            {a.duration && <span>· {a.duration}</span>}
            {a.openingHours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.openingHours}</span>}
            {a.ticketPrice && <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{a.ticketPrice}</span>}
            {a.bestTimeToVisit && <span className="flex items-center gap-1"><Sun className="w-3 h-3" />{a.bestTimeToVisit}</span>}
          </div>

          {/* Concierge insight stack */}
          {(a.whyVisit || a.localSecret || a.photoTip || a.commonMistake || a.accessibility) && (
            <div className="mt-3 space-y-1.5">
              {a.whyVisit && (
                <div className="flex gap-2 text-xs"><Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /><span><span className="font-medium text-foreground">Why visit:</span> <span className="text-muted-foreground">{a.whyVisit}</span></span></div>
              )}
              {a.localSecret && (
                <div className="flex gap-2 text-xs"><Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /><span><span className="font-medium text-foreground">Local secret:</span> <span className="text-muted-foreground">{a.localSecret}</span></span></div>
              )}
              {a.photoTip && (
                <div className="flex gap-2 text-xs"><Camera className="w-3.5 h-3.5 text-ocean shrink-0 mt-0.5" /><span><span className="font-medium text-foreground">Photo tip:</span> <span className="text-muted-foreground">{a.photoTip}</span></span></div>
              )}
              {a.commonMistake && (
                <div className="flex gap-2 text-xs"><AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /><span><span className="font-medium text-foreground">Avoid:</span> <span className="text-muted-foreground">{a.commonMistake}</span></span></div>
              )}
              {a.accessibility && (
                <div className="flex gap-2 text-xs"><Accessibility className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span><span className="font-medium text-foreground">Accessibility:</span> <span className="text-muted-foreground">{a.accessibility}</span></span></div>
              )}
            </div>
          )}

          {(a.location || a.address) && (
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address || a.location || "")}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-ocean hover:underline"
              >
                <Navigation className="w-3 h-3" />Open in Maps
              </a>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderMeal = (label: string, meal?: Meal) => {
    if (!meal?.name) return null;
    const gallery = (meal.imageQuery && galleries[meal.imageQuery]) || [];
    const cover = meal.imageUrl || gallery[0];
    return (
      <div className="bg-secondary/40 rounded-xl overflow-hidden border border-border/40">
        {cover && <img src={cover} alt={meal.name} loading="lazy" className="w-full h-28 object-cover" />}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-sunset" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
          </div>
          <p className="font-medium text-sm text-foreground leading-tight">{meal.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {[meal.cuisine, meal.priceRange, meal.location].filter(Boolean).join(" · ")}
          </p>
          {meal.famousFor && <p className="text-xs text-muted-foreground mt-1 italic">★ {meal.famousFor}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <div className="relative h-72 sm:h-96">
        <img src={heroImage} alt={trip.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-20 left-4 sm:left-6 right-4 flex justify-between items-center gap-2">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground bg-background/60 backdrop-blur px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="backdrop-blur bg-background/70"><Download className="w-4 h-4 mr-1.5" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleExport("gmaps")}><MapIcon className="w-4 h-4 mr-2" />Open route in Google Maps</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("apple")}><MapIcon className="w-4 h-4 mr-2" />Open in Apple Maps</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("ics")}><CalIcon className="w-4 h-4 mr-2" />Add to Calendar (.ics)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}><FileDown className="w-4 h-4 mr-2" />Download Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}><FileDown className="w-4 h-4 mr-2" />Download PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground">{trip.destination}</h1>
          <p className="text-muted-foreground mt-1">
            {trip.duration || `${days.length} day${days.length > 1 ? "s" : ""}`} · {trip.group_size} traveler{trip.group_size > 1 ? "s" : ""}
            {trip.styles?.length ? ` · ${trip.styles.slice(0, 3).join(", ")}` : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Days", value: String(days.length || trip.duration || "—"), icon: Clock },
            { label: "Activities", value: String(totalActivities), icon: MapPin },
            { label: "Budget", value: totalBudget ? `${trip.currency} ${totalBudget}` : "—", icon: DollarSign },
            { label: "Estimated", value: `${trip.currency} ${spent}`, icon: DollarSign },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <s.icon className="w-5 h-5 text-ocean mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Budget tiers */}
        {tiers && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {(["budget", "midRange", "luxury"] as const).map((k) => {
              const t = tiers[k];
              if (!t) return null;
              const labels: any = { budget: "Budget", midRange: "Mid-range", luxury: "Luxury" };
              return (
                <div key={k} className="glass-card p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{labels[k]}</p>
                  <p className="text-xl font-display font-bold text-foreground mt-1">{trip.currency} {t.daily}/day</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Days */}
        {days.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-muted-foreground mb-4">No itinerary yet for this trip.</p>
            <Link to="/plan"><Button>Plan with AI</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const isOpen = expandedDay === day.day;
              const WIcon = weatherIcons[(day.weather?.condition || "").toLowerCase()] || Sun;
              return (
                <motion.div key={day.day} layout className="glass-card overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(isOpen ? 0 : day.day)}
                    className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl gradient-ocean flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {day.day}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-foreground truncate">
                          {day.theme || `Day ${day.day}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                          {day.date && <span>{day.date}</span>}
                          {day.neighborhoodFocus && <span>· 📍 {day.neighborhoodFocus}</span>}
                          {day.weather?.condition && (
                            <span className="inline-flex items-center gap-1">· <WIcon className="w-3 h-3" />{day.weather.condition}{day.weather.temp ? `, ${day.weather.temp}` : ""}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {day.activities.length} stops · {trip.currency} {day.dailyBudget ?? day.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                      </span>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-5">
                          {/* Companion strip */}
                          {(day.companionInsight || day.transportPlan || day.travelTip) && (
                            <div className="grid sm:grid-cols-2 gap-3">
                              {day.companionInsight && (
                                <div className="bg-ocean/5 border border-ocean/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1"><Sparkles className="w-3.5 h-3.5 text-ocean" /><span className="text-xs font-medium text-foreground">Personalized for you</span></div>
                                  <p className="text-xs text-muted-foreground">{day.companionInsight}</p>
                                </div>
                              )}
                              {day.transportPlan && (
                                <div className="bg-secondary/40 border border-border/40 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1"><Bus className="w-3.5 h-3.5 text-foreground" /><span className="text-xs font-medium text-foreground">Getting around</span></div>
                                  <p className="text-xs text-muted-foreground">{day.transportPlan}</p>
                                </div>
                              )}
                              {day.travelTip && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs font-medium text-foreground">Day tip</span></div>
                                  <p className="text-xs text-muted-foreground">{day.travelTip}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Interactive day route map */}
                          {day.activities.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapIcon className="w-4 h-4 text-ocean" />
                                <span className="text-sm font-display font-semibold text-foreground">Day route</span>
                                <span className="text-xs text-muted-foreground">· optimized stops & segments</span>
                              </div>
                              <DayRouteMap
                                destination={trip.destination}
                                stops={day.activities.map((a) => ({
                                  title: a.title || a.name,
                                  location: a.location,
                                  address: a.address,
                                  time: a.time,
                                }))}
                              />
                            </div>
                          )}

                          {/* Periods */}
                          {(["morning", "afternoon", "evening"] as const).map((period) => {
                            const acts = day.activities.filter((a) => a.period === period);
                            if (!acts.length && !day.companionInsights?.[period]) return null;
                            const PeriodIcon = periodIcons[period];
                            const insight = day.companionInsights?.[period];
                            return (
                              <div key={period}>
                                <div className="flex items-center gap-2 mb-3">
                                  <PeriodIcon className="w-4 h-4 text-sunset" />
                                  <span className="text-sm font-display font-semibold text-foreground capitalize">{period}</span>
                                </div>
                                {insight && (
                                  <div className="mb-3 text-xs text-muted-foreground italic border-l-2 border-ocean/40 pl-3">{insight}</div>
                                )}
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {acts.map((a) => renderActivity(a, day.day))}
                                </div>
                              </div>
                            );
                          })}

                          {/* Meals */}
                          {(day.meals?.breakfast || day.meals?.lunch || day.meals?.dinner) && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <UtensilsCrossed className="w-4 h-4 text-sunset" />
                                <span className="text-sm font-display font-semibold text-foreground">Where to eat</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {renderMeal("Breakfast", day.meals?.breakfast)}
                                {renderMeal("Lunch", day.meals?.lunch)}
                                {renderMeal("Dinner", day.meals?.dinner)}
                              </div>
                            </div>
                          )}

                          {/* Hidden gems */}
                          {day.hiddenGems && day.hiddenGems.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-display font-semibold text-foreground">Hidden gems for today</span>
                              </div>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {day.hiddenGems.map((g, i) => (
                                  <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                    <p className="text-sm font-medium text-foreground">{g.name}</p>
                                    {g.why && <p className="text-xs text-muted-foreground mt-0.5">{g.why}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Day route shortcut */}
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="outline"
                              onClick={() => {
                                const url = buildGoogleMapsRoute(day.activities.map((a) => ({
                                  title: a.title, location: a.location, address: a.address,
                                })));
                                if (url) window.open(url, "_blank");
                              }}
                            >
                              <Navigation className="w-3.5 h-3.5 mr-1.5" />Route this day
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Hotel recommendations */}
        {hotels.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-display font-bold mb-4">Where to stay</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.slice(0, 6).map((h: any, i: number) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-display font-semibold text-foreground">{h.name}</p>
                    {h.rating && <span className="text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{h.rating}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{[h.category, h.neighborhood, h.priceRange].filter(Boolean).join(" · ")}</p>
                  {h.whyStay && <p className="text-sm text-muted-foreground mt-2">{h.whyStay}</p>}
                  {h.amenities?.length && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.amenities.slice(0, 5).map((am: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">{am}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
