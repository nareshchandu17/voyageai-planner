import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus, MapPin, Calendar, ArrowRight, Compass, Plane, Clock,
  Star, Camera, BookOpen, DollarSign, CheckCircle2, CloudSun,
  Luggage, FileText, Bus, Utensils, Sparkles, Shield, Hotel,
  Navigation, Eye, Heart, Play, ChevronRight, Globe, Map,
  ArrowRightCircle, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";
import WidgetDetailModal from "@/components/WidgetDetailModal";
import CompletedTripDetail from "@/components/CompletedTripDetail";
import heroTravel from "@/assets/hero-travel.jpg";
import { toast } from "sonner";

type TripTab = "planned" | "active" | "completed";

const tabConfig: { key: TripTab; label: string; icon: typeof Compass }[] = [
  { key: "planned", label: "Planned", icon: Compass },
  { key: "active", label: "Active", icon: Play },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const nextStatus: Record<string, "planned" | "active" | "completed"> = {
  planned: "active",
  active: "completed",
  completed: "planned",
};

const statusLabel: Record<string, string> = {
  planned: "Start Trip",
  active: "Complete Trip",
  completed: "Re-plan",
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TripTab>("planned");
  const { user } = useAuth();
  const { planned, active, completed, loading, updateStatus, updateTrip, fetchTrips } = useTrips();
  const navigate = useNavigate();

  const counts = { planned: planned.length, active: active.length, completed: completed.length };
  const totalTrips = planned.length + active.length + completed.length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-card p-12 max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-6">
            <Plane className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Sign in to view your trips</h2>
          <p className="text-muted-foreground mb-6">Create an account to save and manage your travel plans.</p>
          <Link to="/auth"><Button variant="ocean" size="lg">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[320px] sm:h-[380px] overflow-hidden">
        <motion.img src={heroTravel} alt="My Trips" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        <div className="absolute inset-0 flex flex-col items-start justify-end container mx-auto px-4 sm:px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3"><Globe className="w-5 h-5 text-white/70" /><span className="text-white/70 text-sm font-body tracking-wide">Travel Intelligence</span></div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">My Trips</h1>
            <p className="text-white/60 font-body mt-2 max-w-md">Manage your travel journeys from planning to memories.</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20">
        {/* Stats */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          {[
            { label: "Total Trips", value: String(totalTrips), icon: Plane, gradient: "gradient-ocean" },
            { label: "Active Now", value: String(active.length), icon: Play, gradient: "gradient-sunset" },
            { label: "Planned", value: String(planned.length), icon: Compass, gradient: "gradient-ocean" },
            { label: "Completed", value: String(completed.length), icon: CheckCircle2, gradient: "gradient-sunset" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4 hover-lift">
              <div className={`w-11 h-11 rounded-xl ${stat.gradient} flex items-center justify-center shrink-0`}><stat.icon className="w-5 h-5 text-primary-foreground" /></div>
              <div><p className="text-2xl font-display font-bold text-foreground">{stat.value}</p><p className="text-xs text-muted-foreground font-body">{stat.label}</p></div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="inline-flex bg-secondary/80 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
            {tabConfig.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-300", activeTab === tab.key ? "gradient-ocean text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}>
                <tab.icon className="w-4 h-4" /> {tab.label}
                <span className={cn("w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold", activeTab === tab.key ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>{counts[tab.key]}</span>
              </button>
            ))}
          </div>
          <Link to="/plan"><Button variant="ocean" className="shadow-lg"><Plus className="w-4 h-4" /> New Trip</Button></Link>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              {activeTab === "planned" && <TripGrid trips={planned} tab="planned" updateStatus={updateStatus} navigate={navigate} />}
              {activeTab === "active" && <TripGrid trips={active} tab="active" updateStatus={updateStatus} navigate={navigate} />}
              {activeTab === "completed" && <TripGrid trips={completed} tab="completed" updateStatus={updateStatus} navigate={navigate} onStoryGenerated={async () => { await fetchTrips(); }} />}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Quick Links */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          {[
            { title: "Plan a Trip", desc: "AI-powered itinerary builder", icon: Plane, to: "/plan", gradient: "gradient-ocean" },
            { title: "Discover", desc: "Explore curated experiences", icon: Compass, to: "/discover", gradient: "gradient-sunset" },
            { title: "Travel Blog", desc: "Stories & inspiration", icon: BookOpen, to: "/blog", gradient: "gradient-ocean" },
          ].map((link, i) => (
            <Link key={i} to={link.to} className="group glass-card p-5 flex items-center gap-4 hover-lift">
              <div className={`w-11 h-11 rounded-xl ${link.gradient} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}><link.icon className="w-5 h-5 text-primary-foreground" /></div>
              <div className="flex-1"><h4 className="font-display font-semibold text-foreground text-sm">{link.title}</h4><p className="text-xs text-muted-foreground font-body">{link.desc}</p></div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// TRIP GRID — handles all three tabs
// ═══════════════════════════════════════
const TripGrid = ({ trips, tab, updateStatus, navigate, onStoryGenerated }: {
  trips: Trip[];
  tab: TripTab;
  updateStatus: (id: string, status: "planned" | "active" | "completed") => Promise<boolean>;
  navigate: (path: string) => void;
  onStoryGenerated?: (tripId: string, story: string) => void;
}) => {
  const [widgetModal, setWidgetModal] = useState<{ open: boolean; title: string; icon: any; items: any[] }>({ open: false, title: "", icon: "restaurants", items: [] });

  if (!trips.length) return <EmptyState tab={tab} />;

  const handleStatusChange = async (trip: Trip) => {
    const next = nextStatus[trip.status];
    const ok = await updateStatus(trip.id, next);
    if (ok) toast.success(`Trip moved to ${next}`);
  };

  const openWidget = (title: string, icon: any, trip: Trip) => {
    const itinerary = trip.itinerary_data;
    let items: any[] = [];

    if (icon === "restaurants" && itinerary?.duringTrip?.restaurants) {
      items = itinerary.duringTrip.restaurants.map((r: any) => ({ name: r.name, rating: r.rating, distance: r.distance, description: r.cuisine || r.description, price: r.priceRange || r.price }));
    } else if (icon === "attractions" && trip.nearby_places) {
      items = (Array.isArray(trip.nearby_places) ? trip.nearby_places : []).map((p: any) => ({ name: p.name, rating: p.rating, distance: p.vicinity || p.distance, description: p.types?.join(", ") || "" }));
    } else if (icon === "hotels" && itinerary?.beforeTrip?.accommodation) {
      items = [itinerary.beforeTrip.accommodation].flat().map((h: any) => ({ name: h.name || "Accommodation", description: h.description || h.area, price: h.priceRange || h.price }));
    } else if (icon === "transport" && itinerary?.duringTrip?.transport) {
      const t = itinerary.duringTrip.transport;
      items = (t.options || [t]).map((o: any) => ({ name: o.type || o.name || "Transport", description: o.description || o.details, price: o.cost || o.price }));
    }

    setWidgetModal({ open: true, title, icon, items });
  };

  return (
    <>
      <WidgetDetailModal open={widgetModal.open} onClose={() => setWidgetModal((p) => ({ ...p, open: false }))} title={widgetModal.title} icon={widgetModal.icon} items={widgetModal.items} />

      <div className={cn(tab === "active" ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6")}>
        {trips.map((trip, i) => (
          <motion.div key={trip.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * i }} className="group glass-card overflow-hidden hover-lift">
            {/* Image Banner */}
            <div className={cn("relative overflow-hidden", tab === "active" ? "h-56 sm:h-72" : "h-48")}>
              <img
                src={trip.image_url || trip.destination_photos?.[0]?.url || "/placeholder.svg"}
                alt={trip.destination}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={cn(
                  "backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5",
                  trip.status === "planned" && "bg-primary/20 text-primary-foreground",
                  trip.status === "active" && "bg-accent/90 text-accent-foreground animate-pulse",
                  trip.status === "completed" && "bg-muted/80 text-foreground"
                )}>
                  {trip.status === "planned" && <Compass className="w-3 h-3" />}
                  {trip.status === "active" && <span className="w-2 h-2 rounded-full bg-accent-foreground" />}
                  {trip.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-xl font-bold text-white">{trip.title}</h3>
                <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5" /> {trip.destination}</p>
                {/* Active trip day counter */}
                {trip.status === "active" && trip.start_date && trip.end_date && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${getProgress(trip)}%` }} transition={{ duration: 1 }} />
                    </div>
                    <span className="text-white text-sm font-semibold">{getDayLabel(trip)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Trip Meta */}
              <div className="flex items-center gap-4 text-sm">
                {trip.start_date && <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDates(trip)}</span>}
                {trip.duration && <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {trip.duration}</span>}
                <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> ${trip.budget?.toLocaleString()}</span>
              </div>

              {/* Planned: preparation insights */}
              {trip.status === "planned" && trip.itinerary_data && (
                <div className="grid grid-cols-2 gap-3">
                  {trip.weather_data?.forecast?.[0] && (
                    <div className="bg-secondary/50 rounded-xl p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><CloudSun className="w-3.5 h-3.5 text-primary" /> Weather</div><p className="text-sm font-medium text-foreground">{trip.weather_data.forecast[0].temp}°C, {trip.weather_data.forecast[0].description}</p></div>
                  )}
                  <div className="bg-secondary/50 rounded-xl p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><DollarSign className="w-3.5 h-3.5 text-accent" /> Budget</div><p className="text-sm font-bold text-foreground">${trip.budget?.toLocaleString()}</p></div>
                  {trip.itinerary_data?.beforeTrip?.visa && (
                    <div className="bg-secondary/50 rounded-xl p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><FileText className="w-3.5 h-3.5 text-accent" /> Visa</div><p className="text-sm font-medium text-foreground">{trip.itinerary_data.beforeTrip.visa.required ? "Required" : "Not Required"}</p></div>
                  )}
                  {trip.itinerary_data?.days && (
                    <div className="bg-secondary/50 rounded-xl p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Map className="w-3.5 h-3.5 text-primary" /> Itinerary</div><p className="text-sm font-medium text-foreground">{trip.itinerary_data.days.length} days planned</p></div>
                  )}
                </div>
              )}

              {/* Active: interactive widgets */}
              {trip.status === "active" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Utensils, title: "Restaurants", widgetKey: "restaurants", color: "text-accent", bg: "bg-accent/10" },
                    { icon: Camera, title: "Attractions", widgetKey: "attractions", color: "text-primary", bg: "bg-primary/10" },
                    { icon: Hotel, title: "Hotels", widgetKey: "hotels", color: "text-accent", bg: "bg-accent/10" },
                    { icon: Bus, title: "Transport", widgetKey: "transport", color: "text-primary", bg: "bg-primary/10" },
                  ].map((w) => (
                    <button key={w.widgetKey} onClick={() => openWidget(w.title, w.widgetKey, trip)} className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-all text-left group/w">
                      <div className={`w-9 h-9 rounded-lg ${w.bg} flex items-center justify-center mb-2 group-hover/w:scale-110 transition-transform`}>
                        <w.icon className={`w-4 h-4 ${w.color}`} />
                      </div>
                      <p className="text-xs font-semibold text-foreground">{w.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Tap to explore</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Completed: summary */}
              {trip.status === "completed" && trip.itinerary_data && (
                <div className="space-y-3">
                  {trip.itinerary_data.summary && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-primary" /><span className="font-display font-bold text-sm text-foreground">Trip Summary</span></div>
                      <p className="text-sm text-muted-foreground italic">{trip.itinerary_data.summary}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary/50 rounded-xl p-3 text-center"><DollarSign className="w-4 h-4 mx-auto text-accent mb-1" /><p className="text-lg font-display font-bold text-foreground">${trip.budget?.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Budget</p></div>
                    <div className="bg-secondary/50 rounded-xl p-3 text-center"><MapPin className="w-4 h-4 mx-auto text-primary mb-1" /><p className="text-lg font-display font-bold text-foreground">{trip.itinerary_data.days?.length || 0}</p><p className="text-[10px] text-muted-foreground">Days</p></div>
                    <div className="bg-secondary/50 rounded-xl p-3 text-center"><Star className="w-4 h-4 mx-auto text-accent mb-1" /><p className="text-lg font-display font-bold text-foreground">{trip.group_size}</p><p className="text-[10px] text-muted-foreground">Travelers</p></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button variant="ocean" size="sm" className="flex-1" onClick={() => navigate(`/plan?tripId=${trip.id}`)}>
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleStatusChange(trip)}>
                  <ArrowRightCircle className="w-3.5 h-3.5" /> {statusLabel[trip.status]}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
const getProgress = (trip: Trip) => {
  if (!trip.start_date || !trip.end_date) return 0;
  const start = new Date(trip.start_date).getTime();
  const end = new Date(trip.end_date).getTime();
  const now = Date.now();
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
};

const getDayLabel = (trip: Trip) => {
  if (!trip.start_date || !trip.end_date) return "";
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const now = new Date();
  const current = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `Day ${Math.min(current, total)} of ${total}`;
};

const formatDates = (trip: Trip) => {
  if (!trip.start_date) return "";
  const s = new Date(trip.start_date);
  const e = trip.end_date ? new Date(trip.end_date) : null;
  const fmt = (d: Date) => d.toLocaleDateString("en", { month: "short", day: "numeric" });
  return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
};

const EmptyState = ({ tab }: { tab: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card text-center py-20 px-6">
    <div className="w-20 h-20 rounded-3xl gradient-ocean flex items-center justify-center mx-auto mb-6 animate-float"><Compass className="w-10 h-10 text-primary-foreground" /></div>
    <h3 className="font-display text-2xl font-bold text-foreground mb-3">No {tab} trips yet</h3>
    <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
      {tab === "active" ? "Start a planned trip to see it here." : tab === "completed" ? "Complete a trip to build your travel portfolio." : "Start planning your next adventure."}
    </p>
    <Link to="/plan"><Button variant="ocean" size="lg" className="shadow-lg"><Plus className="w-5 h-5" /> Plan Your First Trip</Button></Link>
  </motion.div>
);

export default Dashboard;
