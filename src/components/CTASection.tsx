import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plane, Globe, Gem, Palmtree, CreditCard, Hotel, Bus } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import ctaBg from "@/assets/cta-resort-bg.jpg";

const marqueeItems = [
  { icon: Bus, label: "Transfers & Rentals" },
  { icon: Plane, label: "Custom Tours" },
  { icon: Globe, label: "Worldwide Destinations" },
  { icon: Gem, label: "Luxury & Budget Travel" },
  { icon: CreditCard, label: "Visa Assistance" },
  { icon: Hotel, label: "Hotel Bookings" },
];

const doubledItems = [...marqueeItems, ...marqueeItems];

const CTASection = () => {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let pos = 0;
    let id: number;
    const speed = 0.8;
    const animate = () => {
      pos += speed;
      const half = el.scrollWidth / 2;
      if (pos >= half) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <img
        src={ctaBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/40" />

      {/* Content */}
      <ScrollReveal>
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6 italic">
            Turn Your Travel
            <br />
            Dreams Into Reality
          </h2>
          <p className="text-primary-foreground/80 text-base sm:text-lg mb-10 max-w-lg mx-auto">
            From the first idea to the final detail, we design journeys you'll remember forever.
          </p>
          <Link to="/plan">
            <button className="inline-flex items-center gap-3 bg-card text-foreground px-8 py-4 rounded-full font-semibold text-base hover:bg-card/90 transition-colors shadow-glass-lg">
              Book a trip
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Bottom marquee ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-foreground/20 backdrop-blur-sm border-t border-card/10 py-4 overflow-hidden">
        <div
          ref={tickerRef}
          className="flex will-change-transform"
          style={{ width: "max-content" }}
        >
          {doubledItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-6 text-primary-foreground/90 whitespace-nowrap">
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-primary-foreground/40 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
