import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, MapPin, ArrowRight } from "lucide-react";

interface AIPromptBarProps {
  onSearch: (query: string) => void;
}

const suggestions = [
  { text: "Romantic trip in Italy", icon: "🇮🇹" },
  { text: "Adventure in Morocco", icon: "🇲🇦" },
  { text: "Beach getaway in Bali", icon: "🏝️" },
  { text: "Cultural tour in Japan", icon: "🇯🇵" },
  { text: "Luxury escape to Dubai", icon: "🇦🇪" },
  { text: "Nature retreat in New Zealand", icon: "🇳🇿" },
];

const placeholders = [
  "Where do you want to go?",
  "Try: Romantic trip in Italy",
  "Try: Adventure in the Sahara",
  "Try: Hidden gems in Southeast Asia",
];

const AIPromptBar = ({ onSearch }: AIPromptBarProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredSuggestions = query.length > 0
    ? suggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSubmit = (value: string) => {
    onSearch(value);
    setQuery(value);
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <section className="relative z-20 -mt-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`relative rounded-2xl transition-all duration-500 ${
            focused ? "discover-prompt-glow" : ""
          }`}
        >
          <div className="relative glass-card rounded-2xl overflow-hidden border-ocean/20">
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-ocean shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
                placeholder={placeholders[placeholderIdx]}
                className="flex-1 bg-transparent text-foreground text-lg font-body placeholder:text-muted-foreground/60 focus:outline-none"
                aria-label="Search destinations"
              />
              <button
                onClick={() => handleSubmit(query)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors shrink-0"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-border/50 overflow-hidden"
                >
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {filteredSuggestions.map((s, i) => (
                      <motion.button
                        key={s.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onMouseDown={() => handleSubmit(s.text)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors text-left group"
                      >
                        <span className="text-lg">{s.icon}</span>
                        <span className="flex-1">{s.text}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIPromptBar;
