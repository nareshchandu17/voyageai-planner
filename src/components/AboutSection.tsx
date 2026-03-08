import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info, ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import aboutLeft from "@/assets/about-left.jpg";
import aboutRight1 from "@/assets/about-right-1.jpg";
import aboutRight2 from "@/assets/about-right-2.jpg";
import aboutRight3 from "@/assets/about-right-3.jpg";
import aboutRight4 from "@/assets/about-right-4.jpg";

const rightImages = [aboutRight1, aboutRight2, aboutRight3, aboutRight4];

const AboutSection = () => {
  const [currentImg, setCurrentImg] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImg((prev) => (prev + 1) % rightImages.length);
        setFade(true);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top row: text left, cycling image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: text content */}
          <ScrollReveal>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide">About Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              Meaningful Travel Experiences, Thoughtfully Crafted
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
              We are passionate travel experts creating unforgettable journeys beyond sightseeing. Every itinerary combines comfort, discovery, and meaningful experiences.
            </p>
            <div className="flex items-center gap-0">
              <Link to="/about">
                <Button size="lg" className="rounded-r-none rounded-l-[2rem] gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  Know More
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" className="rounded-l-none rounded-r-[2rem] border-l border-white/20 px-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          </ScrollReveal>

          {/* Right: cycling image */}
          <ScrollReveal delay={200}>
          <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl">
            <img
              src={rightImages[currentImg]}
              alt="Travel experience"
              className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>

        {/* Bottom row: left image aligned with right card bottom */}
        <div className="mt-10 lg:mt-[-16rem] lg:w-1/2">
          <div className="rounded-[2rem] overflow-hidden shadow-xl aspect-[16/9]">
            <img
              src={aboutLeft}
              alt="Traveler on rocks at sunset"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
