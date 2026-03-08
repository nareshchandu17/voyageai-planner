import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import { Sparkles, Map, DollarSign, Clock, ArrowRight, Star, ChevronRight, Users, Instagram } from "lucide-react";
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
  { src: heroImg, alt: "Santorini", className: "absolute top-[10%] left-[2%] w-40 sm:w-48 lg:w-56 h-28 sm:h-36 lg:h-40 -rotate-[28deg] z-10", speed: 0.3 },
  { src: parisImg, alt: "Paris", className: "absolute bottom-[16%] left-[1%] w-36 sm:w-44 lg:w-52 h-28 sm:h-32 lg:h-38 rotate-[22deg] z-10", speed: -0.2 },
  { src: tokyoImg, alt: "Tokyo", className: "absolute top-[8%] right-[1%] w-40 sm:w-48 lg:w-56 h-28 sm:h-36 lg:h-40 rotate-[28deg] z-10", speed: 0.4 },
  { src: peruImg, alt: "Peru", className: "absolute bottom-[14%] right-[2%] w-38 sm:w-44 lg:w-52 h-28 sm:h-34 lg:h-38 -rotate-[22deg] z-10", speed: -0.15 },
];

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

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

  return (
    <div className="min-h-screen">
      {/* Hero — Cinematic parallax collage */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ocean background with cinematic zoom-forward animation */}
        <div className="absolute inset-0 hero-cinematic-container">
          <img
            src={heroOceanBg}
            alt=""
            className="w-full h-full object-cover hero-cinematic-zoom"
            style={{ transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.15}px)` }}
          />
          <div className="absolute inset-0 bg-foreground/10" />

          {/* Animated sea waves */}
          <svg className="hero-wave hero-wave-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="hsl(var(--primary-foreground))" />
          </svg>
          <svg className="hero-wave hero-wave-2" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ bottom: '10px' }}>
            <path d="M0,40 C240,100 480,0 720,50 C960,100 1200,10 1440,40 L1440,100 L0,100 Z" fill="hsl(var(--primary-foreground))" />
          </svg>
          <svg className="hero-wave hero-wave-3" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ bottom: '5px' }}>
            <path d="M0,30 C180,80 540,0 900,40 C1080,60 1320,20 1440,30 L1440,80 L0,80 Z" fill="hsl(var(--primary-foreground))" />
          </svg>
        </div>

        {/* Floating photo cards with parallax */}
        <div className="hidden sm:block">
          {floatingPhotos.map((photo, i) => (
            <div
              key={i}
              className={`${photo.className} rounded-2xl overflow-hidden shadow-2xl transition-transform duration-100 hover:scale-105 will-change-transform`}
              style={{
                transform: `translateY(${scrollY * photo.speed}px)`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
            </div>
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
