import { motion } from "framer-motion";
import {
  Bus, Utensils, Sparkles, Shield, Hotel, Navigation,
  MapPin, DollarSign, Clock, Star, AlertTriangle, Phone,
  CreditCard, Smartphone, Route, Eye, Camera, PartyPopper,
  Gem, Heart
} from "lucide-react";

interface DuringTripData {
  localTransport?: {
    overview: string;
    options: Array<{ type: string; description: string; costRange: string; tip: string }>;
    travelCard?: string;
  };
  restaurants?: Array<{
    name: string;
    cuisine: string;
    priceRange: string;
    location: string;
    famousFor: string;
    mealType: string;
    tip?: string;
  }>;
  experiences?: Array<{
    name: string;
    type: string;
    description: string;
    location: string;
    bestTime: string;
    cost: string;
    tip?: string;
  }>;
  safety?: {
    emergencyNumber: string;
    policeNumber: string;
    nearbyHospitals: string[];
    safeAreas: string[];
    areasToAvoid: string[];
    travelInsurance: string;
    currencyExchange: string;
    atmTips: string;
    scamsToWatch?: string[];
  };
  hotelInfo?: {
    checkInTip: string;
    wifiTip: string;
    nearbyServices: string[];
    restaurantsNearHotel: string;
  };
  navigation?: {
    recommendedApps: string[];
    offlineMaps: string;
    walkingTips: string;
    keyRoutes?: Array<{ from: string; to: string; method: string; duration: string; cost: string }>;
  };
}

const expIcon = (type: string) => {
  switch (type) {
    case "hidden_gem": return <Gem className="w-4 h-4" />;
    case "festival": return <PartyPopper className="w-4 h-4" />;
    case "photo_spot": return <Camera className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const DuringTripSection = ({ data }: { data: DuringTripData }) => {
  const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay },
  });

  return (
    <div className="space-y-6">
      {/* Local Transport */}
      {data.localTransport && (
        <motion.div {...anim(0)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" /> Local Transport
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{data.localTransport.overview}</p>
          <div className="space-y-3">
            {data.localTransport.options.map((opt, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-4 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Bus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{opt.type}</p>
                    <span className="text-xs text-accent font-medium">{opt.costRange}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                  {opt.tip && <p className="text-xs text-primary mt-1">💡 {opt.tip}</p>}
                </div>
              </div>
            ))}
          </div>
          {data.localTransport.travelCard && (
            <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Travel Card:</span> {data.localTransport.travelCard}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Restaurants */}
      {data.restaurants?.length ? (
        <motion.div {...anim(0.1)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-accent" /> Restaurant Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.restaurants.map((r, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                  <span className="text-xs text-accent font-medium">{r.priceRange}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.cuisine} · {r.mealType}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {r.location}
                </p>
                <p className="text-xs text-foreground mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" /> Famous for: {r.famousFor}
                </p>
                {r.tip && <p className="text-xs text-primary mt-1">💡 {r.tip}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Experiences */}
      {data.experiences?.length ? (
        <motion.div {...anim(0.2)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Unique Experiences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.experiences.map((exp, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {expIcon(exp.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{exp.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{exp.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exp.bestTime}</span>
                  <span className="flex items-center gap-1 text-accent"><DollarSign className="w-3 h-3" /> {exp.cost}</span>
                </div>
                {exp.tip && <p className="text-xs text-primary mt-2">💡 {exp.tip}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Safety */}
      {data.safety && (
        <motion.div {...anim(0.3)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" /> Safety Information
          </h3>

          {/* Emergency contacts */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Emergency</p>
              <p className="text-lg font-bold text-destructive flex items-center gap-2">
                <Phone className="w-4 h-4" /> {data.safety.emergencyNumber}
              </p>
            </div>
            <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Police</p>
              <p className="text-lg font-bold text-destructive flex items-center gap-2">
                <Phone className="w-4 h-4" /> {data.safety.policeNumber}
              </p>
            </div>
          </div>

          {/* Hospitals */}
          {data.safety.nearbyHospitals?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-2">Nearby Hospitals</p>
              <div className="flex flex-wrap gap-2">
                {data.safety.nearbyHospitals.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 bg-secondary/50 text-foreground text-xs rounded-lg flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-destructive" /> {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safe areas & areas to avoid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {data.safety.safeAreas?.length > 0 && (
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" /> Safe Areas
                </p>
                {data.safety.safeAreas.map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                ))}
              </div>
            )}
            {data.safety.areasToAvoid?.length > 0 && (
              <div className="bg-destructive/5 rounded-xl p-3">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> Areas to Avoid
                </p>
                {data.safety.areasToAvoid.map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                ))}
              </div>
            )}
          </div>

          {/* Currency & ATM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Currency Exchange</p>
              <p className="text-sm text-foreground">{data.safety.currencyExchange}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">ATM Tips</p>
              <p className="text-sm text-foreground">{data.safety.atmTips}</p>
            </div>
          </div>

          {/* Scams */}
          {data.safety.scamsToWatch?.length ? (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Scams to Watch Out For
              </p>
              {data.safety.scamsToWatch.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground">⚠️ {s}</p>
              ))}
            </div>
          ) : null}

          {/* Travel Insurance */}
          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
            <p className="text-sm text-primary">🛡️ <strong>Travel Insurance:</strong> {data.safety.travelInsurance}</p>
          </div>
        </motion.div>
      )}

      {/* Hotel Information */}
      {data.hotelInfo && (
        <motion.div {...anim(0.4)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-accent" /> Hotel Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="text-sm text-foreground">{data.hotelInfo.checkInTip}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">WiFi</p>
              <p className="text-sm text-foreground">{data.hotelInfo.wifiTip}</p>
            </div>
          </div>
          {data.hotelInfo.nearbyServices?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground mb-2">Nearby Services</p>
              <div className="flex flex-wrap gap-2">
                {data.hotelInfo.nearbyServices.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-secondary/50 text-foreground text-xs rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-3">🍽️ {data.hotelInfo.restaurantsNearHotel}</p>
        </motion.div>
      )}

      {/* Navigation */}
      {data.navigation && (
        <motion.div {...anim(0.5)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> Navigation Guide
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Recommended Apps</p>
              <div className="flex flex-wrap gap-1.5">
                {data.navigation.recommendedApps.map((app, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> {app}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Offline Maps</p>
              <p className="text-sm text-foreground">{data.navigation.offlineMaps}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">🚶 {data.navigation.walkingTips}</p>

          {/* Key Routes */}
          {data.navigation.keyRoutes?.length ? (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Route className="w-4 h-4 text-primary" /> Key Routes
              </p>
              <div className="space-y-2">
                {data.navigation.keyRoutes.map((route, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">
                        {route.from} → {route.to}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bus className="w-3 h-3" /> {route.method}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.duration}</span>
                        <span className="flex items-center gap-1 text-accent"><DollarSign className="w-3 h-3" /> {route.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
};

export default DuringTripSection;
