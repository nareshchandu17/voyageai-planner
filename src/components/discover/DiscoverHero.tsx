import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import toursHeroBg from "@/assets/tours-hero-bg.jpg";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${8 + Math.random() * 12}s`,
  size: `${2 + Math.random() * 3}px`,
}));

const wordRevealVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const wordChild = {
  hidden: { opacity: 0, y: 40, filter: "blur(14px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const DiscoverHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.35], [0, -60]);

  const headline = "Discover the World's Hidden Journeys";

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <img
          src={toursHeroBg}
          alt="Cinematic travel landscape"
          className="w-full h-full object-cover hero-cinematic-zoom"
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="discover-particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Hero content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: textOpacity, y: textY }}
      >
        <motion.div
          variants={wordRevealVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6"
        >
          {headline.split(" ").map((word, i) => (
            <motion.span
              key={i}
              variants={wordChild}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-primary-foreground drop-shadow-2xl tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg sm:text-xl text-primary-foreground/80 font-body font-medium max-w-2xl mb-10 drop-shadow-md"
        >
          AI-curated travel experiences designed to be felt, not rushed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="ocean"
            size="xl"
            className="rounded-full group"
            onClick={() =>
              document.getElementById("discover-grid")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Destinations
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Link to="/plan">
            <Button
              variant="glass"
              size="xl"
              className="rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-white/15"
            >
              <Sparkles className="w-5 h-5" />
              Plan My Trip with AI
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default DiscoverHero;
