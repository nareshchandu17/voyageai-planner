import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Footer from "@/components/Footer";

import toursHeroBg from "@/assets/tours-hero-bg.jpg";
import moroccoImg from "@/assets/pkg-morocco.jpg";
import italyImg from "@/assets/pkg-italy.jpg";
import africaImg from "@/assets/pkg-africa.jpg";
import japanImg from "@/assets/pkg-japan.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import peruImg from "@/assets/dest-peru.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import barcelonaImg from "@/assets/dest-barcelona.jpg";
import dubaiImg from "@/assets/dest-dubai.jpg";
import kyotoImg from "@/assets/dest-kyoto.jpg";
import capetownImg from "@/assets/dest-capetown.jpg";
import icelandImg from "@/assets/dest-iceland.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expCulture from "@/assets/exp-culture.jpg";
import expHistory from "@/assets/exp-history.jpg";
import heroImg from "@/assets/hero-travel.jpg";
import australiaImg from "@/assets/dest-australia.jpg";
import sydneyImg from "@/assets/dest-sydney.jpg";
import egyptImg from "@/assets/dest-egypt.jpg";
import romeImg from "@/assets/dest-rome.jpg";
import santoriniImg from "@/assets/dest-santorini.jpg";
import singaporeImg from "@/assets/dest-singapore.jpg";
import dubaiSkylineImg from "@/assets/dest-dubai-skyline.jpg";
import amalfiImg from "@/assets/dest-amalfi.jpg";
import thailandImg from "@/assets/dest-thailand.jpg";
import dubaiMarinaImg from "@/assets/dest-dubai-marina.jpg";
import newzealandImg from "@/assets/dest-newzealand.jpg";
import londonImg from "@/assets/dest-london.jpg";
import parisEiffelImg from "@/assets/dest-paris-eiffel.jpg";

const categories = [
  { label: "All", image: heroImg },
  { label: "Nature", image: expNature },
  { label: "Romantic", image: expCulture },
  { label: "Adventure", image: expHistory },
];

