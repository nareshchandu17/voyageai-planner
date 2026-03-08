import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquareText } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import avatarEmily from "@/assets/avatar-emily.jpg";
import avatarDaniel from "@/assets/avatar-daniel.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";

const testimonials = [
  {
    bg: testimonial1,
    avatar: avatarEmily,
    name: "Emily Carter",
    role: "Solo Traveler",
    rating: 5,
    text: "Traveling with this team completely changed how I see group travel. Everything was thoughtfully planned",
  },
  {
    bg: testimonial2,
    avatar: avatarDaniel,
    name: "Daniel Wong",
    role: "Adventure Traveler",
    rating: 5,
    text: "From planning to on-ground support, every detail was handled with care. The experiences felt authentic and well-paced, allowing us to truly enjoy each place",
  },
  {
    bg: testimonial3,
    avatar: avatarSophia,
    name: "Sophia Martinez",
    role: "Traveler",
    rating: 4,
    text: "This trip was the perfect balance of comfort, culture, and discovery. The itinerary felt personal, the stays were well chosen, and the overall experience was smooth.",
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquareText className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Words From Those Who
              <br />
              Traveled With Us
            </h2>
          </div>
        </ScrollReveal>

        {/* Testimonial card */}
        <ScrollReveal>
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden h-[420px] sm:h-[460px]">
            {/* Background image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={testimonials[activeIndex].bg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8 sm:p-10">
              <div className="max-w-md">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[activeIndex].rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-sunset text-sunset" />
                  ))}
                </div>

                {/* Quote */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-display text-lg sm:text-xl font-bold text-primary-foreground leading-relaxed mb-6">
                      {testimonials[activeIndex].text}
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      — {testimonials[activeIndex].name}, {testimonials[activeIndex].role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Avatar selectors */}
              <div className="flex items-center gap-3">
                {testimonials.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`rounded-full overflow-hidden transition-all duration-300 border-2 ${
                      activeIndex === i
                        ? "w-16 h-16 border-primary-foreground shadow-lg scale-110"
                        : "w-12 h-12 border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TestimonialsSection;
