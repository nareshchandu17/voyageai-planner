import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, CalendarIcon, MapPin, DollarSign,
  Users, Sparkles, Loader2, Mountain, Palette, UtensilsCrossed,
  TreePine, Crown, Wallet, Tag, Search
} from "lucide-react";

const travelStyles = [
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "culture", label: "Culture", icon: Palette },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "nature", label: "Nature", icon: TreePine },
  { id: "luxury", label: "Luxury", icon: Crown },
  { id: "budget", label: "Budget", icon: Wallet },
];

const interestTags = [
  "Photography", "Hiking", "Museums", "Street Food", "Beaches", "Nightlife",
  "History", "Shopping", "Wellness", "Architecture", "Wildlife", "Festivals",
];

const popularDestinations = [
  "Tokyo, Japan", "Bali, Indonesia", "Paris, France", "New York, USA",
  "Barcelona, Spain", "Cape Town, South Africa", "Iceland", "Machu Picchu, Peru",
];

const TOTAL_STEPS = 7;

const PlanTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [budget, setBudget] = useState(2000);
  const [styles, setStyles] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleStyle = (id: string) => {
    setStyles((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      navigate("/itinerary");
    }, 3000);
  };

  const canNext = () => {
    if (step === 1) return destination.length > 0;
    if (step === 2) return dateRange.from && dateRange.to;
    if (step === 4) return styles.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen gradient-hero pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-ocean rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-10 animate-in">
          {/* Step 1: Destination */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Where do you want to go?</h2>
                  <p className="text-sm text-muted-foreground">Search for a destination or pick a popular one</p>
                </div>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean font-body text-base"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      destination === d
                        ? "bg-ocean text-primary-foreground border-ocean"
                        : "bg-secondary border-border text-foreground hover:border-ocean/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">When are you traveling?</h2>
                  <p className="text-sm text-muted-foreground">Select your trip dates</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange as any}
                  onSelect={(range: any) => setDateRange(range || {})}
                  numberOfMonths={1}
                  className="pointer-events-auto rounded-xl border border-border"
                  disabled={(date) => date < new Date()}
                />
              </div>
              {dateRange.from && dateRange.to && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {format(dateRange.from, "MMM d")} — {format(dateRange.to, "MMM d, yyyy")}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">What's your budget?</h2>
                  <p className="text-sm text-muted-foreground">Set a total trip budget per person</p>
                </div>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-display font-bold text-gradient-ocean">${budget.toLocaleString()}</span>
                <p className="text-sm text-muted-foreground mt-1">per person</p>
              </div>
              <input
                type="range"
                min={200}
                max={10000}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-ocean"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$200</span>
                <span>$10,000</span>
              </div>
            </div>
          )}

          {/* Step 4: Travel Style */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your travel style</h2>
                  <p className="text-sm text-muted-foreground">Select one or more styles</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {travelStyles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all",
                      styles.includes(s.id)
                        ? "bg-ocean text-primary-foreground border-ocean shadow-soft"
                        : "bg-secondary border-border text-foreground hover:border-ocean/50"
                    )}
                  >
                    <s.icon className="w-7 h-7" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Group Size */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">How many travelers?</h2>
                  <p className="text-sm text-muted-foreground">Including yourself</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                  className="w-14 h-14 rounded-2xl bg-secondary border border-border text-foreground text-2xl font-medium hover:bg-muted transition-colors"
                >−</button>
                <span className="text-6xl font-display font-bold text-gradient-ocean w-20 text-center">{groupSize}</span>
                <button
                  onClick={() => setGroupSize(Math.min(20, groupSize + 1))}
                  className="w-14 h-14 rounded-2xl bg-secondary border border-border text-foreground text-2xl font-medium hover:bg-muted transition-colors"
                >+</button>
              </div>
            </div>
          )}

          {/* Step 6: Interests */}
          {step === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Your interests</h2>
                  <p className="text-sm text-muted-foreground">Help us personalize your trip</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      interests.includes(tag)
                        ? "bg-sunset text-accent-foreground border-sunset"
                        : "bg-secondary border-border text-foreground hover:border-sunset/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Generate */}
          {step === 7 && (
            <div className="text-center py-6">
              {generating ? (
                <div className="animate-in">
                  <Loader2 className="w-16 h-16 mx-auto text-ocean animate-spin mb-6" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Crafting your perfect trip...
                  </h2>
                  <p className="text-muted-foreground">Our AI is analyzing thousands of options</p>
                </div>
              ) : (
                <div className="animate-in">
                  <div className="w-20 h-20 rounded-3xl gradient-sunset flex items-center justify-center mx-auto mb-6 animate-float">
                    <Sparkles className="w-10 h-10 text-accent-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ready to generate!</h2>
                  <p className="text-muted-foreground mb-2">Here's your trip summary:</p>
                  <div className="glass-card p-5 text-left space-y-2 mb-6 text-sm">
                    <p><span className="text-muted-foreground">Destination:</span> <span className="font-medium text-foreground">{destination}</span></p>
                    {dateRange.from && dateRange.to && (
                      <p><span className="text-muted-foreground">Dates:</span> <span className="font-medium text-foreground">{format(dateRange.from, "MMM d")} — {format(dateRange.to, "MMM d")}</span></p>
                    )}
                    <p><span className="text-muted-foreground">Budget:</span> <span className="font-medium text-foreground">${budget.toLocaleString()}/person</span></p>
                    <p><span className="text-muted-foreground">Style:</span> <span className="font-medium text-foreground">{styles.join(", ") || "Any"}</span></p>
                    <p><span className="text-muted-foreground">Group:</span> <span className="font-medium text-foreground">{groupSize} travelers</span></p>
                    <p><span className="text-muted-foreground">Interests:</span> <span className="font-medium text-foreground">{interests.join(", ") || "Any"}</span></p>
                  </div>
                  <Button variant="sunset" size="xl" onClick={handleGenerate}>
                    <Sparkles className="w-5 h-5" />
                    Generate My Itinerary
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {!generating && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 7 && (
                <Button
                  variant="ocean"
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;
