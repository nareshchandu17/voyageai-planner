import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle, MapPin, Star, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SerendipitySuggestion {
  name: string;
  rating?: number;
  vicinity?: string;
  types?: string[];
}

interface SerendipitySlotProps {
  dayNum: number;
  time: string;
  destination: string;
  coordinates?: { lat: number; lng: number };
  onAddActivity?: (activity: any) => void;
}

export const SerendipitySlot = ({ dayNum, time, destination, coordinates, onAddActivity }: SerendipitySlotProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SerendipitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const body: any = coordinates
        ? { action: "nearby", location: coordinates, radius: 2000, query: "" }
        : { action: "search", query: `hidden gems near ${destination}` };

      const resp = await supabase.functions.invoke("google-maps", { body });
      const results = resp.data?.results?.slice(0, 3) || [];
      setSuggestions(results.map((r: any) => ({
        name: r.name,
        rating: r.rating,
        vicinity: r.vicinity || r.formatted_address,
        types: r.types?.slice(0, 2),
      })));
      setShowSuggestions(true);
    } catch (e) {
      console.warn("Serendipity fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: SerendipitySuggestion) => {
    if (onAddActivity) {
      onAddActivity({
        time,
        title: suggestion.name,
        description: `Serendipity discovery — ${suggestion.vicinity || "nearby"}`,
        location: suggestion.vicinity || destination,
        duration: "1 hour",
        cost: 0,
        type: "free",
        tip: "✨ Unplanned discovery — the best travel memories are spontaneous!",
      });
    }
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      {/* Glowing open slot */}
      <div className={cn(
        "rounded-xl border-2 border-dashed p-4 transition-all duration-500",
        showSuggestions
          ? "border-primary/50 bg-primary/5"
          : "border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      )}>
        {!showSuggestions ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Open Slot · {time}</p>
                <p className="text-xs text-muted-foreground">Leave room for serendipity — discover something unexpected</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSuggestions}
              disabled={loading}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5" />}
              Surprise Me
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Serendipity Suggestions
              </span>
              <button onClick={() => setShowSuggestions(false)} className="p-1 hover:bg-secondary rounded-md">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelect(s)}
                    className="text-left p-3 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group/card"
                  >
                    <p className="text-sm font-medium text-foreground group-hover/card:text-primary transition-colors">{s.name}</p>
                    {s.vicinity && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-2.5 h-2.5" /> {s.vicinity}
                      </p>
                    )}
                    {s.rating && (
                      <p className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
                        <Star className="w-2.5 h-2.5" /> {s.rating}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </AnimatePresence>
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={loading} className="gap-1 text-xs">
                <Shuffle className="w-3 h-3" /> Shuffle again
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/** Determine open slots for a day */
export const getOpenSlots = (dayNum: number, activitiesCount: number): { time: string }[] => {
  // Reserve ~15-20% of the day as open slots
  if (activitiesCount >= 5) return [{ time: "15:00" }]; // one afternoon slot
  if (activitiesCount >= 3) return [{ time: "11:00" }, { time: "16:00" }]; // two slots
  return [{ time: "14:00" }]; // one slot for light days
};
