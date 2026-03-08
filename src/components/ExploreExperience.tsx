import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import expFuture from "@/assets/exp-future.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expCulture from "@/assets/exp-culture.jpg";
import expHistory from "@/assets/exp-history.jpg";

const experiences = [
  {
    image: expFuture,
    title: "Travel to the Future",
    desc: "A city of luxury and innovation, where tomorrow comes alive.",
    tall: true,
    textBelow: true,
  },
  {
    image: expNature,
    title: "Travel Into Nature",
    desc: "Stunning landscapes and pure alpine beauty of the nature.",
    tall: true,
    textBelow: false,
  },
  {
    image: expCulture,
    title: "Travel Through Culture",
    desc: "A blend of traditions, colors, heritage and spices.",
    tall: true,
    textBelow: true,
  },
  {
    image: expHistory,
    title: "Travel Back in Time",
    desc: "Explore ancient wonders, monuments & stories in stone.",
    tall: true,
    textBelow: false,
  },
];

const ExploreExperience = () => {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              Explore by Experience
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
            Experience Diverse Worlds On
            <br />
            One Planet
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* Text above image for items 1 & 3 (index 1, 3) */}
              {!exp.textBelow && (
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              )}

              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer flex-1">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full min-h-[280px] sm:min-h-[340px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text below image for items 0 & 2 (index 0, 2) */}
              {exp.textBelow && (
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-6 mt-14">
          <span className="text-muted-foreground text-sm sm:text-base font-medium whitespace-nowrap">
            Explore more journeys waiting for you
          </span>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-0 shrink-0">
            <Link to="/discover">
              <Button size="lg" className="rounded-r-none rounded-l-[2rem] gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
                View Packages
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" className="rounded-l-none rounded-r-[2rem] border-l border-white/20 px-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreExperience;
