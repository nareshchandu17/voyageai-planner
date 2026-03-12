import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";

interface DestinationTileProps {
  slug: string;
  image: string;
  title: string;
  duration: string;
  price: string;
  category: string;
  index: number;
}

const DestinationTile = ({ slug, image, title, duration, price, category, index }: DestinationTileProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (y - 0.5) * -8,
      rotateY: (x - 0.5) * 8,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setHovered(false);
  }, []);

  return (
    <Link to={`/discover/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.6,
          delay: (index % 4) * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <div
          ref={tileRef}
          className="discover-tile-3d cursor-pointer group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            animate={{
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              scale: hovered ? 1.03 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            style={{
              boxShadow: hovered
                ? "0 25px 60px -15px rgba(0,0,0,0.35)"
                : "0 8px 24px -8px rgba(0,0,0,0.15)",
              transition: "box-shadow 0.4s ease",
            }}
          >
            {/* Image */}
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Category badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-card/70 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border/30">
                {category}
              </span>
            </div>

            {/* Hover overlay - always visible at bottom, full on hover */}
            <div
              className={`absolute inset-0 discover-glass-overlay transition-opacity duration-500 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Always-visible minimal info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <div className={`transition-all duration-500 ${hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <div className="flex items-center gap-1.5 text-primary-foreground/70 text-xs font-medium mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-primary-foreground leading-tight mb-1 drop-shadow-lg">
                {title}
              </h3>

              <div className={`transition-all duration-500 ${hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary-foreground/80 text-sm font-body">
                    From <span className="text-primary-foreground font-bold text-lg">${price}</span>
                  </span>
                  <div className="flex items-center gap-1 text-primary-foreground/60 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    per person
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default DestinationTile;
