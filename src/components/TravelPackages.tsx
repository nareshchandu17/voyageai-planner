import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

import moroccoImg from "@/assets/pkg-morocco.jpg";
import italyImg from "@/assets/pkg-italy.jpg";
import africaImg from "@/assets/pkg-africa.jpg";
import japanImg from "@/assets/pkg-japan.jpg";

const packages = [
  { image: moroccoImg, title: "Morocco Desert Journey", duration: "8 Days / 7 Nights", price: "1,600" },
  { image: italyImg, title: "Italy Classic", duration: "7 Days / 6 Nights", price: "1,400" },
  { image: africaImg, title: "Africa Experience", duration: "8 Days / 7 Nights", price: "2,200" },
  { image: japanImg, title: "Japan Spring", duration: "7 Days / 6 Nights", price: "1,200" },
];

const TravelPackages = () => {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Journeys Designed For Every
              <br />
              Travel Style
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <motion.div
                className="group cursor-pointer"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative h-[340px] sm:h-[400px] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-ocean/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                      {pkg.duration}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {pkg.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  From $ <span className="text-foreground font-bold text-base">${pkg.price}</span> / Per Person
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="flex items-center justify-between mt-12">
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore more journeys waiting for you
            </p>
            <Link
              to="/discover"
              className="flex items-center gap-2 bg-ocean text-primary-foreground font-semibold px-6 py-3 rounded-full hover:bg-ocean-dark transition-colors"
            >
              View Packages
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TravelPackages;
