import { motion } from "framer-motion";
import {
  Globe, Thermometer, DollarSign, Luggage, FileText, CalendarDays,
  MapPin, Clock, Languages, Coins, Sun, CloudRain, Cloud, Snowflake,
  Plane, Hotel, Utensils, Bus, Ticket, CheckCircle2, AlertTriangle,
  Shirt, Smartphone, Heart
} from "lucide-react";

interface BeforeTripData {
  destinationOverview?: {
    country: string;
    language: string;
    timezone: string;
    currency: string;
    bestMonths: string[];
    topAttractions: string[];
    cultureTips: string[];
  };
  weatherForecast?: {
    overview: string;
    avgTemp: string;
    rainChance: string;
    bestTimeToExplore: string;
    dailyForecast?: Array<{ date: string; condition: string; tempHigh: string; tempLow: string; advisory?: string }>;
  };
  budgetEstimation?: {
    flights: { estimate: number; notes: string };
    hotels: { estimate: number; notes: string };
    food: { estimate: number; notes: string };
    transport: { estimate: number; notes: string };
    activities: { estimate: number; notes: string };
    total: number;
  };
  packingChecklist?: {
    clothing: string[];
    documents: string[];
    electronics: string[];
    essentials: string[];
  };
  visaAndDocuments?: {
    visaRequired: boolean;
    visaType: string;
    passportValidity: string;
    entryRules: string[];
    additionalDocs: string[];
  };
  itineraryPreview?: Array<{ day: number; highlights: string[] }>;
}

const weatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-4 h-4" />;
  if (c.includes("cloud")) return <Cloud className="w-4 h-4" />;
  if (c.includes("snow")) return <Snowflake className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
};

const budgetIcons: Record<string, React.ReactNode> = {
  flights: <Plane className="w-5 h-5" />,
  hotels: <Hotel className="w-5 h-5" />,
  food: <Utensils className="w-5 h-5" />,
  transport: <Bus className="w-5 h-5" />,
  activities: <Ticket className="w-5 h-5" />,
};

const packingIcons: Record<string, React.ReactNode> = {
  clothing: <Shirt className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  electronics: <Smartphone className="w-4 h-4" />,
  essentials: <Heart className="w-4 h-4" />,
};

const BeforeTripSection = ({ data }: { data: BeforeTripData }) => {
  const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay },
  });

  return (
    <div className="space-y-6">
      {/* Destination Overview */}
      {data.destinationOverview && (
        <motion.div {...anim(0)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Destination Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="text-sm font-semibold text-foreground">{data.destinationOverview.country}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Languages className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="text-sm font-semibold text-foreground">{data.destinationOverview.language}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Timezone</p>
              <p className="text-sm font-semibold text-foreground">{data.destinationOverview.timezone}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Coins className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="text-sm font-semibold text-foreground">{data.destinationOverview.currency}</p>
            </div>
          </div>

          {/* Top Attractions */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">Top Attractions</p>
            <div className="flex flex-wrap gap-2">
              {data.destinationOverview.topAttractions.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {a}
                </span>
              ))}
            </div>
          </div>

          {/* Culture Tips */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Cultural Tips</p>
            <div className="space-y-1.5">
              {data.destinationOverview.cultureTips.map((tip, i) => (
                <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> {tip}
                </p>
              ))}
            </div>
          </div>

          {/* Best Months */}
          {data.destinationOverview.bestMonths?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Best months to visit: <span className="font-medium text-foreground">{data.destinationOverview.bestMonths.join(", ")}</span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Weather Forecast */}
      {data.weatherForecast && (
        <motion.div {...anim(0.1)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-accent" /> Weather Forecast
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{data.weatherForecast.overview}</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg Temp</p>
              <p className="text-lg font-bold text-foreground">{data.weatherForecast.avgTemp}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Rain Chance</p>
              <p className="text-lg font-bold text-foreground">{data.weatherForecast.rainChance}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Best Time</p>
              <p className="text-lg font-bold text-foreground">{data.weatherForecast.bestTimeToExplore}</p>
            </div>
          </div>
          {data.weatherForecast.dailyForecast?.length ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.weatherForecast.dailyForecast.map((f) => (
                <div key={f.date} className="flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-lg bg-secondary/50 shrink-0">
                  <span className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
                  {weatherIcon(f.condition)}
                  <span className="text-sm font-semibold text-foreground">{f.tempHigh}</span>
                  <span className="text-[10px] text-muted-foreground">{f.tempLow}</span>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Budget Estimation */}
      {data.budgetEstimation && (
        <motion.div {...anim(0.2)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" /> Budget Estimation
          </h3>
          <div className="space-y-3">
            {(["flights", "hotels", "food", "transport", "activities"] as const).map((key) => {
              const item = data.budgetEstimation![key];
              if (!item) return null;
              const total = data.budgetEstimation!.total || 1;
              const pct = Math.round((item.estimate / total) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {budgetIcons[key]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground capitalize">{key}</p>
                        <p className="text-xs text-muted-foreground">{item.notes}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">${item.estimate.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-ocean rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Total Estimated</span>
              <span className="text-xl font-bold text-gradient-ocean">${data.budgetEstimation.total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Packing Checklist */}
      {data.packingChecklist && (
        <motion.div {...anim(0.3)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-primary" /> Packing Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["clothing", "documents", "electronics", "essentials"] as const).map((cat) => {
              const items = data.packingChecklist![cat];
              if (!items?.length) return null;
              return (
                <div key={cat} className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-foreground capitalize mb-2 flex items-center gap-2">
                    {packingIcons[cat]} {cat}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary/50" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Visa & Documents */}
      {data.visaAndDocuments && (
        <motion.div {...anim(0.4)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Visa & Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Visa Required</p>
              <p className="text-sm font-semibold text-foreground">{data.visaAndDocuments.visaRequired ? "Yes" : "No"}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Visa Type</p>
              <p className="text-sm font-semibold text-foreground">{data.visaAndDocuments.visaType}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Passport Validity</p>
              <p className="text-sm font-semibold text-foreground">{data.visaAndDocuments.passportValidity}</p>
            </div>
          </div>
          {data.visaAndDocuments.entryRules?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground mb-2">Entry Rules</p>
              <div className="space-y-1.5">
                {data.visaAndDocuments.entryRules.map((rule, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> {rule}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Itinerary Preview */}
      {data.itineraryPreview?.length ? (
        <motion.div {...anim(0.5)} className="glass-card p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Itinerary Preview
          </h3>
          <div className="space-y-3">
            {data.itineraryPreview.map((day) => (
              <div key={day.day} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  D{day.day}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {day.highlights.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 bg-secondary/70 text-foreground text-xs rounded-lg">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default BeforeTripSection;
