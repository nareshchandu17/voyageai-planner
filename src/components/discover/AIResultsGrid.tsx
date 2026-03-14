import { motion } from "framer-motion";
import { Sparkles, MapPin, Clock, Star, X } from "lucide-react";
import type { AIDestinationResult } from "./AIPromptBar";

interface AIResultsGridProps {
  results: AIDestinationResult[];
  query: string;
  onClear: () => void;
}

const AIResultsGrid = ({ results, query, onClear }: AIResultsGridProps) => {
  if (results.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-ocean">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">AI Recommendations</h3>
              <p className="text-sm text-muted-foreground font-body">
                Personalized results for "<span className="text-ocean">{query}</span>"
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/80"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {results.map((result, i) => (
            <motion.div
              key={`${result.destination}-${i}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative rounded-2xl overflow-hidden glass-card border border-border/30 hover:border-ocean/30 transition-all duration-500 hover:shadow-xl"
            >
              {/* AI badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="flex items-center gap-1 bg-ocean/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  AI Pick
                </span>
              </div>

              {/* Gradient header */}
              <div className="h-32 gradient-ocean relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-primary-foreground/70 text-xs font-medium bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-display text-base font-bold text-foreground leading-tight">
                    {result.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                    <MapPin className="w-3 h-3" />
                    {result.destination}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2">
                  {result.reason}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {result.highlights?.slice(0, 3).map((h, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-medium text-foreground/70 bg-secondary/80 px-2 py-0.5 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {result.duration}
                  </div>
                  <span className="text-foreground font-bold text-sm">
                    ${result.price}
                    <span className="text-muted-foreground font-normal text-xs"> /person</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIResultsGrid;
