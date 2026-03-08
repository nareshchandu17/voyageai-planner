import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Compass } from "lucide-react";

import japanBg from "@/assets/dest-japan-bg.jpg";
import switzerlandBg from "@/assets/dest-switzerland-bg.jpg";
import parisBg from "@/assets/dest-paris-bg.jpg";
import nycBg from "@/assets/dest-nyc-bg.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";

const destinations = [
  {
    name: "Japan",
    desc: "Technology, vibrant nightlife & traditions",
    cardImage: tokyoImg,
    bgImage: japanBg,
  },
  {
    name: "Switzerland",
    desc: "Romance, culture, and timeless charm",
    cardImage: baliImg,
    bgImage: switzerlandBg,
  },
  {
    name: "Paris",
    desc: "Romance, culture, and timeless charm",
    cardImage: parisImg,
    bgImage: parisBg,
  },
  {
    name: "New York",
    desc: "Diverse culture, iconic skyline, & bustling streets",
    cardImage: nycImg,
    bgImage: nycBg,
  },
];

const MostLovedDestinations = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  // Track scroll progress to determine active card
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const idx = Math.min(Math.floor(v * destinations.length), destinations.length - 1);
      setActiveIndex(idx);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Card flip rotation based on scroll within each "page"
  const cardRotateY = useTransform(scrollYProgress, (v) => {
    const perCard = 1 / destinations.length;
    const localProgress = (v % perCard) / perCard;
    // Flip from 0 to 180 and back within each card's scroll range
    if (localProgress < 0.5) {
      return localProgress * 2 * 180;
    }
    return (1 - localProgress) * 2 * 180;
  });

  const cardScale = useTransform(scrollYProgress, (v) => {
    const perCard = 1 / destinations.length;
    const localProgress = (v % perCard) / perCard;
    // Scale down slightly during flip
    const flipAmount = Math.sin(localProgress * Math.PI);
    return 1 - flipAmount * 0.05;
  });

  return (
    <section ref={sectionRef} style={{ height: `${destinations.length * 100}vh` }} className="relative">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background images with crossfade */}
        {destinations.map((dest, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{ opacity: activeIndex === i ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <img
              src={dest.bgImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ y: bgY, scale: bgScale }}
            />
            <div className="absolute inset-0 bg-foreground/30" />
          </motion.div>
        ))}

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-sm font-medium text-primary-foreground/80 tracking-widest uppercase">
                Most Loved Destinations
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
              Explore The World's Most
              <br />
              Popular Destinations
            </h2>
          </div>

          {/* Flip Card */}
          <div
            className="perspective-[1200px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="relative w-[320px] sm:w-[440px] h-[280px] sm:h-[340px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
              style={{
                rotateY: isHovered ? 0 : cardRotateY,
                scale: isHovered ? 1.03 : cardScale,
                transformStyle: "preserve-3d",
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {/* Card faces */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={destinations[activeIndex].cardImage}
                    alt={destinations[activeIndex].name}
                    className="w-full h-full object-cover"
                  />
                  {/* Card gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

                  {/* Arrow icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/30 backdrop-blur-sm flex items-center justify-center border border-card/20">
                    <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
                  </div>

                  {/* Card text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground mb-1">
                      {destinations[activeIndex].name}
                    </h3>
                    <p className="text-sm sm:text-base text-primary-foreground/80">
                      {destinations[activeIndex].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center gap-2 mt-8">
            {destinations.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  activeIndex === i
                    ? "bg-primary-foreground w-6"
                    : "bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MostLovedDestinations;
