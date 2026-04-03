import { motion } from "framer-motion";
import { User, Globe, Utensils, MapPin, TrendingUp, Star, Compass, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TravelerProfile } from "@/hooks/useTravelerProfile";

interface TravelerProfileCardProps {
  profile: TravelerProfile;
}

const TravelerProfileCard = ({ profile }: TravelerProfileCardProps) => {
  const patterns = profile.past_patterns || {};
  const favorites = patterns.favorite_activity_types || [];
  const ratings = patterns.trip_ratings || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="gradient-ocean p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Your Travel Self</h3>
            <p className="text-white/70 text-sm">AI-learned from {profile.trip_count} trips</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Globe className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{patterns.total_countries || 0}</p>
            <p className="text-[10px] text-muted-foreground">Countries</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <MapPin className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{profile.trip_count}</p>
            <p className="text-[10px] text-muted-foreground">Trips</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-display font-bold text-foreground capitalize">{profile.pace_preference}</p>
            <p className="text-[10px] text-muted-foreground">Pace</p>
          </div>
        </div>

        {/* Travel style */}
        {profile.travel_style?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primary" /> Travel Style
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.travel_style.map(style => (
                <span key={style} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{style}</span>
              ))}
            </div>
          </div>
        )}

        {/* Favorite activities */}
        {favorites.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-accent" /> Favorite Activities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {favorites.map(type => (
                <span key={type} className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent font-medium capitalize">{type}</span>
              ))}
            </div>
          </div>
        )}

        {/* Cuisine preferences */}
        {profile.cuisine_preferences?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-primary" /> Cuisine Preferences
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.cuisine_preferences.map(c => (
                <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-foreground">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Past trip ratings */}
        {ratings.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500" /> Past Trips
            </p>
            <div className="space-y-1.5">
              {ratings.slice(-5).reverse().map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{r.destination}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={cn("w-3 h-3", j < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted")} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI insight */}
        {patterns.avg_activities_per_day && (
          <div className="bg-primary/5 rounded-xl p-3 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-primary inline mr-1.5" />
            Based on your past trips, you prefer ~{patterns.avg_activities_per_day} activities per day
            {patterns.avg_daily_budget ? ` with a ~$${patterns.avg_daily_budget}/day budget` : ""}.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TravelerProfileCard;
