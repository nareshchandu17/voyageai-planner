import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Globe, Utensils, MapPin, TrendingUp, Star, Compass, Zap, Heart, Pencil, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { TravelerProfile } from "@/hooks/useTravelerProfile";
import { toast } from "sonner";

const paceOptions = ["relaxed", "moderate", "intense"] as const;

const cuisineOptions = ["Italian", "Japanese", "Thai", "Mexican", "Indian", "French", "Korean", "Mediterranean", "Chinese", "American"];
const styleOptions = ["adventure", "culture", "food", "nature", "luxury", "budget", "wellness", "nightlife"];

interface TravelerProfileCardProps {
  profile: TravelerProfile;
  onSave?: (updates: Partial<TravelerProfile>) => Promise<boolean>;
}

const TravelerProfileCard = ({ profile, onSave }: TravelerProfileCardProps) => {
  const patterns = profile.past_patterns || {};
  const favorites = patterns.favorite_activity_types || [];
  const ratings = patterns.trip_ratings || [];

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [pace, setPace] = useState(profile.pace_preference || "moderate");
  const [energy, setEnergy] = useState(profile.energy_tolerance || 3);
  const [cuisines, setCuisines] = useState<string[]>(profile.cuisine_preferences || []);
  const [styles, setStyles] = useState<string[]>(profile.travel_style || []);
  const [newCuisine, setNewCuisine] = useState("");

  const startEditing = () => {
    setPace(profile.pace_preference || "moderate");
    setEnergy(profile.energy_tolerance || 3);
    setCuisines([...(profile.cuisine_preferences || [])]);
    setStyles([...(profile.travel_style || [])]);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    const ok = await onSave({
      pace_preference: pace,
      energy_tolerance: energy,
      cuisine_preferences: cuisines,
      travel_style: styles,
    });
    setSaving(false);
    if (ok) {
      toast.success("Profile updated!");
      setEditing(false);
    } else {
      toast.error("Failed to save profile");
    }
  };

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const addCustomCuisine = () => {
    const trimmed = newCuisine.trim();
    if (trimmed && !cuisines.includes(trimmed)) {
      setCuisines([...cuisines, trimmed]);
      setNewCuisine("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      {/* Header */}
      <div className="gradient-ocean p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-white">Your Travel Self</h3>
            <p className="text-white/70 text-sm">AI-learned from {profile.trip_count} trips</p>
          </div>
          {onSave && !editing && (
            <Button size="sm" variant="ghost" onClick={startEditing} className="text-white/80 hover:text-white hover:bg-white/15">
              <Pencil className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          )}
          {editing && (
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={cancelEditing} className="text-white/80 hover:text-white hover:bg-white/15" disabled={saving}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-white/20 hover:bg-white/30 text-white">
                <Check className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Pace */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" /> Pace Preference
                </p>
                <div className="flex gap-2">
                  {paceOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all capitalize",
                        pace === p
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Tolerance */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Energy Tolerance: {energy}/5
                </p>
                <Slider
                  value={[energy]}
                  onValueChange={([v]) => setEnergy(v)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>Relaxed</span><span>Intense</span>
                </div>
              </div>

              {/* Travel Styles */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" /> Travel Style
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {styleOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleItem(styles, setStyles, s)}
                      className={cn(
                        "text-[10px] px-2.5 py-1.5 rounded-full font-medium transition-all capitalize",
                        styles.includes(s)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-primary" /> Cuisine Preferences
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {cuisineOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleItem(cuisines, setCuisines, c)}
                      className={cn(
                        "text-[10px] px-2.5 py-1.5 rounded-full font-medium transition-all",
                        cuisines.includes(c)
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input
                    value={newCuisine}
                    onChange={e => setNewCuisine(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCustomCuisine()}
                    placeholder="Add custom…"
                    className="h-7 text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addCustomCuisine} className="h-7 px-2">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <Globe className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-lg font-display font-bold text-foreground">{patterns.total_countries || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Countries</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <MapPin className="w-4 h-4 mx-auto text-accent mb-1" />
                  <p className="text-lg font-display font-bold text-foreground">{profile.trip_count}</p>
                  <p className="text-[10px] text-muted-foreground">Trips</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-lg font-display font-bold text-foreground capitalize">{profile.pace_preference}</p>
                  <p className="text-[10px] text-muted-foreground">Pace</p>
                </div>
              </div>

              {/* Travel style */}
              {profile.travel_style?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-primary" /> Travel Style
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.travel_style.map(style => (
                      <span key={style} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{style}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite activities */}
              {favorites.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-accent" /> Favorite Activities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {favorites.map(type => (
                      <span key={type} className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent font-medium capitalize">{type}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisine preferences */}
              {profile.cuisine_preferences?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-primary" /> Cuisine Preferences
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.cuisine_preferences.map(c => (
                      <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Past trip ratings */}
              {ratings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Past Trips
                  </p>
                  <div className="space-y-1.5">
                    {ratings.slice(-5).reverse().map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.destination}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, j) => (
                            <Star key={j} className={cn("w-3 h-3", j < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted")} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI insight */}
              {patterns.avg_activities_per_day && (
                <div className="bg-primary/5 rounded-xl p-3 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-primary inline mr-1.5" />
                  Based on your past trips, you prefer ~{patterns.avg_activities_per_day} activities per day
                  {patterns.avg_daily_budget ? ` with a ~$${patterns.avg_daily_budget}/day budget` : ""}.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TravelerProfileCard;
