import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Utensils, Coffee, ShoppingBag, Eye, Palette, TreePine, Music, Heart, Gem,
  MapPin, Clock, DollarSign, ChevronRight, Loader2, RefreshCw, Star, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Experience {
  name: string;
  description: string;
  localTip: string;
  bestTime: string;
  priceLevel: string;
  neighborhood: string;
  tags: string[];
  confidence: number;
}

interface Category {
  title: string;
  icon: string;
  experiences: Experience[];
}

interface LocalExperiencesData {
  categories: Category[];
  insiderNote: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  cafe: <Coffee className="w-4 h-4" />,
  market: <ShoppingBag className="w-4 h-4" />,
  viewpoint: <Eye className="w-4 h-4" />,
  art: <Palette className="w-4 h-4" />,
  nature: <TreePine className="w-4 h-4" />,
  nightlife: <Music className="w-4 h-4" />,
  culture: <Heart className="w-4 h-4" />,
  wellness: <Gem className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
};

const confidenceLabel = (c: number) => {
  if (c >= 0.9) return { text: "Must Visit", color: "text-green-500" };
  if (c >= 0.75) return { text: "Highly Rated", color: "text-primary" };
  return { text: "Worth Exploring", color: "text-muted-foreground" };
};

const priceBadge = (level: string) => {
  if (level === "free") return "Free";
  return level;
};

interface Props {
  destination: string;
  interests?: string[];
  styles?: string[];
  days?: number;
}

const LocalExperiencesSection = ({ destination, interests, styles, days }: Props) => {
  const [data, setData] = useState<LocalExperiencesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

  const fetchExperiences = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("ai-local-experiences", {
        body: { destination, interests, styles, days },
      });
      if (fnError) throw new Error(fnError.message);
      if (fnData?.error) throw new Error(fnData.error);
      setData(fnData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) fetchExperiences();
  }, [destination]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Compass className="w-6 h-6 text-primary animate-spin" />
            <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Discovering hidden gems in {destination}…</p>
            <p className="text-xs text-muted-foreground">AI is finding authentic local experiences</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">Couldn't load local experiences</p>
        <Button variant="outline" size="sm" onClick={fetchExperiences}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  if (!data?.categories?.length) return null;

  const cat = data.categories[activeCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                Hidden Local Gems
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">AI</span>
              </h3>
              <p className="text-xs text-muted-foreground">Experiences only locals know about</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchExperiences} className="text-xs h-7 px-2">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>

        {data.insiderNote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-xs italic text-muted-foreground border-l-2 border-accent/40 pl-3"
          >
            "{data.insiderNote}"
          </motion.p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="px-5 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {data.categories.map((c, i) => (
          <button
            key={c.title}
            onClick={() => { setActiveCategory(i); setExpandedExp(null); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              i === activeCategory
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            {categoryIcons[c.icon] || <MapPin className="w-3.5 h-3.5" />}
            {c.title}
            <span className="text-[10px] opacity-70">({c.experiences.length})</span>
          </button>
        ))}
      </div>

      {/* Experience Cards */}
      <div className="px-5 pb-5 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-3"
          >
            {cat.experiences.map((exp, i) => {
              const isExpanded = expandedExp === `${activeCategory}-${i}`;
              const conf = confidenceLabel(exp.confidence);

              return (
                <motion.div
                  key={`${exp.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setExpandedExp(isExpanded ? null : `${activeCategory}-${i}`)}
                  className={cn(
                    "rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
                    isExpanded && "border-primary/40 shadow-lg shadow-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{exp.name}</h4>
                        <span className={cn("text-[10px] font-medium flex items-center gap-0.5", conf.color)}>
                          <Star className="w-2.5 h-2.5" /> {conf.text}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{exp.description}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1", isExpanded && "rotate-90")} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {exp.neighborhood}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {exp.bestTime}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" /> {priceBadge(exp.priceLevel)}
                    </span>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <div className="flex items-start gap-2 bg-accent/5 rounded-lg p-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">Local Insider Tip</p>
                              <p className="text-xs text-foreground leading-relaxed">{exp.localTip}</p>
                            </div>
                          </div>
                          {exp.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exp.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LocalExperiencesSection;
