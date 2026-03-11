import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Clock, DollarSign, Users, Sparkles,
  Heart, Star, Utensils, ArrowLeft, Globe, Loader2, Plane
} from "lucide-react";

const SharedStory = () => {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!token) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error || !data) setNotFound(true);
      else setTrip(data);
      setLoading(false);
    };
    fetchTrip();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-card p-12 max-w-md">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Story Not Found</h2>
          <p className="text-muted-foreground mb-6">This travel story link may have expired or doesn't exist.</p>
          <Link to="/"><Button variant="ocean">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const itinerary = trip.itinerary_data;
  const days = itinerary?.days || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[400px] sm:h-[480px] overflow-hidden">
        <img
          src={trip.image_url || trip.destination_photos?.[0]?.url || "/placeholder.svg"}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col items-start justify-end container mx-auto px-4 sm:px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-body font-semibold tracking-wide">AI Travel Story</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight">{trip.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {trip.destination}</span>
              {trip.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {trip.duration}</span>}
              {trip.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(trip.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  {trip.end_date && ` – ${new Date(trip.end_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-4 mb-10 -mt-16 relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card p-4 text-center">
            <DollarSign className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-lg font-display font-bold text-foreground">${trip.budget?.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Budget</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{days.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Days</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{trip.group_size || 1}</p>
            <p className="text-[10px] text-muted-foreground">Travelers</p>
          </div>
        </motion.div>

        {/* Travel Story */}
        {trip.travel_story && (
          <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">The Journey</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{trip.travel_story}</p>
            </div>
          </motion.div>
        )}

        {/* Day Timeline */}
        {days.length > 0 && (
          <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <h2 className="font-display text-xl font-bold text-foreground mb-6">Day by Day</h2>
            <div className="space-y-4">
              {days.map((day: any, i: number) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full gradient-ocean flex items-center justify-center text-primary-foreground text-xs font-bold">{day.day}</div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm">{day.theme}</h3>
                      {day.date && <p className="text-[10px] text-muted-foreground">{day.date}</p>}
                    </div>
                  </div>
                  {day.activities?.length > 0 && (
                    <div className="space-y-2 ml-11">
                      {day.activities.slice(0, 4).map((a: any, j: number) => (
                        <div key={j} className="flex items-start gap-2 text-xs">
                          <span className="text-muted-foreground font-mono shrink-0">{a.time}</span>
                          <div>
                            <span className="text-foreground font-medium">{a.title}</span>
                            {a.location && <span className="text-muted-foreground"> · {a.location}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div className="text-center glass-card p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Plane className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Inspired to travel?</h3>
          <p className="text-sm text-muted-foreground mb-4">Plan your own AI-powered adventure.</p>
          <Link to="/plan"><Button variant="ocean" size="lg">Plan Your Trip</Button></Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedStory;
