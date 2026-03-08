import { useParams, Link } from "react-router-dom";
import CTASection from "@/components/CTASection";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Clock, Plane, Users, Tag, Info, ChevronDown, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import TourReviews from "@/components/TourReviews";
import { getTourBySlug, getSimilarTours } from "@/data/tourData";
import NotFound from "./NotFound";

const WordReveal = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: delay + i * 0.04, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const SectionReveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
  title: string;
}

const Lightbox = ({ images, currentIndex, onClose, onChange, title }: LightboxProps) => {
  const go = useCallback(
    (dir: number) => {
      const next = (currentIndex + dir + images.length) % images.length;
      onChange(next);
    },
    [currentIndex, images.length, onChange]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [go, onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/90 backdrop-blur-xl z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 pointer-events-none"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 w-11 h-11 rounded-full bg-card/20 backdrop-blur-md border border-white/15 flex items-center justify-center pointer-events-auto hover:bg-card/40 transition-colors z-10"
        >
          <X className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* Counter */}
        <div className="absolute top-5 left-5 sm:top-8 sm:left-8 text-primary-foreground/70 text-sm font-medium pointer-events-auto z-10">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Prev */}
        <button
          onClick={() => go(-1)}
          className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-card/20 backdrop-blur-md border border-white/15 flex items-center justify-center pointer-events-auto hover:bg-card/40 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${title} photo ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-auto"
          />
        </AnimatePresence>

        {/* Next */}
        <button
          onClick={() => go(1)}
          className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-card/20 backdrop-blur-md border border-white/15 flex items-center justify-center pointer-events-auto hover:bg-card/40 transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 text-primary-foreground" />
        </button>
      </motion.div>
    </>
  );
};

const TourDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const tour = slug ? getTourBySlug(slug) : undefined;
  const heroRef = useRef<HTMLElement>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const titleY = useTransform(scrollY, [0, 500], [0, 80]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.25, 0.6]);

  if (!tour) return <NotFound />;

  const similar = getSimilarTours(tour.slug, tour.category, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — 90vh */}
      <section ref={heroRef} className="relative h-[90vh] overflow-hidden">
        <motion.img
          src={tour.heroImage}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: heroScale }}
        />
        <motion.div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: overlayOpacity }}
        />

        <motion.div
          className="absolute bottom-12 left-6 sm:left-12 lg:left-20 z-10"
          style={{ opacity: heroOpacity, y: titleY }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight drop-shadow-lg max-w-3xl"
            style={{ fontStyle: "italic" }}
          >
            {tour.title}
          </motion.h1>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left Content — 2/3 */}
            <div className="lg:col-span-2 space-y-16">
              {/* Trip Overview */}
              <SectionReveal>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🧭</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Trip Overview</h2>
                </div>
                <div className="space-y-4">
                  {tour.overview.map((p, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed text-base sm:text-lg font-body">
                      <WordReveal text={p} delay={i * 0.3} />
                    </p>
                  ))}
                </div>
              </SectionReveal>

              {/* Gallery Image */}
              <SectionReveal delay={0.1}>
                <motion.div
                  className="rounded-2xl overflow-hidden"
                  whileInView={{ scale: [0.95, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <img
                    src={tour.galleryImages[1] || tour.image}
                    alt={`${tour.title} scenery`}
                    className="w-full h-[300px] sm:h-[420px] object-cover"
                  />
                </motion.div>
              </SectionReveal>

              {/* Trip Highlights */}
              <SectionReveal>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">✨</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Trip Highlights</h2>
                </div>
                <ul className="space-y-3">
                  {tour.highlights.map((h, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                      <span className="text-base sm:text-lg font-body">{h}</span>
                    </motion.li>
                  ))}
                </ul>
              </SectionReveal>

              {/* Detailed Itinerary */}
              <SectionReveal>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8">Detailed Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((day, i) => {
                    const isOpen = openDay === i;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        className="border border-border rounded-2xl overflow-hidden bg-card"
                      >
                        <button
                          onClick={() => setOpenDay(isOpen ? null : i)}
                          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <span className="font-display text-lg font-bold text-foreground">
                            Day {day.day}: {day.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <p className="px-6 pb-5 text-muted-foreground font-body leading-relaxed">
                                {day.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </SectionReveal>

              {/* What's Included */}
              <SectionReveal>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">✅</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">What's Included</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-3">Inclusions</h3>
                    <ul className="space-y-2">
                      {tour.includedItems.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                          <span className="font-body">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-foreground mb-3">Exclusions</h3>
                    <ul className="space-y-2">
                      {tour.excludedItems.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                          <span className="font-body">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionReveal>

              {/* Traveler Reviews */}
              <SectionReveal>
                <TourReviews tourSlug={tour.slug} tourTitle={tour.title} />
              </SectionReveal>
            </div>

            {/* Right Sidebar — Sticky Trip Details */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <SectionReveal delay={0.2}>
                  <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-soft">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-6">Trip Details</h3>
                    <div className="border-t border-border" />

                    <div className="space-y-5 mt-6">
                      <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Duration:</span>
                          <span className="ml-3 font-bold text-foreground">{tour.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Plane className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Departure:</span>
                          <span className="ml-3 font-bold text-foreground">{tour.departure}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Group Size:</span>
                          <span className="ml-3 font-bold text-foreground">{tour.groupSize}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="ml-3 font-bold text-foreground">${tour.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Info className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Inclusions:</span>
                          <span className="ml-3 font-bold text-foreground">{tour.inclusions}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingOpen(true)}
                      className="mt-8 flex items-center justify-center gap-3 w-full bg-foreground text-background font-semibold py-3.5 rounded-full hover:bg-foreground/90 transition-colors text-sm"
                    >
                      Book a trip
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tour.galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setLightboxIndex(i)}
                className="rounded-2xl overflow-hidden h-[200px] sm:h-[300px] lg:h-[380px] cursor-pointer"
              >
                <img src={img} alt={`${tour.title} gallery ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Similar Tours */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionReveal>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-2xl">🏔️</span>
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Similar Tour</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
                Journeys Designed For Every
                <br />
                Travel Style
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similar.map((pkg, i) => (
              <SectionReveal key={pkg.slug} delay={i * 0.1}>
                <Link to={`/discover/${pkg.slug}`}>
                  <motion.div
                    className="group cursor-pointer"
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
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={tour.galleryImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={setLightboxIndex}
            title={tour.title}
          />
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        tourTitle={tour.title}
        tourPrice={tour.price}
        tourDuration={tour.duration}
      />
    </div>
  );
};

export default TourDetail;
