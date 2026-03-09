import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus, MapPin, Calendar, ArrowRight, Compass, Plane, Clock,
  Star, Camera, BookOpen, DollarSign, CheckCircle2, CloudSun,
  Luggage, FileText, Bus, Utensils, Sparkles, Shield, Hotel,
  Navigation, Eye, Heart, Play, ChevronRight, Globe, Map
} from "lucide-react";

import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import santoriniImg from "@/assets/dest-santorini.jpg";
import dubaiImg from "@/assets/dest-dubai.jpg";
import heroTravel from "@/assets/hero-travel.jpg";

// ── Mock data ──
const mockTrips = {
  planned: [
    {
      id: 1, image: tokyoImg, title: "Tokyo Adventure", destination: "Tokyo, Japan",
      dates: "Mar 15–22, 2026", duration: "7 days", budget: 3200, currency: "USD",
      weatherPreview: "18°C, Partly Cloudy", packingProgress: 65, visaStatus: "Not Required",
      itineraryHighlights: ["Shibuya Crossing", "Senso-ji Temple", "Tsukiji Market", "Mt. Fuji Day Trip"],
    },
    {
      id: 2, image: parisImg, title: "Parisian Romance", destination: "Paris, France",
      dates: "Apr 1–8, 2026", duration: "7 days", budget: 4100, currency: "USD",
      weatherPreview: "14°C, Light Rain", packingProgress: 30, visaStatus: "Schengen Visa",
      itineraryHighlights: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine River Cruise"],
    },
  ],
  active: [
    {
      id: 3, image: baliImg, title: "Bali Island Escape", destination: "Bali, Indonesia",
      dates: "Mar 5–12, 2026", duration: "7 days", currentDay: 4, totalDays: 7,
      widgets: {
        transport: { metro: "N/A", taxi: "Grab/Gojek available", cost: "$3-15/ride" },
        restaurants: [
          { name: "Locavore", cuisine: "Modern Indonesian", distance: "1.2 km", price: "$$$" },
          { name: "Warung Babi Guling", cuisine: "Balinese", distance: "0.5 km", price: "$" },
          { name: "Mozaic", cuisine: "French-Indonesian", distance: "2.1 km", price: "$$$$" },
        ],
        experiences: [
          { name: "Tegallalang Rice Terraces", type: "hidden_gem" },
          { name: "Kecak Fire Dance", type: "event" },
          { name: "Campuhan Ridge Walk", type: "photo_spot" },
        ],
        safety: { emergency: "112", hospital: "BIMC Hospital Ubud", safeArea: "Ubud Center" },
      },
    },
  ],
  completed: [
    {
      id: 4, image: santoriniImg, title: "Santorini Dreams", destination: "Santorini, Greece",
      dates: "Jan 10–17, 2026", duration: "7 days",
      summary: { totalExpenses: 3800, placesVisited: 12, photosUploaded: 47 },
      highlights: {
        bestMoment: "Sunset at Oia",
        favoritePlace: "Amoudi Bay",
        bestFood: "Fresh seafood at Ammoudi Fish Tavern",
      },
      aiStory: "Your 7-day journey through Santorini was a masterpiece of blue domes, golden sunsets, and unforgettable flavors. From the dramatic caldera views of Fira to the serene beaches of Perissa, every moment painted a new memory.",
      timeline: [
        "Arrival & Fira exploration",
        "Oia village & sunset",
        "Volcanic island boat tour",
        "Wine tasting & Pyrgos",
        "Red Beach & Akrotiri ruins",
        "Perissa Beach day",
        "Departure & last caldera view",
      ],
      suggestions: [
        { name: "Mykonos", image: dubaiImg },
        { name: "Amalfi Coast", image: parisImg },
        { name: "Dubrovnik", image: tokyoImg },
      ],
    },
  ],
};

type TripTab = "planned" | "active" | "completed";

