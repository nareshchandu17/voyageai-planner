import { useRef, useEffect, useState } from "react";
import { Image } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import vibe1 from "@/assets/vibe-1.jpg";
import vibe2 from "@/assets/vibe-2.jpg";
import vibe3 from "@/assets/vibe-3.jpg";
import vibe4 from "@/assets/vibe-4.jpg";
import vibe5 from "@/assets/vibe-5.jpg";
import vibe6 from "@/assets/vibe-6.jpg";
import vibe7 from "@/assets/vibe-7.jpg";
import vibe8 from "@/assets/vibe-8.jpg";
import vibe9 from "@/assets/vibe-9.jpg";
import vibe10 from "@/assets/vibe-10.jpg";

const images = [vibe1, vibe2, vibe3, vibe4, vibe5, vibe6, vibe7, vibe8, vibe9, vibe10];
// Double for seamless loop
const marqueeImages = [...images, ...images];

const VibeWithUs = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused) {
        scrollPos += speed;
        // Reset when first set is fully scrolled
        const halfWidth = el.scrollWidth / 2;
        if (scrollPos >= halfWidth) {
          scrollPos = 0;
        }
        el.style.transform = `translateX(-${scrollPos}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="py-20 sm:py-28 bg-background overflow-hidden">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground tracking-widest uppercase">
            <Image className="w-4 h-4" /> Vibe with Us
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground text-center mb-14 max-w-2xl mx-auto leading-tight">
          Real Travel Stories From Around The World
        </h2>
      </ScrollReveal>

      {/* Marquee carousel */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform"
          style={{ width: "max-content" }}
        >
          {marqueeImages.map((img, i) => (
            <div
              key={i}
              className="w-56 sm:w-64 h-80 sm:h-96 rounded-2xl overflow-hidden shrink-0 group"
            >
              <img
                src={img}
                alt={`Travel story ${(i % images.length) + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VibeWithUs;
