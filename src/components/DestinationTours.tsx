import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { allTours, TourData } from "@/data/tourData";
import ScrollReveal from "@/components/ScrollReveal";

// Map destination slugs to keywords that match tour slugs/titles
const destinationTourKeywords: Record<string, string[]> = {
  japan: ["japan"],
  switzerland: ["switzerland"],
  paris: ["paris"],
  "new-york": ["new-york", "new york"],
};

export const getToursForDestination = (destSlug: string): TourData[] => {
  const keywords = destinationTourKeywords[destSlug] || [destSlug];
  return allTours.filter((tour) =>
    keywords.some(
      (kw) =>
        tour.slug.includes(kw) ||
        tour.title.toLowerCase().includes(kw)
    )
  );
};

const DestinationTours = ({ destSlug }: { destSlug: string }) => {
  const tours = getToursForDestination(destSlug).slice(0, 4);

  if (tours.length === 0) return null;

  return (
    <section className="pb-16 sm:pb-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-widest">Explore Packages</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Tours You'll Love
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((tour, i) => (
            <ScrollReveal key={tour.slug} delay={i * 100}>
              <Link to={`/discover/${tour.slug}`}>
                <motion.div
                  className="group cursor-pointer"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative h-[300px] sm:h-[360px] rounded-2xl overflow-hidden mb-4">
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-ocean/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                        {tour.duration}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From $ <span className="text-foreground font-bold text-base">${tour.price}</span> / Per Person
                  </p>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="flex items-center justify-between mt-12">
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover all available packages
            </p>
            <Link
              to="/discover"
              className="flex items-center gap-2 bg-ocean text-primary-foreground font-semibold px-6 py-3 rounded-full hover:bg-ocean-dark transition-colors"
            >
              View All Tours
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DestinationTours;
