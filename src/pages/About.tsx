import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import aboutLeft from "@/assets/about-left.jpg";
import aboutRight1 from "@/assets/about-right-1.jpg";
import aboutRight2 from "@/assets/about-right-2.jpg";
import aboutRight3 from "@/assets/about-right-3.jpg";
import heroTravel from "@/assets/hero-travel.jpg";
import ctaBg from "@/assets/cta-resort-bg.jpg";
import teamCeo from "@/assets/team-ceo.jpg";
import teamCreative from "@/assets/team-creative.jpg";
import teamOperations from "@/assets/team-operations.jpg";
import teamCommunity from "@/assets/team-community.jpg";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

/* ── Blur-in word reveal ── */
const BlurReveal = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, filter: "blur(12px)", y: 14 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: delay + i * 0.045, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

/* ── Floating 3-D shapes for milestones bg ── */
const FloatingGeo = () => (
  <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
    <mesh>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial color="hsl(210,70%,40%)" wireframe transparent opacity={0.15} />
    </mesh>
  </Float>
);

/* ── Stat pill used in milestones ── */
const StatPill = ({
  value,
  label,
  side,
  index,
}: {
  value: string;
  label: string;
  side: "left" | "right";
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: side === "left" ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay: 0.15 * index, ease: "easeOut" }}
    className="flex items-center gap-3"
  >
    <span className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground">{value}</span>
    <span className="text-sm sm:text-base text-primary-foreground/70 font-body">{label}</span>
  </motion.div>
);

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 700], [1, 1.18]);
  const heroTextY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  /* GSAP scroll-triggered animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Parallax on large images */
      gsap.utils.toArray<HTMLImageElement>(".gsap-parallax-img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      /* Fade-up blocks */
      gsap.utils.toArray<HTMLElement>(".gsap-fade-up").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      });

      /* Horizontal line draw */
      gsap.utils.toArray<HTMLElement>(".gsap-line-draw").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative h-[85vh] sm:h-screen overflow-hidden">
        <motion.img
          src={heroTravel}
          alt="About hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: heroScale }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(18px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold text-white leading-tight"
          >
            About our Enthusiasm
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-lg sm:text-xl text-white/80 font-body max-w-xl"
          >
            Curated Journeys Designed To Be Felt, Not Rushed.
          </motion.p>
        </motion.div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,80 L0,40 Q720,0 1440,40 L1440,80 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ═══════════ MISSION STATEMENT ═══════════ */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-snug mb-16">
            <BlurReveal text="Creating Travel Experiences That Connect People Through Community, Care & Planning" />
          </h2>

          {/* Wide image with parallax */}
          <div className="gsap-fade-up rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[320px] sm:h-[480px] overflow-hidden">
              <img
                src={aboutLeft}
                alt="Community travel"
                className="gsap-parallax-img absolute inset-0 w-full h-[120%] object-cover"
              />
            </div>
          </div>

          {/* Two-col text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
            <div className="gsap-fade-up">
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-body">
                Founded on the belief that travel should be personal and enriching, we reimagined how people experience it together. Our passion for meaningful journeys has grown into a trusted travel brand.
              </p>
            </div>
            <div className="gsap-fade-up">
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-body">
                We have evolved with our travelers. From weekend getaways to group journeys, every itinerary reflects our commitment to authenticity and safety. Our focus is on bringing travelers together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DIVIDER LINE ═══════════ */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="gsap-line-draw h-px bg-border origin-left" />
      </div>

      {/* ═══════════ OUR JOURNEY ═══════════ */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /><path d="M12 6v6l4 2" />
              </svg>
            </span>
            <span className="text-sm font-medium text-muted-foreground tracking-wide font-body">Our Journey</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground text-center leading-snug mb-16 max-w-3xl mx-auto">
            <BlurReveal text="From A Simple Idea To A Trusted Travel Partner" />
          </h2>

          {/* Image + content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Image */}
            <div className="gsap-fade-up rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-[360px] sm:h-[480px] overflow-hidden">
                <img
                  src={aboutRight1}
                  alt="Our journey"
                  className="gsap-parallax-img absolute inset-0 w-full h-[120%] object-cover"
                />
              </div>
            </div>

            {/* Foundation + Goals */}
            <div className="flex flex-col justify-center space-y-10">
              <div className="gsap-fade-up">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Foundation</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-body">
                  Founded in 2021, we aimed to make travel meaningful and seamless. What began as an idea for solo explorers has evolved into a top travel brand, offering weekend getaways, group trips, retreats and journeys.
                </p>
              </div>

              <div className="gsap-line-draw h-px bg-border origin-left" />

              <div className="gsap-fade-up">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Future Goals</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-body">
                  We are committed to expanding offerings with local guides, ensuring travelers enjoy unique experiences. Our mission is to empower exploration, creating lasting memories and connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MILESTONES ═══════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Dark background image */}
        <div className="absolute inset-0">
          <img src={ctaBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/80" />
        </div>

        {/* Three.js floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.3} />
            <Stars radius={80} depth={60} count={800} factor={3} saturation={0} fade speed={0.8} />
            <FloatingGeo />
          </Canvas>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground text-center mb-16"
          >
            Milestones
          </motion.h2>

          {/* Stats + center image layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Left stats */}
            <div className="flex flex-col items-end gap-10 sm:gap-14">
              <StatPill value="10,000+" label="Trips" side="left" index={0} />
              <StatPill value="60+" label="Destinations" side="left" index={1} />
              <StatPill value="100+" label="Partners" side="left" index={2} />
            </div>

            {/* Center image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto"
            >
              <div className="w-[260px] sm:w-[320px] h-[360px] sm:h-[460px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img src={aboutRight2} alt="Milestone" className="w-full h-full object-cover" />
              </div>
              {/* Subtle glow */}
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/10 blur-2xl -z-10" />
            </motion.div>

            {/* Right stats */}
            <div className="flex flex-col items-start gap-10 sm:gap-14">
              <StatPill value="50,000+" label="Travelers" side="right" index={0} />
              <StatPill value="99%" label="Satisfaction" side="right" index={1} />
              <StatPill value="4.8 / 5" label="Rating" side="right" index={2} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground text-center mb-6">
            <BlurReveal text="What We Stand For" />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-center text-lg font-body max-w-2xl mx-auto mb-16"
          >
            Every journey we craft is guided by these core principles.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Authenticity", desc: "Real experiences with local communities, not tourist traps. We connect you with the soul of every destination.", img: aboutRight3 },
              { title: "Community", desc: "Travel is better together. We build connections between travelers, guides, and locals that last a lifetime.", img: aboutRight1 },
              { title: "Sustainability", desc: "We're committed to responsible travel that preserves cultures and environments for future generations.", img: aboutRight2 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="group"
              >
                <div className="rounded-2xl overflow-hidden shadow-lg mb-6 h-[220px] sm:h-[280px]">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
