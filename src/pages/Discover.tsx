import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DestinationCard from "@/components/DestinationCard";
import { Search, Sparkles, Globe, TrendingUp, Gem, Sun, Cpu } from "lucide-react";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import peruImg from "@/assets/dest-peru.jpg";
import heroImg from "@/assets/hero-travel.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import barcelonaImg from "@/assets/dest-barcelona.jpg";
import dubaiImg from "@/assets/dest-dubai.jpg";
import kyotoImg from "@/assets/dest-kyoto.jpg";
import capetownImg from "@/assets/dest-capetown.jpg";
import icelandImg from "@/assets/dest-iceland.jpg";
import moroccoImg from "@/assets/pkg-morocco.jpg";
import italyImg from "@/assets/pkg-italy.jpg";
import japanImg from "@/assets/pkg-japan.jpg";
import africaImg from "@/assets/pkg-africa.jpg";

const categories = [
  { label: "All", icon: Globe },
  { label: "Trending", icon: TrendingUp },
  { label: "Hidden Gems", icon: Gem },
  { label: "Seasonal", icon: Sun },
  { label: "AI Picks", icon: Cpu },
];

const allDestinations = [
  { image: tokyoImg, name: "Tokyo", country: "Japan", budget: "$1,200", season: "Spring", rating: 4.9, category: "Trending" },
  { image: baliImg, name: "Bali", country: "Indonesia", budget: "$800", season: "Summer", rating: 4.8, category: "Trending" },
  { image: parisImg, name: "Paris", country: "France", budget: "$1,500", season: "Autumn", rating: 4.7, category: "Trending" },
  { image: nycImg, name: "New York", country: "United States", budget: "$1,800", season: "Year-round", rating: 4.6, category: "Trending" },
  { image: peruImg, name: "Machu Picchu", country: "Peru", budget: "$900", season: "May-Sep", rating: 4.9, category: "Hidden Gems" },
  { image: heroImg, name: "Santorini", country: "Greece", budget: "$1,400", season: "Summer", rating: 4.8, category: "Seasonal" },
  { image: maldivesImg, name: "Maldives", country: "Maldives", budget: "$2,200", season: "Nov-Apr", rating: 4.9, category: "AI Picks" },
  { image: barcelonaImg, name: "Barcelona", country: "Spain", budget: "$1,100", season: "Spring", rating: 4.7, category: "Trending" },
  { image: dubaiImg, name: "Dubai", country: "UAE", budget: "$1,600", season: "Winter", rating: 4.6, category: "AI Picks" },
  { image: kyotoImg, name: "Kyoto", country: "Japan", budget: "$1,000", season: "Spring", rating: 4.8, category: "Hidden Gems" },
  { image: capetownImg, name: "Cape Town", country: "South Africa", budget: "$950", season: "Oct-Mar", rating: 4.7, category: "Hidden Gems" },
  { image: icelandImg, name: "Reykjavik", country: "Iceland", budget: "$1,700", season: "Winter", rating: 4.8, category: "Seasonal" },
  { image: moroccoImg, name: "Marrakech", country: "Morocco", budget: "$700", season: "Spring", rating: 4.5, category: "Hidden Gems" },
  { image: italyImg, name: "Amalfi Coast", country: "Italy", budget: "$1,300", season: "Summer", rating: 4.9, category: "Seasonal" },
  { image: japanImg, name: "Osaka", country: "Japan", budget: "$1,100", season: "Autumn", rating: 4.6, category: "AI Picks" },
  { image: africaImg, name: "Serengeti", country: "Tanzania", budget: "$2,500", season: "Jun-Oct", rating: 4.9, category: "AI Picks" },
];

const Discover = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return allDestinations.filter((d) => {
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.country.toLowerCase().includes(search.toLowerCase()) ||
        d.season.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || d.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-sunset-glow text-sunset rounded-full px-4 py-2 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" /> AI-powered recommendations
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Discover your next adventure
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore destinations curated by AI based on trending travel data
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-ocean" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by destination, country, or season..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean shadow-soft font-body transition-shadow focus:shadow-soft-lg"
            />
            {search && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              >
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.label}
                onClick={() => setActiveCategory(c.label)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === c.label
                    ? "gradient-ocean text-primary-foreground shadow-soft"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((d, i) => (
              <DestinationCard key={d.name} {...d} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg">No destinations found. Try a different search or category.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Discover;
