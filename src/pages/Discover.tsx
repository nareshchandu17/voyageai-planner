import { useState } from "react";
import DestinationCard from "@/components/DestinationCard";
import { Search, Sparkles } from "lucide-react";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import peruImg from "@/assets/dest-peru.jpg";
import heroImg from "@/assets/hero-travel.jpg";

const categories = ["All", "Trending", "Hidden Gems", "Seasonal", "AI Picks"];

const allDestinations = [
  { image: tokyoImg, name: "Tokyo", country: "Japan", budget: "$1,200", season: "Spring", rating: 4.9 },
  { image: baliImg, name: "Bali", country: "Indonesia", budget: "$800", season: "Summer", rating: 4.8 },
  { image: parisImg, name: "Paris", country: "France", budget: "$1,500", season: "Autumn", rating: 4.7 },
  { image: nycImg, name: "New York", country: "United States", budget: "$1,800", season: "Year-round", rating: 4.6 },
  { image: peruImg, name: "Machu Picchu", country: "Peru", budget: "$900", season: "May-Sep", rating: 4.9 },
  { image: heroImg, name: "Santorini", country: "Greece", budget: "$1,400", season: "Summer", rating: 4.8 },
];

const Discover = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = allDestinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 animate-in">
          <div className="inline-flex items-center gap-2 bg-sunset-glow text-sunset rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> AI-powered recommendations
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Discover your next adventure
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore destinations curated by AI based on trending travel data
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean shadow-soft font-body"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === c
                  ? "gradient-ocean text-primary-foreground shadow-soft"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d, i) => (
            <DestinationCard key={i} {...d} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No destinations found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
