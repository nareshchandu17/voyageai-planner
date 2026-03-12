import { motion } from "framer-motion";

import expNature from "@/assets/exp-nature.jpg";
import expCulture from "@/assets/exp-culture.jpg";
import expHistory from "@/assets/exp-history.jpg";
import heroImg from "@/assets/hero-travel.jpg";
import expFuture from "@/assets/exp-future.jpg";

const categories = [
  { label: "All", image: heroImg },
  { label: "Nature", image: expNature },
  { label: "Romantic", image: expCulture },
  { label: "Adventure", image: expHistory },
  { label: "Luxury", image: expFuture },
];

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
}

const CategoryFilter = ({ active, onChange }: CategoryFilterProps) => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-3 sm:gap-4 flex-wrap"
        >
          {categories.map((cat, i) => {
            const isActive = active === cat.label;
            return (
              <motion.button
                key={cat.label}
                onClick={() => onChange(cat.label)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 group"
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="category-active-bg"
                    className="absolute inset-0 rounded-full gradient-ocean shadow-soft"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div
                  className={`relative z-10 w-8 h-8 rounded-full overflow-hidden ring-2 transition-all duration-300 ${
                    isActive
                      ? "ring-primary-foreground/50"
                      : "ring-border/50 group-hover:ring-border"
                  }`}
                >
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                </div>
                <span
                  className={`relative z-10 text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryFilter;
