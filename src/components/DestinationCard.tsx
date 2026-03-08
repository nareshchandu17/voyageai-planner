import { motion } from "framer-motion";
import { MapPin, Calendar, Heart } from "lucide-react";
import { useState } from "react";

interface DestinationCardProps {
  image: string;
  name: string;
  country: string;
  budget: string;
  season: string;
  rating?: number;
  category?: string;
  index?: number;
}

const DestinationCard = ({ image, name, country, budget, season, rating, index = 0 }: DestinationCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group glass-card overflow-hidden cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <motion.img
          src={image}
          alt={name}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        {/* Like Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.2 }}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/60 backdrop-blur-md flex items-center justify-center border border-border/30"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-300 ${
              isLiked ? "fill-destructive text-destructive" : "text-primary-foreground"
            }`}
          />
        </motion.button>

        {/* Rating Badge */}
        {rating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.08 }}
            className="absolute top-3 right-3 bg-card/70 backdrop-blur-md rounded-xl px-2.5 py-1 text-xs font-bold text-foreground border border-border/30"
          >
            ⭐ {rating}
          </motion.div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <motion.h3
            className="font-display text-xl font-bold text-primary-foreground drop-shadow-lg"
            layoutId={`title-${name}`}
          >
            {name}
          </motion.h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-primary-foreground/80" />
            <p className="text-sm text-primary-foreground/85 font-medium">{country}</p>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">From {budget}</span>
          <div className="flex items-center gap-1.5 bg-ocean-lighter text-ocean rounded-full px-3 py-1">
            <Calendar className="w-3 h-3" />
            <span className="text-xs font-medium">{season}</span>
          </div>
        </div>

        {/* Hover reveal details */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          whileHover={{ height: "auto", opacity: 1 }}
          className="overflow-hidden"
        >
          <div className="pt-3 mt-3 border-t border-border/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-ocean text-primary-foreground text-sm font-medium py-2.5 rounded-xl shadow-soft"
            >
              Explore Destination →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
