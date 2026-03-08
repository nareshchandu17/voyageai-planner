import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, UtensilsCrossed, Handshake, Globe } from "lucide-react";

import whyBg from "@/assets/why-choose-bg.jpg";
import authenticImg from "@/assets/why-authentic.jpg";
import culinaryImg from "@/assets/why-culinary.jpg";
import partnershipImg from "@/assets/why-partnership.jpg";
import cultureImg from "@/assets/why-culture.jpg";

const items = [
  {
    icon: Compass,
    title: "Authentic Experiences",
    desc: "Trips tailored to your style and your budget.",
    image: authenticImg,
  },
  {
    icon: UtensilsCrossed,
    title: "Culinary Adventures",
    desc: "Savor local cuisines with guided food tours.",
    image: culinaryImg,
  },
  {
    icon: Handshake,
    title: "Trusted Partnerships",
    desc: "Handpicked hotels, guides, and local experiences.",
    image: partnershipImg,
  },
  {
    icon: Globe,
    title: "Cultural Immersion",
    desc: "Engage with local traditions and communities.",
    image: cultureImg,
  },
];

const WhyChooseUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={whyBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/60" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-primary-foreground/70 tracking-widest uppercase">
            Why Choose Us
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px]">
          {/* Left — Image that slides on hover */}
          <div className="relative h-[400px] sm:h-[500px] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={items[activeIndex].image}
                alt={items[activeIndex].title}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-50%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </AnimatePresence>
          </div>

          {/* Right — Feature rows */}
          <div className="flex flex-col">
            {items.map((item, i) => (
              <motion.div
                key={i}
                className={`group cursor-pointer px-6 py-6 rounded-xl transition-colors duration-300 border border-transparent ${
                  activeIndex === i
                    ? "bg-primary-foreground/10 border-primary-foreground/20"
                    : "hover:bg-primary-foreground/5"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-primary-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-primary-foreground/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
