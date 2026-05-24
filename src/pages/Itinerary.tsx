import { useMemo, useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Clock, DollarSign, UtensilsCrossed, Camera, Bus,
  ChevronDown, ChevronUp, Sun, Sunset, Moon, ArrowLeft, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";

interface Activity {
  id?: string;
  time?: string;
  name?: string;
  title?: string;
  type?: string;
  category?: string;
  duration?: string;
  cost?: number;
  price?: number;
  description?: string;
  period?: "morning" | "afternoon" | "evening";
}

const typeIcons: Record<string, any> = {
  visit: Camera, sightseeing: Camera, food: UtensilsCrossed, dining: UtensilsCrossed,
  activity: MapPin, experience: MapPin, transport: Bus, transit: Bus,
};
const periodIcons = { morning: Sun, afternoon: Sunset, evening: Moon } as const;

const inferPeriod = (time?: string): "morning" | "afternoon" | "evening" => {
  if (!time) return "morning";
  const h = parseInt(time.split(":")[0] || "0", 10);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

const Itinerary = () => {
  const [params] = useSearchParams();
  const tripId = params.get("id");
  const { user, isLoading: authLoading } = useAuth();
  const { trips, loading } = useTrips();
  const [expandedDay, setExpandedDay] = useState(1);

  const trip = useMemo(() => {
    if (!trips.length) return null;
    if (tripId) return trips.find((t) => t.id === tripId) || null;
    return trips.find((t) => t.status === "active") || trips.find((t) => t.status === "planned") || trips[0];
  }, [trips, tripId]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!trip) return <Navigate to="/dashboard" replace />;

  const days: { day: number; date: string; activities: Activity[] }[] = (() => {
    const raw = (trip.itinerary_data as any)?.days || (trip.itinerary_data as any)?.itinerary || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((d: any, i: number) => ({
      day: d.day ?? i + 1,
      date: d.title || d.date || `Day ${i + 1}`,
      activities: (d.activities || d.items || []).map((a: any, j: number) => ({
        id: a.id || `${i}-${j}`,
        time: a.time,
        name: a.name || a.title,
        description: a.description,
        type: a.type || a.category || "activity",
        duration: a.duration,
        cost: typeof a.cost === "number" ? a.cost : typeof a.price === "number" ? a.price : 0,
        period: a.period || inferPeriod(a.time),
      })),
    }));
  })();

  const spent = days.flatMap((d) => d.activities).reduce((s, a) => s + (a.cost || 0), 0);
  const totalBudget = Number(trip.budget) || 0;
  const heroImage = trip.image_url || (trip.destination_photos as any)?.[0]?.url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative h-64 sm:h-80">
        <img src={heroImage} alt={trip.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-20 left-4 sm:left-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground bg-background/60 backdrop-blur px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">{trip.destination}</h1>
          <p className="text-muted-foreground">
            {trip.duration || `${days.length} days`} · {trip.group_size} traveler{trip.group_size > 1 ? "s" : ""}
            {trip.styles?.length ? ` · ${trip.styles.slice(0, 2).join(", ")}` : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Days", value: String(days.length || trip.duration || "—"), icon: Clock },
            { label: "Activities", value: String(days.flatMap((d) => d.activities).length), icon: MapPin },
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

        {totalBudget > 0 && (
          <div className="glass-card p-5 mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Budget Progress</span>
              <span className="font-medium text-foreground">{trip.currency} {spent} / {totalBudget}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-ocean rounded-full transition-all duration-500"
                style={{ width: `${Math.min((spent / totalBudget) * 100, 100)}%` }} />
            </div>
          </div>
        )}

        {days.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-muted-foreground mb-4">No itinerary yet for this trip.</p>
            <Link to="/plan"><Button>Plan with AI</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <motion.div key={day.day} layout className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                  className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {day.day}
                    </div>
                    <span className="font-display font-semibold text-foreground text-left">{day.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {trip.currency} {day.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                    </span>
                    {expandedDay === day.day ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {expandedDay === day.day && (
                  <div className="px-5 pb-5">
                    {(["morning", "afternoon", "evening"] as const).map((period) => {
                      const acts = day.activities.filter((a) => a.period === period);
                      if (!acts.length) return null;
                      const PeriodIcon = periodIcons[period];
                      return (
                        <div key={period} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <PeriodIcon className="w-4 h-4 text-sunset" />
                            <span className="text-sm font-medium text-foreground capitalize">{period}</span>
                          </div>
                          <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                            {acts.map((activity) => {
                              const Icon = typeIcons[activity.type || "activity"] || MapPin;
                              return (
                                <div key={activity.id} className="bg-secondary/50 rounded-xl p-4">
                                  <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-ocean-lighter flex items-center justify-center shrink-0">
                                      <Icon className="w-4 h-4 text-ocean" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-medium text-sm text-foreground">{activity.name}</h4>
                                      {activity.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                      )}
                                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                        {activity.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.time}</span>}
                                        {activity.duration && <span>{activity.duration}</span>}
                                        {(activity.cost || 0) > 0 && <span className="text-sunset font-medium">{trip.currency} {activity.cost}</span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
