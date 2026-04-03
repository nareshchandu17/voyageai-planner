import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Heart, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GroupTraveler {
  id: string;
  name: string;
  preferences: {
    interests?: string[];
    dietary?: string[];
    energy_level?: "low" | "medium" | "high";
    mobility?: string;
    budget_preference?: "budget" | "moderate" | "luxury";
  };
  compatibility_score?: number;
}

const interestOptions = ["Museums", "Food", "Nature", "Shopping", "Nightlife", "Adventure", "Photography", "History", "Beach", "Architecture"];
const dietaryOptions = ["None", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free"];

interface GroupOrchestratorProps {
  travelers: GroupTraveler[];
  onTravelersChange: (travelers: GroupTraveler[]) => void;
}

export const GroupOrchestrator = ({ travelers, onTravelersChange }: GroupOrchestratorProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInterests, setNewInterests] = useState<string[]>([]);
  const [newEnergy, setNewEnergy] = useState<"low" | "medium" | "high">("medium");

  const addTraveler = () => {
    if (!newName.trim()) return;
    const traveler: GroupTraveler = {
      id: crypto.randomUUID(),
      name: newName,
      preferences: { interests: newInterests, energy_level: newEnergy },
    };
    onTravelersChange([...travelers, traveler]);
    setNewName("");
    setNewInterests([]);
    setShowAdd(false);
  };

  const removeTraveler = (id: string) => {
    onTravelersChange(travelers.filter(t => t.id !== id));
  };

  // Calculate group overlap
  const allInterests = travelers.flatMap(t => t.preferences.interests || []);
  const interestCounts: Record<string, number> = {};
  allInterests.forEach(i => { interestCounts[i] = (interestCounts[i] || 0) + 1; });
  const overlaps = Object.entries(interestCounts).filter(([, c]) => c > 1).sort(([, a], [, b]) => b - a);
  const conflicts = travelers.length > 1
    ? travelers.filter(t => t.preferences.energy_level !== travelers[0]?.preferences.energy_level)
    : [];

  if (travelers.length === 0 && !showAdd) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Group Travel</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Travelers
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Add co-travelers to get compatibility insights and split-day suggestions.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Group Dynamic Orchestration</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{travelers.length} travelers</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {/* Traveler cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {travelers.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-secondary/50 rounded-xl p-3"
          >
            <button onClick={() => removeTraveler(t.id)} className="absolute top-2 right-2 p-0.5 hover:bg-destructive/10 rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-accent" : "bg-purple-500"
              )}>
                {t.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{t.preferences.energy_level} energy</p>
              </div>
            </div>
            {t.preferences.interests?.length ? (
              <div className="flex flex-wrap gap-1">
                {t.preferences.interests.slice(0, 4).map(int => (
                  <span key={int} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{int}</span>
                ))}
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Compatibility Insights */}
      {travelers.length > 1 && (
        <div className="space-y-3">
          {overlaps.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-foreground">Shared Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {overlaps.map(([interest, count]) => (
                  <span key={interest} className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
                    {interest} ({count}/{travelers.length})
                  </span>
                ))}
              </div>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold text-foreground">Energy Mismatch Detected</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Consider split-day options where high-energy travelers take adventure activities while others explore at a relaxed pace.
              </p>
            </div>
          )}

          {/* Compatibility Score */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Group Compatibility</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, overlaps.length > 0 ? 60 + overlaps.length * 10 : 40)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
              <span className="text-sm font-bold text-foreground">{overlaps.length > 0 ? 60 + overlaps.length * 10 : 40}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-border"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Traveler name"
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground mb-3"
            />
            <p className="text-xs text-muted-foreground mb-2">Interests:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {interestOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setNewInterests(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full border transition-colors",
                    newInterests.includes(opt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-2">Energy level:</p>
            <div className="flex gap-2 mb-3">
              {(["low", "medium", "high"] as const).map(e => (
                <button
                  key={e}
                  onClick={() => setNewEnergy(e)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors capitalize",
                    newEnergy === e ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={addTraveler} disabled={!newName.trim()} className="w-full">Add Traveler</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
