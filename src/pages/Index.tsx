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
  { src: heroImg, alt: "Santorini", className: "absolute top-20 left-[3%] w-48 sm:w-56 h-36 sm:h-44 -rotate-6 z-10", speed: 0.3 },
  { src: parisImg, alt: "Paris", className: "absolute bottom-28 left-[5%] w-44 sm:w-52 h-32 sm:h-40 rotate-3 z-10", speed: -0.2 },
  { src: tokyoImg, alt: "Tokyo", className: "absolute top-16 right-[2%] w-44 sm:w-52 h-36 sm:h-44 rotate-6 z-10", speed: 0.4 },
  { src: peruImg, alt: "Peru", className: "absolute bottom-24 right-[4%] w-48 sm:w-56 h-32 sm:h-40 -rotate-3 z-10", speed: -0.15 },
  { src: baliImg, alt: "Bali", className: "absolute top-1/2 -translate-y-1/2 left-[15%] w-40 sm:w-48 h-28 sm:h-36 rotate-2 z-[5] hidden lg:block", speed: 0.25 },
  { src: nycImg, alt: "NYC", className: "absolute top-1/2 -translate-y-1/2 right-[14%] w-40 sm:w-48 h-28 sm:h-36 -rotate-4 z-[5] hidden lg:block", speed: -0.35 },
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
        </div>

        {/* Floating photo cards with parallax */}
        <div className="hidden sm:block">
          {floatingPhotos.map((photo, i) => (
            <div
              key={i}
              className={`${photo.className} rounded-2xl overflow-hidden shadow-glass-lg border-4 border-card/80 transition-transform duration-100 hover:scale-105 will-change-transform`}
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

      {/* Features */}
      <section className="py-20 sm:py-28 gradient-hero">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Everything you need to travel smarter
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                AI-powered tools that handle every aspect of your journey
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="glass-card p-6 hover-lift h-full">
                  <div className="w-12 h-12 rounded-2xl gradient-ocean flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                  Trending destinations
                </h2>
                <p className="text-muted-foreground">Most popular places our travelers are exploring</p>
              </div>
              <Link to="/discover" className="hidden sm:flex items-center gap-1 text-sm text-ocean font-medium hover:gap-2 transition-all">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {destinations.map((d, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <DestinationCard {...d} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                How it works
              </h2>
              <p className="text-muted-foreground">Three simple steps to your dream trip</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="text-center">
                  <div className="text-5xl font-display font-bold text-gradient-ocean mb-4">{s.num}</div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Loved by travelers
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="glass-card p-6 hover-lift h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-sunset text-sunset" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="gradient-ocean rounded-3xl p-10 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready for your next adventure?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                Let AI plan the trip of a lifetime. Start free, no credit card required.
              </p>
              <Link to="/plan">
                <Button variant="sunset" size="xl">
                  Start Planning Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-ocean flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">VoyageAI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 VoyageAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
