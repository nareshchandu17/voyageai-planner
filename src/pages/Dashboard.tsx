import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus, MapPin, Calendar, ArrowRight, Compass, Plane,
  Clock, Star, Camera, BookOpen
} from "lucide-react";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import heroTravel from "@/assets/hero-travel.jpg";

const trips = [
  { id: 1, image: tokyoImg, destination: "Tokyo, Japan", dates: "Mar 15–22, 2026", status: "upcoming" as const, days: 7, activities: 18 },
  { id: 2, image: baliImg, destination: "Bali, Indonesia", dates: "Jan 5–12, 2026", status: "completed" as const, days: 7, activities: 14 },
  { id: 3, image: parisImg, destination: "Paris, France", dates: "Apr 1–8, 2026", status: "planning" as const, days: 7, activities: 12 },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  upcoming: { bg: "bg-ocean-lighter", text: "text-ocean", dot: "bg-[hsl(var(--ocean))]" },
  completed: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  planning: { bg: "bg-sunset-glow", text: "text-sunset", dot: "bg-[hsl(var(--sunset))]" },
};

type TabKey = "all" | "upcoming" | "planning" | "completed";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = activeTab === "all" ? trips : trips.filter((t) => t.status === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero banner ── */}
      <section className="relative h-[340px] sm:h-[400px] overflow-hidden">
        <motion.img
          src={heroTravel}
          alt="Dashboard hero"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />

        <div className="absolute inset-0 flex flex-col items-start justify-end container mx-auto px-4 sm:px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-white/70" />
              <span className="text-white/70 text-sm font-body tracking-wide">Travel Hub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              My Trips
            </h1>
            <p className="text-white/60 font-body mt-2 max-w-md">
              Plan, track, and relive your adventures — all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20">
        {/* ── Quick stats ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { label: "Total Trips", value: "3", icon: Plane, gradient: "gradient-ocean" },
            { label: "Upcoming", value: "1", icon: Clock, gradient: "gradient-sunset" },
            { label: "Places Visited", value: "24", icon: MapPin, gradient: "gradient-ocean" },
            { label: "Memories", value: "47", icon: Camera, gradient: "gradient-sunset" },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card p-5 flex items-center gap-4 hover-lift"
            >
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

        {/* ── Header + tabs row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {(["all", "upcoming", "planning", "completed"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium font-body transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "gradient-ocean text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link to="/plan">
            <Button variant="ocean" className="shadow-lg">
              <Plus className="w-4 h-4" /> New Trip
            </Button>
          </Link>
        </div>

        {/* ── Trip cards ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip, i) => {
              const status = statusConfig[trip.status];
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                >
                  <Link
                    to={trip.status === "completed" ? "/memories" : "/itinerary"}
                    className="group glass-card overflow-hidden hover-lift block"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={trip.image}
                        alt={trip.destination}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 right-3">
                        <span className={`${status.bg} ${status.text} text-xs font-medium px-3 py-1.5 rounded-full capitalize flex items-center gap-1.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {trip.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[hsl(var(--ocean))]" />
                        {trip.destination}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.dates}
                      </p>
                      {/* Mini stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {trip.days} days
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3" /> {trip.activities} activities
                        </span>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-[hsl(var(--ocean))] font-medium group-hover:gap-2 transition-all gap-1 font-body">
                        {trip.status === "completed" ? "View Memories" : "View Itinerary"}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* ── Empty state for filtered tab ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card text-center py-20 px-6"
          >
            <div className="w-20 h-20 rounded-3xl gradient-ocean flex items-center justify-center mx-auto mb-6 animate-float">
              <Compass className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
              No {activeTab} trips yet
            </h3>
            <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
              Start planning your next adventure and it will show up here.
            </p>
            <Link to="/plan">
              <Button variant="ocean" size="lg" className="shadow-lg">
                <Plus className="w-5 h-5" /> Plan Your First Trip
              </Button>
            </Link>
          </motion.div>
        )}

        {/* ── Quick links ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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

export default Dashboard;
