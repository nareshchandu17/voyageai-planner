import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

import santoriniImg from "@/assets/dest-santorini.jpg";
import amalfiImg from "@/assets/dest-amalfi.jpg";
import icelandImg from "@/assets/dest-iceland.jpg";

const gems = [
  {
    slug: "santorini-escape",
    image: santoriniImg,
    title: "Santorini Escape",
    subtitle: "Greek Islands",
    desc: "Whitewashed cliffs, volcanic sunsets, and Aegean blue — a dream suspended between sea and sky.",
    price: "1,750",
  },
  {
    slug: "amalfi-coast-dream",
    image: amalfiImg,
    title: "Amalfi Coast Dream",
    subtitle: "Southern Italy",
    desc: "Lemon groves, pastel villages clinging to cliffs, and the scent of the Mediterranean.",
    price: "1,900",
  },
  {
    slug: "switzerland-classic",
    image: icelandImg,
    title: "Iceland Wonders",
    subtitle: "Nordic Magic",
    desc: "Where glaciers meet volcanoes and the Northern Lights dance across endless skies.",
    price: "1,500",
  },
];

const EditorialSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-8 h-8 rounded-lg gradient-ocean flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-ocean tracking-wider uppercase font-body">
            Editor's Pick
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-14 max-w-xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Hidden Gems Worth Discovering
        </motion.h2>

        {/* Editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Large hero tile */}
          <motion.div style={{ y: y1 }}>
            <Link to={`/discover/${gems[0].slug}`} className="group block">
              <div className="relative h-[500px] lg:h-[620px] rounded-3xl overflow-hidden">
                <img
                  src={gems[0].image}
                  alt={gems[0].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-flex items-center gap-1.5 bg-ocean/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <Sparkles className="w-3 h-3" />
                    AI Pick
                  </span>
                  <p className="text-primary-foreground/60 text-sm font-medium mb-1">{gems[0].subtitle}</p>
                  <h3 className="font-display text-3xl font-bold text-primary-foreground mb-2">{gems[0].title}</h3>
                  <p className="text-primary-foreground/70 text-sm font-body max-w-md mb-3">{gems[0].desc}</p>
                  <span className="text-primary-foreground font-bold text-lg">From ${gems[0].price}</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stacked side tiles */}
          <motion.div style={{ y: y2 }} className="flex flex-col gap-6 lg:gap-8">
            {gems.slice(1).map((gem, i) => (
              <Link key={gem.slug} to={`/discover/${gem.slug}`} className="group block flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative h-full min-h-[280px] rounded-3xl overflow-hidden"
                >
                  <img
                    src={gem.image}
                    alt={gem.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-primary-foreground/60 text-xs font-medium mb-1">{gem.subtitle}</p>
                    <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">{gem.title}</h3>
                    <p className="text-primary-foreground/70 text-sm font-body">{gem.desc}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary-foreground font-bold">From ${gem.price}</span>
                      <ArrowRight className="w-4 h-4 text-primary-foreground/60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