const allPackages = [
  { image: moroccoImg, title: "Morocco Desert Journey", duration: "8 Days / 7 Nights", price: "1,600", category: "Adventure" },
  { image: italyImg, title: "Italy Classic", duration: "7 Days / 6 Nights", price: "1,400", category: "Romantic" },
  { image: parisImg, title: "Paris Classics", duration: "6 Days / 5 Nights", price: "1,500", category: "Romantic" },
  { image: dubaiImg, title: "Paris Getaway", duration: "5 Days / 4 Nights", price: "1,100", category: "Adventure" },
  { image: africaImg, title: "Africa Experience", duration: "8 Days / 7 Nights", price: "2,200", category: "Adventure" },
  { image: nycImg, title: "New York Tour", duration: "6 Days / 5 Nights", price: "1,300", category: "Adventure" },
  { image: capetownImg, title: "Paris Trail", duration: "6 Days / 5 Nights", price: "1,200", category: "Romantic" },
  { image: baliImg, title: "Bali Cultural Retreat", duration: "6 Days / 5 Nights", price: "950", category: "Nature" },
  { image: japanImg, title: "Japan Spring", duration: "7 Days / 6 Nights", price: "1,200", category: "Nature" },
  { image: kyotoImg, title: "Switzerland Explore", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { image: icelandImg, title: "Switzerland Classic", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { image: tokyoImg, title: "Japan Begins Tour", duration: "7 Days / 6 Nights", price: "1,000", category: "Adventure" },
  { image: peruImg, title: "India Heritage & Culture", duration: "8 Days / 7 Nights", price: "1,300", category: "Adventure" },
  { image: barcelonaImg, title: "Switzerland Nature's", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { image: maldivesImg, title: "Japan Nature", duration: "7 Days / 6 Nights", price: "1,200", category: "Nature" },
  { image: heroImg, title: "Paris Begins", duration: "6 Days / 5 Nights", price: "1,500", category: "Romantic" },
  { image: australiaImg, title: "Australia Coastline", duration: "7 Days / 6 Nights", price: "1,800", category: "Nature" },
  { image: sydneyImg, title: "Sydney Highlights", duration: "6 Days / 5 Nights", price: "1,650", category: "Adventure" },
  { image: egyptImg, title: "Discover Egypt", duration: "6 Days / 5 Nights", price: "1,050", category: "Adventure" },
  { image: romeImg, title: "Rome Heritage Tour", duration: "5 Days / 4 Nights", price: "1,350", category: "Romantic" },
  { image: santoriniImg, title: "Santorini Escape", duration: "5 Days / 4 Nights", price: "1,750", category: "Romantic" },
  { image: singaporeImg, title: "Singapore City Tour", duration: "4 Days / 3 Nights", price: "1,100", category: "Adventure" },
  { image: dubaiSkylineImg, title: "Dubai Skyline Tour", duration: "5 Days / 4 Nights", price: "1,400", category: "Adventure" },
  { image: amalfiImg, title: "Amalfi Coast Dream", duration: "6 Days / 5 Nights", price: "1,900", category: "Romantic" },
  { image: thailandImg, title: "Thailand Paradise", duration: "7 Days / 6 Nights", price: "950", category: "Nature" },
  { image: dubaiMarinaImg, title: "Dubai Marina Luxury", duration: "5 Days / 4 Nights", price: "1,600", category: "Adventure" },
  { image: newzealandImg, title: "New Zealand Explorer", duration: "8 Days / 7 Nights", price: "2,100", category: "Nature" },
  { image: londonImg, title: "London Classics", duration: "5 Days / 4 Nights", price: "1,250", category: "Adventure" },
  { image: parisEiffelImg, title: "Paris Romantic Getaway", duration: "4 Days / 3 Nights", price: "1,350", category: "Romantic" },
];

const ITEMS_PER_PAGE = 8;

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newlyLoadedStart, setNewlyLoadedStart] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  const textOpacity = useTransform(scrollY, [0, typeof window !== "undefined" ? window.innerHeight * 0.35 : 300], [1, 0]);
  const textBlur = useTransform(scrollY, [0, typeof window !== "undefined" ? window.innerHeight * 0.35 : 300], [0, 12]);

  const filtered = useMemo(() => {
    return allPackages.filter((pkg) =>
      activeCategory === "All" || pkg.category === activeCategory
    );
  }, [activeCategory]);

  // Reset visible count on category change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setNewlyLoadedStart(null);
  }, [activeCategory]);

  const visiblePackages = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    const prevCount = visibleCount;
    setTimeout(() => {
      setNewlyLoadedStart(prevCount);
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
      setLoadingMore(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <img
          src={toursHeroBg}
          alt="Curated Tours"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/20" />

        <motion.div
          className="relative z-10 text-center px-4"
          style={{ opacity: textOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-5 drop-shadow-lg"
            style={{ filter: useTransform(textBlur, (v) => `blur(${v}px)`) }}
          >
            Curated Tours
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-lg sm:text-xl text-primary-foreground/90 font-body font-medium drop-shadow-md"
          >
            Curated Journeys Designed To Be Felt, Not Rushed.
          </motion.p>
        </motion.div>
      </section>

      {/* Category Filters */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center gap-8 sm:gap-12 mb-16 sm:mb-20"
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300 ${
                    activeCategory === cat.label
                      ? "ring-[3px] ring-ocean ring-offset-[3px] ring-offset-background shadow-glass-lg"
                      : "ring-1 ring-border/50 opacity-75 group-hover:opacity-100 group-hover:ring-border"
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeCategory === cat.label
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Package Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
            >
              {visiblePackages.map((pkg, i) => {
                const isNewlyLoaded = newlyLoadedStart !== null && i >= newlyLoadedStart;
                const staggerIndex = isNewlyLoaded ? i - newlyLoadedStart : i;

                return (
                  <motion.div
                    key={`${pkg.title}-${i}`}
                    initial={isNewlyLoaded ? { opacity: 0, x: -40, y: 20 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: isNewlyLoaded ? staggerIndex * 0.12 : i * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="group cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="relative h-[320px] sm:h-[380px] rounded-2xl overflow-hidden mb-4">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/15 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="bg-ocean/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                            {pkg.duration}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1">
                        {pkg.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From $ <span className="text-foreground font-bold text-base">${pkg.price}</span> / Per Person
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-14"
            >
              <motion.button
                onClick={handleLoadMore}
                disabled={loadingMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-foreground text-background font-semibold px-10 py-3.5 rounded-full text-sm hover:bg-foreground/90 transition-colors disabled:opacity-60 shadow-soft"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </motion.button>
            </motion.div>
          )}

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">No tours found for this category.</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Discover;
