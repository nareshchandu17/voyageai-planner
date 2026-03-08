import { useParams } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { getDestinationBySlug } from "@/data/destinationData";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import DestinationTours from "@/components/DestinationTours";
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

const DestinationDetail = () => {
  const { name } = useParams<{ name: string }>();
  const dest = name ? getDestinationBySlug(name) : undefined;
  const heroRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const titleY = useTransform(scrollY, [0, 500], [0, 80]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.2, 0.55]);

  if (!dest) return <NotFound />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.img
          src={dest.heroImage}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: heroScale }}
        />
        <motion.div className="absolute inset-0 bg-foreground" style={{ opacity: overlayOpacity }} />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ opacity: heroOpacity, y: titleY }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-primary-foreground/70 text-sm sm:text-base uppercase tracking-[0.3em] font-body mb-4"
          >
            Discover
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-6xl sm:text-8xl lg:text-9xl font-display font-bold text-primary-foreground drop-shadow-lg"
          >
            {dest.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-primary-foreground/60 text-base sm:text-lg font-body mt-3 max-w-md text-center"
          >
            {dest.tagline}
          </motion.p>
        </motion.div>

        {/* Floating card image */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-[90%] max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden shadow-[0_25px_80px_-20px_rgba(0,0,0,0.4)]"
          >
            <img
              src={dest.cardImage}
              alt={dest.name}
              className="w-full h-[320px] sm:h-[460px] lg:h-[560px] object-cover"
            />
            {/* Glass info overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm uppercase tracking-widest mb-1">Popular Cities</p>
                  <p className="text-white font-display font-bold text-lg sm:text-xl">{dest.popularCities}</p>
                </div>
                <div className="flex gap-6 sm:gap-10">
                  <div>
                    <p className="text-white/70 text-xs sm:text-sm uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-white font-display font-bold text-base sm:text-lg">{dest.idealDuration}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs sm:text-sm uppercase tracking-widest mb-1">Best Time</p>
                    <p className="text-white font-display font-bold text-base sm:text-lg">{dest.bestTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="pt-[180px] sm:pt-[240px] lg:pt-[300px] pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Popular Cities</p>
                <p className="font-display font-bold text-foreground text-lg">{dest.popularCities}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ideal Duration</p>
                <p className="font-display font-bold text-foreground text-lg">{dest.idealDuration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Best Time to Visit</p>
                <p className="font-display font-bold text-foreground text-lg">{dest.bestTime}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About the Destination */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">About the Destination</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-snug">
                  <WordReveal text={dest.aboutHeadline} />
                </h3>
                {dest.aboutText.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-base sm:text-lg font-body">
                    <WordReveal text={p} delay={0.2 + i * 0.3} />
                  </p>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Gallery image (single wide) */}
          {dest.galleryImages[0] && (
            <ScrollReveal>
              <motion.div
                className="mt-12 rounded-2xl overflow-hidden"
                whileInView={{ scale: [0.95, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <img
                  src={dest.galleryImages[0]}
                  alt={`${dest.name} scenery`}
                  className="w-full h-[300px] sm:h-[420px] object-cover"
                />
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Why Visit */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Why visit this destination</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg font-body">
                  <WordReveal text={dest.whyVisitText} />
                </p>

                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-4">Unique Propositions</h3>
                  <ul className="space-y-2">
                    {dest.uniquePropositions.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                        <span className="font-body">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg font-body">
                  <WordReveal text={dest.whyVisitClosing} delay={0.2} />
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Two-column gallery */}
          {dest.galleryImages.length >= 2 && (
            <ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                {dest.galleryImages.map((img, i) => (
                  <motion.div
                    key={i}
                    className="rounded-2xl overflow-hidden"
                    whileInView={{ scale: [0.95, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  >
                    <img
                      src={img}
                      alt={`${dest.name} gallery ${i + 1}`}
                      className="w-full h-[260px] sm:h-[360px] object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <DestinationTours destSlug={dest.slug} />
      <CTASection />
      <Footer />
    </div>
  );
};

export default DestinationDetail;
