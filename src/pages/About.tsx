import { Sparkles, Globe, Heart, Users, MapPin } from "lucide-react";
import aboutLeft from "@/assets/about-left.jpg";
import aboutRight1 from "@/assets/about-right-1.jpg";
import aboutRight2 from "@/assets/about-right-2.jpg";

const stats = [
  { icon: Globe, label: "Countries", value: "50+" },
  { icon: Users, label: "Happy Travelers", value: "50K+" },
  { icon: MapPin, label: "Destinations", value: "200+" },
  { icon: Heart, label: "5-Star Reviews", value: "541K" },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <section className="relative flex-1 flex items-center py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">About Us</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                Meaningful Travel, <br />
                <span className="italic text-ocean">Thoughtfully Crafted</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                We are passionate travel experts creating unforgettable journeys beyond sightseeing. Every itinerary combines comfort, discovery, and meaningful experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Our AI-powered platform analyzes thousands of travel data points to craft personalized itineraries that match your style, budget, and interests. Whether you're a solo adventurer, a family on vacation, or a digital nomad — VoyageAI helps you travel smarter and deeper.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2">
                      <s.icon className="w-5 h-5 text-ocean" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[2rem] overflow-hidden shadow-xl aspect-[3/4]">
                <img src={aboutRight1} alt="Travel experience" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-[2rem] overflow-hidden shadow-xl aspect-[3/4] mt-8">
                <img src={aboutRight2} alt="Travel experience" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 rounded-[2rem] overflow-hidden shadow-xl aspect-[16/9]">
                <img src={aboutLeft} alt="Traveler at sunset" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Founded by travelers, for travelers. We believe the best trips aren't just planned — they're felt. Every journey should leave you with stories worth telling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
