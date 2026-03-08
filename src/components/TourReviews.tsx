import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

import avatarDaniel from "@/assets/avatar-daniel.jpg";
import avatarEmily from "@/assets/avatar-emily.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";

interface Review {
  name: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

const reviewPool: Review[] = [
  {
    name: "Daniel Cooper",
    avatar: avatarDaniel,
    location: "London, UK",
    rating: 5,
    text: "Absolutely life-changing experience. Every detail was perfectly planned and the local guides made us feel like family. Can't wait to book another journey!",
    date: "January 2026",
  },
  {
    name: "Emily Zhang",
    avatar: avatarEmily,
    location: "Toronto, Canada",
    rating: 5,
    text: "From the stunning accommodations to the hidden gems we'd never have found on our own — this was the best trip I've ever taken. Worth every penny.",
    date: "November 2025",
  },
  {
    name: "Sophia Martínez",
    avatar: avatarSophia,
    location: "Barcelona, Spain",
    rating: 4,
    text: "A beautifully curated itinerary that balanced adventure with relaxation. The small group size made everything feel personal and intimate.",
    date: "December 2025",
  },
];

const getReviewsForTour = (slug: string): Review[] => {
  // Deterministic shuffle based on slug so each tour gets a consistent set
  const seed = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...reviewPool].sort((a, b) => {
    const ha = (a.name.charCodeAt(0) + seed) % 100;
    const hb = (b.name.charCodeAt(0) + seed) % 100;
    return ha - hb;
  });
  return shuffled;
};

interface TourReviewsProps {
  tourSlug: string;
  tourTitle: string;
}

const TourReviews = ({ tourSlug, tourTitle }: TourReviewsProps) => {
  const reviews = getReviewsForTour(tourSlug);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">💬</span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Traveler Reviews</h2>
      </div>

      {/* Review Cards */}
      <div className="space-y-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            onClick={() => setActiveIndex(i)}
            className={`relative bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              activeIndex === i
                ? "border-ocean/40 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                : "border-border hover:border-border/80"
            }`}
          >
            <Quote className="absolute top-5 right-5 w-8 h-8 text-ocean/15" />

            <div className="flex items-center gap-4 mb-4">
              <motion.img
                src={review.avatar}
                alt={review.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                whileHover={{ scale: 1.1 }}
              />
              <div>
                <h4 className="font-display font-bold text-foreground text-sm">{review.name}</h4>
                <p className="text-xs text-muted-foreground">{review.location}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-3.5 h-3.5 ${
                      si < review.rating ? "fill-amber-400 text-amber-400" : "text-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.p
              className="text-muted-foreground font-body leading-relaxed text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              "{review.text}"
            </motion.p>

            <p className="text-xs text-muted-foreground/60 mt-3">{review.date}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-secondary/40 rounded-2xl p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground font-body">Overall rating for {tourTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-display text-2xl font-bold text-foreground">4.8</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 5 ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
          {reviews.length} reviews
        </span>
      </motion.div>
    </div>
  );
};

export default TourReviews;
