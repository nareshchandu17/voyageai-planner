import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import parisImg from "@/assets/dest-paris-eiffel.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import dubaiImg from "@/assets/dest-dubai-skyline.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import romeImg from "@/assets/dest-rome.jpg";

const popular = [
  { slug: "paris-romantic-getaway", image: parisImg, title: "Paris", rating: 4.9, trips: 2340 },
  { slug: "japan-begins-tour", image: tokyoImg, title: "Tokyo", rating: 4.8, trips: 1890 },
  { slug: "dubai-skyline-tour", image: dubaiImg, title: "Dubai", rating: 4.7, trips: 1650 },
  { slug: "bali-cultural-retreat", image: baliImg, title: "Bali", rating: 4.9, trips: 2100 },
  { slug: "new-york-tour", image: nycImg, title: "New York", rating: 4.6, trips: 1920 },
  { slug: "rome-heritage-tour", image: romeImg, title: "Rome", rating: 4.8, trips: 1780 },
];

const PopularCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold text-ocean tracking-wider uppercase font-body mb-2 block">
              Trending Now
            </span>
            <h2
              className="text-3xl sm:text-4xl font-display font-bold text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Popular Destinations
            </h2>
          </motion.div>

          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Left spacer */}
        <div className="shrink-0 w-[calc((100vw-1400px)/2)]" />

        {popular.map((dest, i) => (
          <Link key={dest.slug} to={`/discover/${dest.slug}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className="shrink-0 w-[300px] snap-start group cursor-pointer"
            >
              <div className="relative h-[380px] rounded-2xl overflow-hidden mb-4">
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-2xl font-bold text-primary-foreground">{dest.title}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="text-sm font-semibold text-foreground">{dest.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dest.trips.toLocaleString()} trips</span>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Right spacer */}
        <div className="shrink-0 w-6" />
      </div>
    </section>
  );
};

export default PopularCarousel;
