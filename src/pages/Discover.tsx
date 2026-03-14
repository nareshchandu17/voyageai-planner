import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import Footer from "@/components/Footer";
import DiscoverHero from "@/components/discover/DiscoverHero";
import AIPromptBar from "@/components/discover/AIPromptBar";
import type { AIDestinationResult } from "@/components/discover/AIPromptBar";
import AIResultsGrid from "@/components/discover/AIResultsGrid";
import CategoryFilter from "@/components/discover/CategoryFilter";
import DestinationTile from "@/components/discover/DestinationTile";
import EditorialSection from "@/components/discover/EditorialSection";
import PopularCarousel from "@/components/discover/PopularCarousel";
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

const allPackages = [
  { slug: "morocco-desert-journey", image: moroccoImg, title: "Morocco Desert Journey", duration: "8 Days / 7 Nights", price: "1,600", category: "Adventure" },
  { slug: "italy-classic", image: italyImg, title: "Italy Classic", duration: "7 Days / 6 Nights", price: "1,400", category: "Romantic" },
  { slug: "paris-classics", image: parisImg, title: "Paris Classics", duration: "6 Days / 5 Nights", price: "1,500", category: "Romantic" },
  { slug: "paris-getaway", image: dubaiImg, title: "Paris Getaway", duration: "5 Days / 4 Nights", price: "1,100", category: "Adventure" },
  { slug: "africa-experience", image: africaImg, title: "Africa Experience", duration: "8 Days / 7 Nights", price: "2,200", category: "Adventure" },
  { slug: "new-york-tour", image: nycImg, title: "New York Tour", duration: "6 Days / 5 Nights", price: "1,300", category: "Adventure" },
  { slug: "paris-trail", image: capetownImg, title: "Paris Trail", duration: "6 Days / 5 Nights", price: "1,200", category: "Romantic" },
  { slug: "bali-cultural-retreat", image: baliImg, title: "Bali Cultural Retreat", duration: "6 Days / 5 Nights", price: "950", category: "Nature" },
  { slug: "japan-spring", image: japanImg, title: "Japan Spring", duration: "7 Days / 6 Nights", price: "1,200", category: "Nature" },
  { slug: "switzerland-explore", image: kyotoImg, title: "Switzerland Explore", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { slug: "switzerland-classic", image: icelandImg, title: "Switzerland Classic", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { slug: "japan-begins-tour", image: tokyoImg, title: "Japan Begins Tour", duration: "7 Days / 6 Nights", price: "1,000", category: "Adventure" },
  { slug: "india-heritage-culture", image: peruImg, title: "India Heritage & Culture", duration: "8 Days / 7 Nights", price: "1,300", category: "Adventure" },
  { slug: "switzerland-natures", image: barcelonaImg, title: "Switzerland Nature's", duration: "5 Days / 4 Nights", price: "1,500", category: "Nature" },
  { slug: "japan-nature", image: maldivesImg, title: "Japan Nature", duration: "7 Days / 6 Nights", price: "1,200", category: "Nature" },
  { slug: "paris-begins", image: heroImg, title: "Paris Begins", duration: "6 Days / 5 Nights", price: "1,500", category: "Romantic" },
  { slug: "australia-coastline", image: australiaImg, title: "Australia Coastline", duration: "7 Days / 6 Nights", price: "1,800", category: "Nature" },
  { slug: "sydney-highlights", image: sydneyImg, title: "Sydney Highlights", duration: "6 Days / 5 Nights", price: "1,650", category: "Adventure" },
  { slug: "discover-egypt", image: egyptImg, title: "Discover Egypt", duration: "6 Days / 5 Nights", price: "1,050", category: "Adventure" },
  { slug: "rome-heritage-tour", image: romeImg, title: "Rome Heritage Tour", duration: "5 Days / 4 Nights", price: "1,350", category: "Romantic" },
  { slug: "santorini-escape", image: santoriniImg, title: "Santorini Escape", duration: "5 Days / 4 Nights", price: "1,750", category: "Romantic" },
  { slug: "singapore-city-tour", image: singaporeImg, title: "Singapore City Tour", duration: "4 Days / 3 Nights", price: "1,100", category: "Adventure" },
  { slug: "dubai-skyline-tour", image: dubaiSkylineImg, title: "Dubai Skyline Tour", duration: "5 Days / 4 Nights", price: "1,400", category: "Luxury" },
  { slug: "amalfi-coast-dream", image: amalfiImg, title: "Amalfi Coast Dream", duration: "6 Days / 5 Nights", price: "1,900", category: "Romantic" },
  { slug: "thailand-paradise", image: thailandImg, title: "Thailand Paradise", duration: "7 Days / 6 Nights", price: "950", category: "Nature" },
  { slug: "dubai-marina-luxury", image: dubaiMarinaImg, title: "Dubai Marina Luxury", duration: "5 Days / 4 Nights", price: "1,600", category: "Luxury" },
  { slug: "new-zealand-explorer", image: newzealandImg, title: "New Zealand Explorer", duration: "8 Days / 7 Nights", price: "2,100", category: "Nature" },
  { slug: "london-classics", image: londonImg, title: "London Classics", duration: "5 Days / 4 Nights", price: "1,250", category: "Adventure" },
  { slug: "paris-romantic-getaway", image: parisEiffelImg, title: "Paris Romantic Getaway", duration: "4 Days / 3 Nights", price: "1,350", category: "Romantic" },
];

const ITEMS_PER_PAGE = 8;

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const filtered = useMemo(() => {
    let result = allPackages;
    if (activeCategory !== "All") {
      result = result.filter((pkg) => pkg.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(q) ||
          pkg.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  // Reset on filter change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  const visiblePackages = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveCategory("All");
    document.getElementById("discover-grid")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DiscoverHero />
      <AIPromptBar onSearch={handleSearch} />
      <CategoryFilter active={activeCategory} onChange={handleCategoryChange} />

      {/* Destination Grid */}
      <section id="discover-grid" className="pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Results count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <p className="text-sm text-muted-foreground font-body">
              <span className="text-foreground font-semibold">{filtered.length}</span> destinations found
              {searchQuery && (
                <span>
                  {" "}for "<span className="text-ocean font-medium">{searchQuery}</span>"
                </span>
              )}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7"
            >
              {visiblePackages.map((pkg, i) => (
                <DestinationTile key={pkg.slug} index={i} {...pkg} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-12">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-ocean"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg font-body">No destinations found. Try a different search.</p>
            </motion.div>
          )}
        </div>
      </section>

      <EditorialSection />
      <PopularCarousel />
      <Footer />
    </div>
  );
};

export default Discover;
