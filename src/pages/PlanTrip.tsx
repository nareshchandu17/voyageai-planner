import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import {
  ArrowLeft, ArrowRight, CalendarIcon, MapPin, DollarSign,
  Users, Sparkles, Loader2, Mountain, Palette, UtensilsCrossed,
  TreePine, Crown, Wallet, Tag, Search, Phone, Mail, MapPinned,
  CloudSun, AlertCircle, Ticket, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { fetchWeather, fetchNearbyPlaces, fetchEvents, fetchUnsplashPhotos, fetchUnsplashBatch, fetchLocationCoordinatesBatch, fetchRouteEstimatesBatch, streamItinerary, parseItineraryJSON } from "@/lib/streamChat";
import AIItineraryResult from "@/components/AIItineraryResult";
import PlaceCard from "@/components/PlaceCard";
import EventCard from "@/components/EventCard";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { useTravelerProfile } from "@/hooks/useTravelerProfile";
import { supabase } from "@/integrations/supabase/client";
import planTripHero from "@/assets/plan-trip-hero.jpg";
import planTripBanner from "@/assets/plan-trip-banner.jpg";
import { motion, AnimatePresence } from "framer-motion";

const travelStyles = [
  { id: "adventure", label: "Adventure", icon: Mountain, desc: "Hikes, treks, adrenaline" },
  { id: "culture", label: "Culture", icon: Palette, desc: "Museums, history, art" },
  { id: "food", label: "Food", icon: UtensilsCrossed, desc: "Markets, tastings, local eats" },
  { id: "nature", label: "Nature", icon: TreePine, desc: "Parks, beaches, scenery" },
  { id: "luxury", label: "Luxury", icon: Crown, desc: "Premium stays & dining" },
  { id: "budget", label: "Budget", icon: Wallet, desc: "Smart spending, value picks" },
];

const interestTags = [
  "Photography", "Hiking", "Museums", "Street Food", "Beaches", "Nightlife",
  "History", "Shopping", "Wellness", "Architecture", "Wildlife", "Festivals",
  "Coffee Culture", "Live Music", "Hidden Gems", "Local Markets", "Cycling", "Diving",
  "Yoga & Spa", "Sunset Spots", "Rooftop Bars", "Vegan Food",
];

const popularDestinations = [
  { name: "Tokyo, Japan", flag: "🇯🇵" },
  { name: "Kyoto, Japan", flag: "🇯🇵" },
  { name: "Bali, Indonesia", flag: "🇮🇩" },
  { name: "Paris, France", flag: "🇫🇷" },
  { name: "New York, USA", flag: "🇺🇸" },
  { name: "Barcelona, Spain", flag: "🇪🇸" },
  { name: "Rome, Italy", flag: "🇮🇹" },
  { name: "Lisbon, Portugal", flag: "🇵🇹" },
  { name: "Istanbul, Türkiye", flag: "🇹🇷" },
  { name: "Marrakech, Morocco", flag: "🇲🇦" },
  { name: "Cape Town, South Africa", flag: "🇿🇦" },
  { name: "Iceland", flag: "🇮🇸" },
  { name: "Machu Picchu, Peru", flag: "🇵🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Bangkok, Thailand", flag: "🇹🇭" },
  { name: "Dubai, UAE", flag: "🇦🇪" },
  { name: "Sydney, Australia", flag: "🇦🇺" },
  { name: "Santorini, Greece", flag: "🇬🇷" },
];

const budgetPresets = [
  { label: "Backpacker", value: 800 },
  { label: "Comfort", value: 2000 },
  { label: "Premium", value: 4500 },
  { label: "Luxury", value: 8000 },
];

const planningModes = [
  {
    id: "smart_balanced",
    emoji: "1️⃣",
    title: "Smart Balanced",
    badge: "Recommended",
    tagline: "Best for most travelers",
    points: ["Balances exploration + rest", "Avoids overload", "Mixes famous + hidden places", "Optimized pacing"],
    accent: "from-sky-500/15 to-cyan-500/10 border-sky-500/30",
  },
  {
    id: "deep_exploration",
    emoji: "2️⃣",
    title: "Deep Exploration",
    badge: "Best for 7–15 days",
    tagline: "Goes beyond the top-10 list",
    points: ["Explores districts deeply", "Reduces rushed movement", "Creates thematic days", "Avoids repetitive attractions"],
    accent: "from-emerald-500/15 to-teal-500/10 border-emerald-500/30",
  },
  {
    id: "fast_highlights",
    emoji: "3️⃣",
    title: "Fast Highlights",
    badge: "Short trips",
    tagline: "Pack in the major must-sees",
    points: ["Prioritizes major attractions", "Compressed schedule", "Minimizes downtime", "Maximum coverage"],
    accent: "from-orange-500/15 to-red-500/10 border-orange-500/30",
  },
  {
    id: "adaptive_flow",
    emoji: "4️⃣",
    title: "Adaptive Flow",
    badge: "Premium feel",
    tagline: "Feels like a human strategist made it",
    points: ["Flexible days with alternatives", "Adapts pacing dynamically", "Buffer windows built in", "Confident, considered, never rigid"],
    accent: "from-violet-500/15 to-fuchsia-500/10 border-violet-500/30",
  },
  {
    id: "local_immersion",
    emoji: "5️⃣",
    title: "Local Immersion",
    badge: "Premium · Stands out",
    tagline: "Live like a local, not a tourist",
    points: ["Prioritizes local culture", "Cafés, neighborhoods, slow time", "Avoids tourist-heavy repetition", "Family-run eateries & markets"],
    accent: "from-amber-500/15 to-rose-500/10 border-amber-500/30",
  },
];

const modeImpacts: Record<string, { pacing: string; structure: string; density: string; restRatio: string; expect: string[] }> = {
  smart_balanced: {
    pacing: "Moderate — starts gently, builds to a peak mid-trip, then eases out",
    structure: "2–3 activities per day with intentional downtime",
    density: "Balanced (medium-high on peak days, lighter on travel days)",
    restRatio: "~30% free time or slow moments built in",
    expect: ["Famous sights mixed with hidden gems", "No back-to-back marathon days", "Flexible evenings for spontaneous discovery"],
  },
  deep_exploration: {
    pacing: "Slow and immersive — fewer transitions, deeper engagement",
    structure: "Thematic days focused on one district or topic at a time",
    density: "Lower volume, higher depth (1–2 major experiences per day)",
    restRatio: "~40% unstructured time for wandering and reflection",
    expect: ["Neighborhood walks over hop-on-hop-off tours", "Repeated visits to favorite areas", "Time to talk to locals and absorb culture"],
  },
  fast_highlights: {
    pacing: "Fast — high energy from day one, compressed schedule",
    structure: "4–5 activities per day, tight routing, minimal gaps",
    density: "Very high (major attractions prioritized, rest is secondary)",
    restRatio: "~10% downtime — mostly transit breaks",
    expect: ["Must-see list gets priority", "Early starts and packed days", "Efficient routing with little wandering"],
  },
  adaptive_flow: {
    pacing: "Dynamic — adjusts intensity based on day type and location",
    structure: "Core plan + optional alternatives for every slot",
    density: "Medium with built-in flexibility (swap activities on the fly)",
    restRatio: "~25% buffer windows + optional slow afternoons",
    expect: ["A & B plans for each day", "Buffer time for delays and spontaneity", "Pacing that adapts to weather and mood"],
  },
  local_immersion: {
    pacing: "Unhurried — lives like a local, not a checklist tourist",
    structure: "Café mornings, neighborhood afternoons, slow evenings",
    density: "Low (quality local spots over famous attractions)",
    restRatio: "~50% unstructured time for organic discovery",
    expect: ["Family-run restaurants and corner cafés", "Residential neighborhoods over tourist strips", "Long lunches and people-watching"],
  },
};

const TOTAL_STEPS = 7;


const PlanTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { user } = useAuth();
  const { saveTrip, updateTrip } = useTrips();
  const { profile: travelerProfile } = useTravelerProfile();

  const [step, setStep] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [existingTripId, setExistingTripId] = useState<string | null>(tripId);
  const [loadingTrip, setLoadingTrip] = useState(!!tripId);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [budget, setBudget] = useState(2000);
  const [styles, setStyles] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<"weather" | "places" | "events" | "ai" | "done">("weather");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any>(null);
  const [destinationPhotos, setDestinationPhotos] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any>(null);
  const [rawStream, setRawStream] = useState("");
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentFetched, setEnrichmentFetched] = useState(false);
  const [narrativeIntensities, setNarrativeIntensities] = useState<Record<number, number>>({});
  const [planningMode, setPlanningMode] = useState<string>("smart_balanced");


  // Load existing trip if tripId is provided
  useEffect(() => {
    if (!tripId) return;
    setLoadingTrip(true);
    supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setLoadingTrip(false);
          return;
        }
        const trip = data as any;
        setDestination(trip.destination || "");
        if (trip.start_date) setDateRange({ from: new Date(trip.start_date), to: trip.end_date ? new Date(trip.end_date) : undefined });
        setBudget(trip.budget || 2000);
        setStyles(trip.styles || []);
        setGroupSize(trip.group_size || 2);
        setInterests(trip.interests || []);
        setExistingTripId(trip.id);
        if (trip.itinerary_data) {
          setItineraryData(trip.itinerary_data);
          setWeatherData(trip.weather_data);
          setNearbyPlaces(trip.nearby_places);
          setUpcomingEvents(trip.upcoming_events);
          setDestinationPhotos(trip.destination_photos || []);
          setStep(7);
        }
        setLoadingTrip(false);
      });
  }, [tripId]);

  const fetchEnrichmentData = useCallback(async () => {
    if (enrichmentFetched || enrichmentLoading) return;
    setEnrichmentLoading(true);
    const startDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
    const endDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";
    try {
      const [weather, places, events, photos] = await Promise.allSettled([
        fetchWeather(destination, startDate, endDate),
        fetchNearbyPlaces(destination),
        fetchEvents(destination, startDate, endDate),
        fetchUnsplashPhotos(`${destination} travel landmark`, 8),
      ]).then(([w, p, e, ph]) => [
        w.status === "fulfilled" ? w.value : null,
        p.status === "fulfilled" ? p.value : null,
        e.status === "fulfilled" ? e.value : null,
        ph.status === "fulfilled" ? ph.value : null,
      ]);
      if (weather) setWeatherData(weather);
      if (places) setNearbyPlaces(places);
      if (events) setUpcomingEvents(events);
      if (photos) setDestinationPhotos(photos);
    } catch (e) {
      console.warn("Enrichment fetch failed:", e);
    } finally {
      setEnrichmentLoading(false);
      setEnrichmentFetched(true);
    }
  }, [destination, dateRange, enrichmentFetched, enrichmentLoading]);

  useEffect(() => {
    if (step === 7 && !enrichmentFetched && !enrichmentLoading && !itineraryData) {
      fetchEnrichmentData();
    }
  }, [step, enrichmentFetched, enrichmentLoading, fetchEnrichmentData, itineraryData]);

  const toggleStyle = (id: string) => setStyles((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  const toggleInterest = (tag: string) => setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleRegenerateWithArc = useCallback((intensities: Record<number, number>) => {
    setNarrativeIntensities(intensities);
    // Use a ref-like approach: pass intensities directly to generate
    handleGenerateWithIntensities(intensities);
  }, []);

  const handleGenerateWithIntensities = async (arcIntensities?: Record<number, number>) => {
    const intensitiesToUse = arcIntensities ?? narrativeIntensities;
    setGenerating(true);
    setError(null);
    setRawStream("");
    setItineraryData(null);
    setGenerationPhase("ai");

    const startDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
    const endDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";
    let fullText = "";

    await streamItinerary({
      params: { destination, startDate, endDate, budget, styles, groupSize, interests },
      weatherData,
      nearbyPlaces,
      upcomingEvents,
      narrativeIntensities: Object.keys(intensitiesToUse).length > 0 ? intensitiesToUse : undefined,
      planningMode,

      travelerProfile: travelerProfile ? {
        pace_preference: travelerProfile.pace_preference,
        energy_tolerance: travelerProfile.energy_tolerance,
        cuisine_preferences: travelerProfile.cuisine_preferences,
        travel_style: travelerProfile.travel_style,
        past_patterns: travelerProfile.past_patterns,
        trip_count: travelerProfile.trip_count,
        average_rating: travelerProfile.average_rating,
      } : undefined,
      onDelta: (chunk) => { fullText += chunk; setRawStream(fullText); },
      onDone: async () => {
        setGenerationPhase("done");
        const parsed = parseItineraryJSON(fullText);
        if (parsed) {
          // Extract image queries from itinerary
          const imageQueries: string[] = [];
          const locationQueries: string[] = [];
          parsed.days?.forEach((day: any) => {
            if (day.imageQuery) imageQueries.push(day.imageQuery);
            day.activities?.forEach((act: any) => {
              if (act.imageQuery) imageQueries.push(act.imageQuery);
              if (act.location) locationQueries.push(`${act.location}, ${destination}`);
            });
            if (day.theme && destination) locationQueries.push(`${day.theme}, ${destination}`);
            if (day.meals) {
              ["breakfast", "lunch", "dinner"].forEach(m => {
                if (day.meals[m]?.imageQuery) imageQueries.push(day.meals[m].imageQuery);
                if (day.meals[m]?.location) locationQueries.push(`${day.meals[m].location}, ${destination}`);
              });
            }
          });

          // Batch fetch images
          let imageMap: Record<string, any> | null = null;
          let locationMap: Record<string, any> | null = null;
          if (imageQueries.length > 0) {
            try {
              imageMap = await fetchUnsplashBatch(imageQueries);
            } catch (e) {
              console.warn("Batch image fetch failed:", e);
            }
          }

          if (locationQueries.length > 0) {
            try {
              locationMap = await fetchLocationCoordinatesBatch(locationQueries);
            } catch (e) {
              console.warn("Batch geocode failed:", e);
            }
          }

          // Merge images into itinerary data
          if (imageMap) {
            parsed.days?.forEach((day: any) => {
              if (day.imageQuery && imageMap![day.imageQuery]) {
                day.imageUrl = imageMap![day.imageQuery].url || imageMap![day.imageQuery].small;
              }
              day.activities?.forEach((act: any) => {
                if (act.imageQuery && imageMap![act.imageQuery]) {
                  act.imageUrl = imageMap![act.imageQuery].url || imageMap![act.imageQuery].small;
                }
              });
              if (day.meals) {
                ["breakfast", "lunch", "dinner"].forEach(m => {
                  if (day.meals[m]?.imageQuery && imageMap![day.meals[m].imageQuery]) {
                    day.meals[m].imageUrl = imageMap![day.meals[m].imageQuery].small || imageMap![day.meals[m].imageQuery].url;
                  }
                });
              }
            });
          }

          if (locationMap) {
            parsed.days?.forEach((day: any) => {
              const dayLocationKey = `${day.theme}, ${destination}`;
              if (locationMap?.[dayLocationKey]) {
                day.mapCenter = locationMap[dayLocationKey];
              }

              day.activities?.forEach((act: any) => {
                const locationKey = act.location ? `${act.location}, ${destination}` : "";
                if (locationKey && locationMap?.[locationKey]) {
                  act.coordinates = locationMap[locationKey];
                }
              });

              if (day.meals) {
                ["breakfast", "lunch", "dinner"].forEach(m => {
                  const meal = day.meals[m];
                  const mealLocationKey = meal?.location ? `${meal.location}, ${destination}` : "";
                  if (mealLocationKey && locationMap?.[mealLocationKey]) {
                    meal.coordinates = locationMap[mealLocationKey];
                  }
                });
              }
            });
          }

          const routePairs = parsed.days?.flatMap((day: any) => {
            const mappedActivities = (day.activities || []).filter((act: any) => act.coordinates?.lat && act.coordinates?.lng);
            return mappedActivities.slice(0, -1).map((act: any, index: number) => ({
              key: `${day.day}-${index}`,
              origin: act.coordinates,
              destination: mappedActivities[index + 1].coordinates,
            }));
          }) || [];

          if (routePairs.length > 0) {
            try {
              const routeMap = await fetchRouteEstimatesBatch(routePairs);
              parsed.days?.forEach((day: any) => {
                const mappedActivities = (day.activities || []).filter((act: any) => act.coordinates?.lat && act.coordinates?.lng);
                mappedActivities.slice(0, -1).forEach((act: any, index: number) => {
                  act.nextLeg = routeMap[`${day.day}-${index}`] || null;
                });
              });
            } catch (e) {
              console.warn("Batch route estimates failed:", e);
            }
          }

          setItineraryData(parsed);
          // Save to database
          if (user) {
            const days = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0;
            const tripPayload: any = {
              destination,
              title: parsed.title || `${destination} Trip`,
              start_date: startDate || null,
              end_date: endDate || null,
              duration: days > 0 ? `${days} days` : null,
              budget,
              currency: "USD",
              group_size: groupSize,
              styles,
              interests,
              status: "planned",
              itinerary_data: parsed,
              weather_data: weatherData,
              nearby_places: nearbyPlaces,
              upcoming_events: upcomingEvents,
              destination_photos: destinationPhotos,
              image_url: destinationPhotos?.[0]?.url || null,
            };
            if (existingTripId) {
              await updateTrip(existingTripId, tripPayload);
            } else {
              const saved = await saveTrip(tripPayload);
              if (saved) setExistingTripId((saved as any).id);
            }
            toast.success("Trip saved!");
          }
        } else {
          setError("Failed to parse itinerary. Please try again.");
        }
        setGenerating(false);
      },
      onError: (err) => { setError(err); setGenerating(false); toast.error(err); },
    });
  };

  const handleGenerate = () => handleGenerateWithIntensities();

  const handleRefreshEnrichment = () => {
    setEnrichmentFetched(false);
    setWeatherData(null);
    setNearbyPlaces(null);
    setUpcomingEvents(null);
    setDestinationPhotos([]);
  };

  const canNext = () => {
    if (step === 1) return destination.length > 0;
    if (step === 2) return dateRange.from && dateRange.to;
    if (step === 4) return styles.length > 0;
    return true;
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Full-page itinerary view after generation
  if (itineraryData && step === 7) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background pt-20 pb-20"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> My Trips
            </Button>
            <Button variant="outline" onClick={() => { setItineraryData(null); setStep(1); setExistingTripId(null); setEnrichmentFetched(false); }}>
              Plan New Trip
            </Button>
          </div>
          <AIItineraryResult
            data={itineraryData}
            weatherData={weatherData}
            nearbyPlaces={nearbyPlaces}
            upcomingEvents={upcomingEvents}
            destinationPhotos={destinationPhotos}
            tripStartDate={dateRange.from}
            destination={destination}
            tripId={existingTripId}
            travelerProfile={travelerProfile}
            onRegenerateWithArc={handleRegenerateWithArc}
            onSmartRebalance={() => {
              // Compute reduced intensities for overloaded days, then regenerate
              const reduced: Record<number, number> = { ...narrativeIntensities };
              (itineraryData?.days || []).forEach((d: any, idx: number) => {
                const acts = d.activities || [];
                const energy = acts.reduce((s: number, a: any) => {
                  const base = ({ attraction: 3, restaurant: 1, transport: 2, free: 2, shopping: 2, nightlife: 3, hiking: 5, adventure: 5, museum: 2, temple: 2 } as Record<string, number>)[a.type] || 2;
                  const hours = parseFloat(a.duration) || 1;
                  return s + Math.min(5, Math.max(1, Math.round(base * (hours / 2))));
                }, 0);
                if (energy > 15) reduced[idx] = Math.max(30, (reduced[idx] ?? 60) - 25);
                else if (energy < 8 && reduced[idx] === undefined) reduced[idx] = 75; // pack the underloaded
              });
              toast.info("AI replanning a balanced trip…");
              handleGenerateWithIntensities(reduced);
            }}
            smartRebalancing={generating}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img
          src={planTripBanner}
          alt="Tropical paradise with boat on turquoise water"
          className="w-full h-full object-cover"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        />
        <div
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center"
          style={{ opacity: Math.max(0, 1 - scrollY / (window.innerHeight * 0.35)) }}
        >
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">Start Your Journey</h1>
          <p className="text-white/90 text-lg md:text-xl max-w-xl text-center">Tell Us Your Destination & We'll Plan The Rest.</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="gradient-hero py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Left side - Image + Contact */}
            <div className="hidden lg:flex lg:flex-col">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Plan Your Next Journey With Us</h2>
              <p className="text-muted-foreground mb-8 max-w-md">Share your travel details and let our travel experts design the perfect experience for you.</p>
              <img src={planTripHero} alt="Group of travelers hiking" className="w-full flex-1 min-h-0 rounded-2xl object-cover shadow-soft" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-ocean" /></div>
                  <div><p className="text-xs text-muted-foreground">Call Us</p><p className="text-sm font-medium text-foreground">+1 (555) 123-4567</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-ocean" /></div>
                  <div><p className="text-xs text-muted-foreground">Email Us</p><p className="text-sm font-medium text-foreground">hello@voyageai.com</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center shrink-0"><MapPinned className="w-5 h-5 text-ocean" /></div>
                  <div><p className="text-xs text-muted-foreground">Visit Us</p><p className="text-sm font-medium text-foreground">New York, USA</p></div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full flex flex-col">
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {step} of {TOTAL_STEPS}</span>
                  <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-ocean rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                </div>
              </div>

              <div className="glass-card p-6 sm:p-10 animate-in flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    {/* Step 1: Destination */}
                    {step === 1 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><MapPin className="w-5 h-5 text-primary-foreground" /></div>
                          <div><h2 className="font-display text-2xl font-bold text-foreground">Where do you want to go?</h2><p className="text-sm text-muted-foreground">Type any city or country — suggestions are just inspiration</p></div>
                        </div>
                        <div className="relative mb-6">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Any destination — e.g. Tbilisi, Patagonia, Faroe Islands..."
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean font-body text-base"
                          />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                          {destination && !popularDestinations.some(d => d.name.toLowerCase() === destination.toLowerCase())
                            ? "Suggestions"
                            : "Popular destinations"}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                          {(() => {
                            const q = destination.trim().toLowerCase();
                            const filtered = q
                              ? popularDestinations.filter(d => d.name.toLowerCase().includes(q))
                              : popularDestinations;
                            if (filtered.length === 0) {
                              return (
                                <div className="col-span-full text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
                                  No match in our popular list — but <span className="font-semibold text-foreground">"{destination}"</span> works perfectly! Tap Next to continue.
                                </div>
                              );
                            }
                            return filtered.map((d) => (
                              <button
                                key={d.name}
                                onClick={() => setDestination(d.name)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border text-left",
                                  destination === d.name
                                    ? "bg-ocean text-primary-foreground border-ocean shadow-soft"
                                    : "bg-secondary border-border text-foreground hover:border-ocean/50"
                                )}
                              >
                                <span className="text-lg leading-none">{d.flag}</span>
                                <span className="truncate">{d.name}</span>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Dates */}
                    {step === 2 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><CalendarIcon className="w-5 h-5 text-primary-foreground" /></div>
                          <div>
                            <h2 className="font-display text-2xl font-bold text-foreground">Select trip dates</h2>
                            <p className="text-sm text-muted-foreground">Pick a start and end date (between in range)</p>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <Calendar mode="range" selected={dateRange as any} onSelect={(range: any) => setDateRange(range || {})} numberOfMonths={1} className="pointer-events-auto rounded-xl border border-border" disabled={(date) => date < new Date()} />
                        </div>
                        {dateRange.from && dateRange.to && (
                          <div className="mt-4 glass-card p-3 text-center">
                            <p className="text-sm font-medium text-foreground">{format(dateRange.from, "MMM d")} — {format(dateRange.to, "MMM d, yyyy")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{differenceInDays(dateRange.to, dateRange.from) + 1} days trip</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Budget */}
                    {step === 3 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary-foreground" /></div>
                          <div><h2 className="font-display text-2xl font-bold text-foreground">What's your budget?</h2><p className="text-sm text-muted-foreground">Per person, total trip — drag the slider or pick a preset</p></div>
                        </div>
                        <div className="text-center mb-6">
                          <span className="text-6xl font-display font-bold text-gradient-ocean tracking-tight">${budget.toLocaleString()}</span>
                          <p className="text-sm text-muted-foreground mt-1">per person · {groupSize > 1 ? `~$${(budget * groupSize).toLocaleString()} total` : "solo trip"}</p>
                        </div>
                        <input type="range" min={200} max={10000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-ocean" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 mb-6"><span>$200</span><span>$10,000</span></div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {budgetPresets.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => setBudget(p.value)}
                              className={cn(
                                "px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                                budget === p.value ? "bg-ocean text-primary-foreground border-ocean shadow-soft" : "bg-secondary border-border text-foreground hover:border-ocean/50"
                              )}
                            >
                              <div className="font-semibold">{p.label}</div>
                              <div className="text-xs opacity-80 mt-0.5">${p.value.toLocaleString()}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Travel Style */}
                    {step === 4 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
                          <div><h2 className="font-display text-2xl font-bold text-foreground">Your travel style</h2><p className="text-sm text-muted-foreground">Pick any that fit — mix & match freely</p></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {travelStyles.map((s) => {
                            const active = styles.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                onClick={() => toggleStyle(s.id)}
                                className={cn(
                                  "group flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all text-left",
                                  active ? "bg-ocean text-primary-foreground border-ocean shadow-soft scale-[1.02]" : "bg-secondary border-border text-foreground hover:border-ocean/50 hover:-translate-y-0.5"
                                )}
                              >
                                <s.icon className="w-7 h-7" />
                                <div>
                                  <div className="text-sm font-semibold">{s.label}</div>
                                  <div className={cn("text-xs mt-0.5", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{s.desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {styles.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-4 text-center">{styles.length} style{styles.length > 1 ? "s" : ""} selected · <button onClick={() => setStyles([])} className="underline hover:text-foreground">clear</button></p>
                        )}
                      </div>
                    )}

                    {/* Step 5: Group Size */}
                    {step === 5 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><Users className="w-5 h-5 text-primary-foreground" /></div>
                          <div><h2 className="font-display text-2xl font-bold text-foreground">How many travelers?</h2><p className="text-sm text-muted-foreground">Including yourself</p></div>
                        </div>
                        <div className="flex items-center justify-center gap-6 mb-8">
                          <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))} className="w-14 h-14 rounded-2xl bg-secondary border border-border text-foreground text-2xl font-medium hover:bg-muted transition-colors">−</button>
                          <div className="text-center w-28">
                            <span className="text-7xl font-display font-bold text-gradient-ocean leading-none">{groupSize}</span>
                            <p className="text-xs text-muted-foreground mt-2">{groupSize === 1 ? "solo traveler" : `${groupSize} travelers`}</p>
                          </div>
                          <button onClick={() => setGroupSize(Math.min(20, groupSize + 1))} className="w-14 h-14 rounded-2xl bg-secondary border border-border text-foreground text-2xl font-medium hover:bg-muted transition-colors">+</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 4, 6].map((n) => (
                            <button
                              key={n}
                              onClick={() => setGroupSize(n)}
                              className={cn(
                                "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                                groupSize === n ? "bg-ocean text-primary-foreground border-ocean" : "bg-secondary border-border text-foreground hover:border-ocean/50"
                              )}
                            >
                              {n === 1 ? "Solo" : n === 2 ? "Couple" : `Group of ${n}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 6: Interests */}
                    {step === 6 && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center"><Tag className="w-5 h-5 text-primary-foreground" /></div>
                          <div>
                            <h2 className="font-display text-2xl font-bold text-foreground">Your interests</h2>
                            <p className="text-sm text-muted-foreground">Tap anything that excites you — the more, the better</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-1">
                          {interestTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleInterest(tag)}
                              className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                interests.includes(tag)
                                  ? "bg-sunset text-accent-foreground border-sunset shadow-soft"
                                  : "bg-secondary border-border text-foreground hover:border-sunset/50 hover:-translate-y-0.5"
                              )}
                            >
                              {interests.includes(tag) ? "✓ " : "+ "}{tag}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                          <span>{interests.length} selected</span>
                          {interests.length > 0 && (
                            <button onClick={() => setInterests([])} className="underline hover:text-foreground">Clear all</button>
                          )}
                        </div>
                      </div>
                    )}


                    {/* Step 7: Generate */}
                    {step === 7 && (
                      <div className="py-6">
                        {generating ? (
                          <div className="animate-in text-center">
                            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
                            <h2 className="font-display text-2xl font-bold text-foreground mb-2">AI is crafting your itinerary...</h2>
                            <p className="text-muted-foreground">Analyzing real places, restaurants, events & attractions</p>
                            {rawStream.length > 0 && (
                              <div className="mt-4 text-left max-h-40 overflow-y-auto bg-secondary/50 rounded-xl p-4">
                                <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{rawStream.slice(-500)}</p>
                              </div>
                            )}
                          </div>
                        ) : error ? (
                          <div className="text-center animate-in">
                            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
                            <p className="text-muted-foreground mb-6">{error}</p>
                            <Button variant="ocean" onClick={handleGenerate}>Try Again</Button>
                          </div>
                        ) : (
                          <div className="animate-in space-y-5 text-center">
                            <div>
                              <div className="w-20 h-20 rounded-3xl gradient-ocean flex items-center justify-center mx-auto mb-4 animate-float">
                                <Sparkles className="w-10 h-10 text-primary-foreground" />
                              </div>
                              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Ready to generate!</h2>
                              <p className="text-sm text-muted-foreground">Here's a preview of what the AI will use</p>
                            </div>

                            <div className="glass-card p-4 text-left space-y-1.5 text-sm">
                              <p><span className="text-muted-foreground">Destination:</span> <span className="font-medium text-foreground">{destination}</span></p>
                              {dateRange.from && dateRange.to && (<p><span className="text-muted-foreground">Dates:</span> <span className="font-medium text-foreground">{format(dateRange.from, "MMM d")} — {format(dateRange.to, "MMM d")}</span></p>)}
                              <p><span className="text-muted-foreground">Budget:</span> <span className="font-medium text-foreground">${budget.toLocaleString()}/person · {groupSize} travelers</span></p>
                              <p><span className="text-muted-foreground">Style:</span> <span className="font-medium text-foreground">{styles.join(", ") || "Any"}</span></p>
                            </div>

                            {/* AI Planning Mode selector */}
                            <div className="text-left">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> Choose your AI planning mode</h3>
                                <span className="text-xs text-muted-foreground">tap to switch</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {planningModes.map((m) => {
                                  const active = planningMode === m.id;
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => setPlanningMode(m.id)}
                                      className={cn(
                                        "relative text-left rounded-2xl p-4 border bg-gradient-to-br transition-all",
                                        m.accent,
                                        active
                                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-soft scale-[1.01]"
                                          : "hover:-translate-y-0.5 hover:shadow-soft opacity-90 hover:opacity-100"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{m.emoji}</span>
                                          <span className="font-display font-bold text-foreground text-base leading-tight">{m.title}</span>
                                        </div>
                                        {active && <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Selected</span>}
                                      </div>
                                      <span className="inline-block text-[10px] uppercase tracking-wider font-semibold bg-background/60 text-foreground px-2 py-0.5 rounded-full mb-2">{m.badge}</span>
                                      <p className="text-xs text-foreground/80 italic mb-2">{m.tagline}</p>
                                      <ul className="space-y-0.5">
                                        {m.points.map((p) => (
                                          <li key={p} className="text-[11px] text-muted-foreground flex gap-1.5">
                                            <span className="text-primary">•</span><span>{p}</span>
                                          </li>
                                        ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>

                      {/* Mode Impact Summary */}
                      {planningMode && modeImpacts[planningMode] && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary p-5 text-left"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">Mode Impact — <span className="text-primary">{planningModes.find(m => m.id === planningMode)?.title}</span></h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Pacing</p>
                              <p className="text-foreground leading-snug">{modeImpacts[planningMode].pacing}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Day Structure</p>
                              <p className="text-foreground leading-snug">{modeImpacts[planningMode].structure}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Activity Density</p>
                              <p className="text-foreground leading-snug">{modeImpacts[planningMode].density}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Rest Ratio</p>
                              <p className="text-foreground leading-snug">{modeImpacts[planningMode].restRatio}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">What to expect</p>
                            <ul className="space-y-1">
                              {modeImpacts[planningMode].expect.map((item, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1 shrink-0">•</span>
                                  <span className="leading-snug">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </div>


                            {enrichmentLoading && (
                              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" /><span>Loading real-world data for {destination}…</span>
                              </div>
                            )}

                            {!enrichmentLoading && nearbyPlaces?.length > 0 && (
                              <div className="text-left">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> Top Attractions</h3>
                                  <span className="text-xs text-muted-foreground">{nearbyPlaces.length} verified</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{nearbyPlaces.slice(0, 4).map((place: any, i: number) => (<PlaceCard key={i} {...place} compact />))}</div>
                              </div>
                            )}

                            {!enrichmentLoading && upcomingEvents?.events?.length > 0 && (
                              <div className="text-left">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Ticket className="w-4 h-4 text-accent" /> Upcoming Events</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{upcomingEvents.events.slice(0, 4).map((ev: any, i: number) => (<EventCard key={i} {...ev} compact />))}</div>
                              </div>
                            )}

                            {!enrichmentLoading && weatherData?.forecast?.length > 0 && (
                              <div className="text-left">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2"><CloudSun className="w-4 h-4 text-primary" /> Weather Forecast</h3>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                  {weatherData.forecast.slice(0, 5).map((f: any) => (
                                    <div key={f.date} className="flex flex-col items-center gap-1 min-w-[60px] bg-secondary/50 rounded-lg p-2 shrink-0">
                                      <span className="text-[10px] text-muted-foreground">{new Date(f.date).toLocaleDateString("en", { weekday: "short" })}</span>
                                      <span className="text-sm font-semibold text-foreground">{f.temp}°C</span>
                                      <span className="text-[10px] text-muted-foreground capitalize">{f.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!enrichmentLoading && enrichmentFetched && !nearbyPlaces && !upcomingEvents?.events?.length && !weatherData && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                                <AlertCircle className="w-4 h-4" /><span>Enrichment unavailable — AI will plan from its own knowledge</span>
                              </div>
                            )}

                            {!user && (
                              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-sm text-accent">
                                Sign in to save your itinerary for later.
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                              {enrichmentFetched && (<Button variant="outline" size="sm" onClick={handleRefreshEnrichment}><RefreshCw className="w-4 h-4" /> Refresh Data</Button>)}
                              <Button variant="ocean" size="lg" onClick={handleGenerate} disabled={enrichmentLoading} className="px-8"><Sparkles className="w-5 h-5" /> Generate AI Itinerary</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {!generating && !itineraryData && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}><ArrowLeft className="w-4 h-4" /> Back</Button>
                    {step < 7 && (<Button variant="ocean" onClick={() => setStep(step + 1)} disabled={!canNext()}>Next <ArrowRight className="w-4 h-4" /></Button>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;
