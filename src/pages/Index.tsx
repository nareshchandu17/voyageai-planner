import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import { Sparkles, Map, DollarSign, Clock, ArrowRight, Star, ChevronRight, Users, Instagram } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AboutSection from "@/components/AboutSection";
import ExploreExperience from "@/components/ExploreExperience";
import MostLovedDestinations from "@/components/MostLovedDestinations";
import TravelPackages from "@/components/TravelPackages";
import WhyChooseUs from "@/components/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import VibeWithUs from "@/components/VibeWithUs";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import heroOceanBg from "@/assets/hero-ocean-bg.jpg";
import heroImg from "@/assets/hero-travel.jpg";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";
import nycImg from "@/assets/dest-nyc.jpg";
import peruImg from "@/assets/dest-peru.jpg";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Sparkles, title: "AI Trip Planner", desc: "Generate personalized itineraries in seconds with our smart AI engine" },
  { icon: Map, title: "Smart Itineraries", desc: "Day-by-day plans with maps, timings, and local recommendations" },
  { icon: DollarSign, title: "Budget Optimization", desc: "Stay on budget with real-time cost tracking and smart alternatives" },
  { icon: Clock, title: "Real-time Updates", desc: "Live weather, transport delays, and local events during your trip" },
];

const steps = [
  { num: "01", title: "Tell us your dream", desc: "Choose destination, dates, budget, and travel style" },
  { num: "02", title: "AI builds your plan", desc: "Our AI creates a perfect day-by-day itinerary" },
  { num: "03", title: "Customize & go", desc: "Tweak your plan, invite friends, and start traveling" },
];

const destinations = [
  { image: tokyoImg, name: "Tokyo", country: "Japan", budget: "$1,200", season: "Spring", rating: 4.9 },
  { image: baliImg, name: "Bali", country: "Indonesia", budget: "$800", season: "Summer", rating: 4.8 },
  { image: parisImg, name: "Paris", country: "France", budget: "$1,500", season: "Autumn", rating: 4.7 },
  { image: nycImg, name: "New York", country: "United States", budget: "$1,800", season: "Year-round", rating: 4.6 },
  { image: peruImg, name: "Machu Picchu", country: "Peru", budget: "$900", season: "May-Sep", rating: 4.9 },
];

const testimonials = [
  { name: "Sarah Chen", role: "Solo Traveler", text: "VoyageAI planned my entire Japan trip in minutes. Every restaurant, every train — perfect.", rating: 5 },
  { name: "Marco Rivera", role: "Digital Nomad", text: "The budget tracking saved me hundreds. I could see exactly where my money was going.", rating: 5 },
  { name: "Emma Watson", role: "Family Traveler", text: "Planning trips with kids is chaos. VoyageAI made our Bali vacation stress-free.", rating: 5 },
];

const floatingPhotos = [
  { src: heroImg, alt: "Santorini", className: "absolute top-20 left-[3%] w-48 sm:w-56 h-36 sm:h-44 -rotate-6 z-10", speed: 0.3 },
  { src: parisImg, alt: "Paris", className: "absolute bottom-28 left-[5%] w-44 sm:w-52 h-32 sm:h-40 rotate-3 z-10", speed: -0.2 },
  { src: tokyoImg, alt: "Tokyo", className: "absolute top-16 right-[2%] w-44 sm:w-52 h-36 sm:h-44 rotate-6 z-10", speed: 0.4 },
  { src: peruImg, alt: "Peru", className: "absolute bottom-24 right-[4%] w-48 sm:w-56 h-32 sm:h-40 -rotate-3 z-10", speed: -0.15 },
];

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const oceanRef = useRef<HTMLImageElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Framer Motion transforms for cinematic ocean depth
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.25, 0.6]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* GSAP cinematic entrance — ocean surge forward */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial cinematic zoom-in on the ocean
      gsap.fromTo(
        oceanRef.current,
        { scale: 1.35, filter: "blur(8px) brightness(0.6)" },
        {
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 3,
          ease: "power3.out",
        }
      );

      // Vignette overlay entrance
      gsap.fromTo(
        heroOverlayRef.current,
        { opacity: 0.6 },
        { opacity: 0.1, duration: 3, ease: "power3.out" }
      );

      // Scroll-driven deep zoom into the ocean — "move forward into the sea"
      gsap.to(oceanRef.current, {
        scale: 1.55,
        y: -80,
        filter: "brightness(0.85)",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero — Cinematic parallax collage */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ocean background with cinematic zoom-forward animation */}
        <div className="absolute inset-0 hero-cinematic-container overflow-hidden">
          <img
            ref={oceanRef}
            src={heroOceanBg}
            alt=""
            className="w-full h-full object-cover will-change-transform origin-[50%_60%]"
          />
          {/* Dynamic radial vignette for depth-of-field feel */}
          <motion.div
            ref={heroOverlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: vignetteOpacity,
              background: "radial-gradient(ellipse at 50% 70%, transparent 25%, hsl(var(--foreground)) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-foreground/10" />
        </div>

        {/* Floating photo cards with parallax — 4 cards */}
        <div className="hidden sm:block">
          {floatingPhotos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 + i * 0.2, ease: "easeOut" }}
              className={`${photo.className} rounded-2xl overflow-hidden shadow-glass-lg border-4 border-card/80 will-change-transform`}
              style={{
                transform: `translateY(${scrollY * photo.speed}px)`,
              }}
            >
              <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Center content with parallax */}
        <div
          className="relative z-20 text-center px-4 max-w-3xl mx-auto pt-20"
          style={{ transform: `translateY(${scrollY * 0.1}px)`, opacity: Math.max(0, 1 - scrollY * 0.002) }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold text-primary-foreground leading-[1.05] mb-6 animate-in drop-shadow-lg">
            Experience the World,
            <br />
            <span className="italic">Not Just the Map</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-10 font-body font-medium animate-in-delay-1 drop-shadow-md">
            Curated Journeys Designed To Be Felt, Not Rushed.
          </p>
          <div className="animate-in-delay-2">
            <Link to="/plan">
              <Button variant="glass" size="xl" className="bg-card/90 text-foreground font-semibold shadow-glass-lg hover:bg-card gap-3 px-10">
                Book a trip
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Social proof bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-foreground/20 backdrop-blur-md border-t border-card/10">
            <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Star className="w-5 h-5 fill-sunset text-sunset" />
                <span className="text-sm font-medium"><strong>4.9</strong> stars (541k Reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium"><strong>50k</strong> travellers</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium"><strong>1+ million</strong> followers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <AboutSection />

      {/* Explore by Experience */}
      <ExploreExperience />

      {/* Most Loved Destinations */}
      <MostLovedDestinations />

      {/* Travel Packages */}
      <TravelPackages />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Blog / Inspiration */}
      <BlogSection />

      {/* FAQ */}
      <FAQSection />

      {/* Vibe With Us */}
      <VibeWithUs />

      {/* CTA - Dreams Into Reality */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;