const tabConfig: { key: TripTab; label: string; icon: typeof Compass }[] = [
  { key: "planned", label: "Planned", icon: Compass },
  { key: "active", label: "Active", icon: Play },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TripTab>("planned");

  const totalTrips = mockTrips.planned.length + mockTrips.active.length + mockTrips.completed.length;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ── */}
      <section className="relative h-[320px] sm:h-[380px] overflow-hidden">
        <motion.img
          src={heroTravel}
          alt="My Trips"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />

        <div className="absolute inset-0 flex flex-col items-start justify-end container mx-auto px-4 sm:px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-white/70" />
              <span className="text-white/70 text-sm font-body tracking-wide">Travel Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">My Trips</h1>
            <p className="text-white/60 font-body mt-2 max-w-md">
              Manage your travel journeys from planning to memories.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20">
        {/* ── Quick Stats ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { label: "Total Trips", value: String(totalTrips), icon: Plane, gradient: "gradient-ocean" },
            { label: "Active Now", value: String(mockTrips.active.length), icon: Play, gradient: "gradient-sunset" },
            { label: "Places Visited", value: "12", icon: MapPin, gradient: "gradient-ocean" },
            { label: "Memories", value: "47", icon: Camera, gradient: "gradient-sunset" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4 hover-lift">
              <div className={`w-11 h-11 rounded-xl ${stat.gradient} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Segmented Control ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-flex bg-secondary/80 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-300",
                  activeTab === tab.key
                    ? "gradient-ocean text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
                <span className={cn(
                  "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                  activeTab === tab.key ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {mockTrips[tab.key].length}
                </span>
              </button>
            ))}
          </div>
          <Link to="/plan">
            <Button variant="ocean" className="shadow-lg">
              <Plus className="w-4 h-4" /> New Trip
            </Button>
          </Link>
        </motion.div>

        {/* ── Content Area ── */}
        <AnimatePresence mode="wait">
          {activeTab === "planned" && (
            <motion.div key="planned" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <PlannedTrips trips={mockTrips.planned} />
            </motion.div>
          )}
          {activeTab === "active" && (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <ActiveTrips trips={mockTrips.active} />
            </motion.div>
          )}
          {activeTab === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <CompletedTrips trips={mockTrips.completed} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick Links ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          {[
            { title: "Plan a Trip", desc: "AI-powered itinerary builder", icon: Plane, to: "/plan", gradient: "gradient-ocean" },
            { title: "Discover", desc: "Explore curated experiences", icon: Compass, to: "/discover", gradient: "gradient-sunset" },
            { title: "Travel Blog", desc: "Stories & inspiration", icon: BookOpen, to: "/blog", gradient: "gradient-ocean" },
          ].map((link, i) => (
            <Link key={i} to={link.to} className="group glass-card p-5 flex items-center gap-4 hover-lift">
              <div className={`w-11 h-11 rounded-xl ${link.gradient} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                <link.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-semibold text-foreground text-sm">{link.title}</h4>
                <p className="text-xs text-muted-foreground font-body">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// PLANNED TRIPS
// ══════════════════════════════════════════
const PlannedTrips = ({ trips }: { trips: typeof mockTrips.planned }) => {
  if (!trips.length) return <EmptyState tab="planned" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {trips.map((trip, i) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * i }}
          className="group glass-card overflow-hidden hover-lift"
        >
          {/* Image Banner */}
          <div className="relative h-48 overflow-hidden">
            <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3">
              <span className="bg-primary/20 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> Planned
              </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="font-display text-xl font-bold text-white">{trip.title}</h3>
              <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {trip.destination}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Trip Meta */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {trip.dates}</span>
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {trip.duration}</span>
            </div>

            {/* Preparation Insights */}
            <div className="grid grid-cols-2 gap-3">
              {/* Weather */}
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CloudSun className="w-3.5 h-3.5 text-primary" /> Weather
                </div>
                <p className="text-sm font-medium text-foreground">{trip.weatherPreview}</p>
              </div>
              {/* Budget */}
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-accent" /> Budget
                </div>
                <p className="text-sm font-bold text-foreground">${trip.budget.toLocaleString()}</p>
              </div>
              {/* Packing */}
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Luggage className="w-3.5 h-3.5 text-primary" /> Packing
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-ocean rounded-full" style={{ width: `${trip.packingProgress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{trip.packingProgress}%</span>
                </div>
              </div>
              {/* Visa */}
              <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <FileText className="w-3.5 h-3.5 text-accent" /> Visa
                </div>
                <p className="text-sm font-medium text-foreground">{trip.visaStatus}</p>
              </div>
            </div>

            {/* Itinerary Preview */}
            <div className="bg-secondary/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-primary" /> Itinerary Highlights
              </p>
              <div className="flex flex-wrap gap-1.5">
                {trip.itineraryHighlights.map((h, j) => (
                  <span key={j} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg">{h}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Link to="/itinerary" className="flex-1">
                <Button variant="ocean" size="sm" className="w-full">
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1">
                <Play className="w-3.5 h-3.5" /> Start Trip
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════
// ACTIVE TRIPS
// ══════════════════════════════════════════
const ActiveTrips = ({ trips }: { trips: typeof mockTrips.active }) => {
  if (!trips.length) return <EmptyState tab="active" />;

  return (
    <div className="space-y-6">
      {trips.map((trip) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Hero Header */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-4 right-4">
              <span className="bg-accent/90 backdrop-blur-sm text-accent-foreground text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-accent-foreground" /> ACTIVE
              </span>
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="font-display text-3xl font-bold text-white mb-1">{trip.title}</h2>
              <p className="text-white/70 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {trip.destination} · {trip.dates}
              </p>
              {/* Day Progress */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(trip.currentDay / trip.totalDays) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <span className="text-white text-sm font-semibold">Day {trip.currentDay} of {trip.totalDays}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Widgets */}
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Transport */}
              <WidgetCard icon={Bus} title="Local Transport" color="text-primary" bgColor="bg-primary/10">
                <p className="text-xs text-muted-foreground">{trip.widgets.transport.taxi}</p>
                <p className="text-xs text-accent font-medium">{trip.widgets.transport.cost}</p>
              </WidgetCard>

              {/* Restaurants */}
              <WidgetCard icon={Utensils} title="Restaurants Nearby" color="text-accent" bgColor="bg-accent/10">
                {trip.widgets.restaurants.slice(0, 2).map((r, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex justify-between">
                    <span className="truncate">{r.name}</span>
                    <span className="text-accent shrink-0 ml-1">{r.price}</span>
                  </div>
                ))}
              </WidgetCard>

              {/* Experiences */}
              <WidgetCard icon={Sparkles} title="Experiences" color="text-primary" bgColor="bg-primary/10">
                {trip.widgets.experiences.map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground truncate">
                    {e.type === "hidden_gem" ? "💎" : e.type === "event" ? "🎭" : "📸"} {e.name}
                  </p>
                ))}
              </WidgetCard>

              {/* Safety */}
              <WidgetCard icon={Shield} title="Safety" color="text-destructive" bgColor="bg-destructive/10">
                <p className="text-xs text-muted-foreground">Emergency: <span className="font-bold text-foreground">{trip.widgets.safety.emergency}</span></p>
                <p className="text-xs text-muted-foreground truncate">🏥 {trip.widgets.safety.hospital}</p>
              </WidgetCard>

              {/* Hotel */}
              <WidgetCard icon={Hotel} title="Hotel Details" color="text-accent" bgColor="bg-accent/10">
                <p className="text-xs text-muted-foreground">Safe area: {trip.widgets.safety.safeArea}</p>
              </WidgetCard>

              {/* Navigation */}
              <WidgetCard icon={Navigation} title="Navigation" color="text-primary" bgColor="bg-primary/10">
                <p className="text-xs text-muted-foreground">Open map for routes & directions</p>
              </WidgetCard>
            </div>

            {/* Floating Action */}
            <div className="mt-6 flex justify-center">
              <Button variant="ocean" size="lg" className="shadow-xl px-8">
                <Compass className="w-5 h-5" /> Explore Nearby
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════
// COMPLETED TRIPS
// ══════════════════════════════════════════
const CompletedTrips = ({ trips }: { trips: typeof mockTrips.completed }) => {
  if (!trips.length) return <EmptyState tab="completed" />;

  return (
    <div className="space-y-8">
      {trips.map((trip) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Hero */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-4 right-4">
              <span className="bg-muted/80 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            </div>
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="font-display text-3xl font-bold text-white mb-1">{trip.title}</h2>
              <p className="text-white/70 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {trip.destination} · {trip.dates} · {trip.duration}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Trip Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <DollarSign className="w-5 h-5 mx-auto text-accent mb-1" />
                <p className="text-xl font-display font-bold text-foreground">${trip.summary.totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <MapPin className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xl font-display font-bold text-foreground">{trip.summary.placesVisited}</p>
                <p className="text-xs text-muted-foreground">Places Visited</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Camera className="w-5 h-5 mx-auto text-accent mb-1" />
                <p className="text-xl font-display font-bold text-foreground">{trip.summary.photosUploaded}</p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" /> Trip Highlights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Heart, label: "Best Moment", value: trip.highlights.bestMoment },
                  { icon: MapPin, label: "Favorite Place", value: trip.highlights.favoritePlace },
                  { icon: Utensils, label: "Best Food", value: trip.highlights.bestFood },
                ].map((h, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <h.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{h.label}</p>
                      <p className="text-sm font-medium text-foreground">{h.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Travel Story */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
              <h4 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> AI Travel Story
              </h4>
              <p className="text-sm text-muted-foreground italic leading-relaxed">"{trip.aiStory}"</p>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" /> Trip Timeline
              </h4>
              <div className="space-y-2">
                {trip.timeline.map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-ocean flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                      D{i + 1}
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <p className="text-sm text-foreground">{day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Suggestions */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" /> Next Travel Suggestions
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {trip.suggestions.map((s, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer hover-lift">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-white font-display font-semibold text-sm flex items-center gap-1">
                      {s.name} <ChevronRight className="w-3 h-3" />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Link to="/memories" className="flex-1">
                <Button variant="ocean" size="sm" className="w-full">
                  <Camera className="w-3.5 h-3.5" /> View Memories
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1">
                <Plus className="w-3.5 h-3.5" /> Add Photos
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════
const WidgetCard = ({ icon: Icon, title, color, bgColor, children }: {
  icon: typeof Bus; title: string; color: string; bgColor: string; children: React.ReactNode;
}) => (
  <div className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors cursor-pointer group">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const EmptyState = ({ tab }: { tab: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card text-center py-20 px-6"
  >
    <div className="w-20 h-20 rounded-3xl gradient-ocean flex items-center justify-center mx-auto mb-6 animate-float">
      <Compass className="w-10 h-10 text-primary-foreground" />
    </div>
    <h3 className="font-display text-2xl font-bold text-foreground mb-3">
      No {tab} trips yet
    </h3>
    <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
      {tab === "active"
        ? "Start a planned trip to see it here."
        : tab === "completed"
        ? "Complete a trip to build your travel portfolio."
        : "Start planning your next adventure."}
    </p>
    <Link to="/plan">
      <Button variant="ocean" size="lg" className="shadow-lg">
        <Plus className="w-5 h-5" /> Plan Your First Trip
      </Button>
    </Link>
  </motion.div>
);

export default Dashboard;
