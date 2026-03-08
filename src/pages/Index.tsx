import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import { Sparkles, Map, DollarSign, Clock, ArrowRight, Star, ChevronRight } from "lucide-react";
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

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Travel destination" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-20">
          <div className="max-w-2xl animate-in">
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary-foreground/90 mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Plan the Perfect Trip with{" "}
              <span className="text-gradient-sunset">AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 font-body max-w-lg">
              Your AI travel companion that creates personalized itineraries, optimizes budgets, and keeps you updated in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/plan">
                <Button variant="sunset" size="xl" className="w-full sm:w-auto">
                  Plan My Trip
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/discover">
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 gradient-hero">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-in">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything you need to travel smarter
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              AI-powered tools that handle every aspect of your journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`glass-card p-6 hover-lift animate-in-delay-${Math.min(i, 3)}`}>
                <div className="w-12 h-12 rounded-2xl gradient-ocean flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {destinations.map((d, i) => (
              <DestinationCard key={i} {...d} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground">Three simple steps to your dream trip</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-display font-bold text-gradient-ocean mb-4">{s.num}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Loved by travelers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6 hover-lift">
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
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
