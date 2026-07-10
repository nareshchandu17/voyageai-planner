import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Search, Bell, Sparkles, ArrowRight, Apple, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";
import FriendsLocationMap from "@/components/dashboard/FriendsLocationMap";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

import illusLuggage from "@/assets/illus-luggage.png";
import illusSignpost from "@/assets/illus-signpost.png";
import illusMountains from "@/assets/illus-mountains.png";
import illusCalendar from "@/assets/illus-calendar.png";
import destJapan from "@/assets/hero-japan.jpg";
import destSwitzerland from "@/assets/hero-switzerland.jpg";
import destBali from "@/assets/hero-bali.jpg";
import destIceland from "@/assets/hero-iceland.jpg";
import destItaly from "@/assets/hero-italy.jpg";

/* ---------- helpers ---------- */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

const RECOMMENDED = [
  { name: "Japan", img: destJapan, tags: ["Culture", "Food", "Adventure"] },
  { name: "Switzerland", img: destSwitzerland, tags: ["Mountains", "Lakes", "Nature"] },
  { name: "Bali", img: destBali, tags: ["Beaches", "Culture", "Relax"] },
  { name: "Iceland", img: destIceland, tags: ["Nature", "Adventure", "Aurora"] },
  { name: "Italy", img: destItaly, tags: ["History", "Food", "Architecture"] },
];

/* ---------- Header ---------- */
const Header = ({ name }: { name: string }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
        {greeting()}, {name.split(" ")[0]} <span className="text-3xl">👋</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1.5">Plan your itinerary with us</p>
    </div>
    <div className="flex items-center gap-2">
      <button className="w-10 h-10 rounded-full border border-border/60 bg-white flex items-center justify-center hover:bg-secondary/60 transition">
        <Search className="w-4 h-4 text-foreground/70" />
      </button>
      <button className="relative w-10 h-10 rounded-full border border-border/60 bg-white flex items-center justify-center hover:bg-secondary/60 transition">
        <Bell className="w-4 h-4 text-foreground/70" />
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#F04A3F]" />
      </button>
      <div className="hidden md:flex items-center gap-2 pl-3 pr-1 h-10 rounded-full border border-border/60 bg-white">
        <span className="text-xs text-muted-foreground">Get Apps:</span>
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
            <Apple className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#00A4EF] flex items-center justify-center text-white text-[10px] font-bold">⊞</div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Hero prompt card ---------- */
const HeroPromptCard = ({ onPlan }: { onPlan: (prompt: string) => void }) => {
  const [value, setValue] = useState("");
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-[#FFF8F1] via-white to-[#FFEFE0] p-8 h-full min-h-[420px] flex flex-col justify-center">
      <div className="relative z-10 max-w-[58%]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F97438]" />
          <h2 className="font-display text-2xl sm:text-[26px] font-bold text-foreground">
            Where would you like to go?
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Describe your dream trip and let AI craft the perfect itinerary for you.
        </p>
        <div className="mt-6 flex items-center gap-2 p-1.5 rounded-full bg-white border border-border/60 shadow-sm max-w-xl">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onPlan(value)}
            placeholder="e.g. 7 days trip to Japan with budget $1500"
            className="flex-1 min-w-0 bg-transparent px-4 h-10 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <button
            onClick={() => onPlan(value)}
            className="shrink-0 h-10 px-4 rounded-full bg-[#F97438] hover:bg-[#ea6a30] text-white text-sm font-semibold inline-flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" /> Plan My Trip
          </button>
        </div>
      </div>
      <img
        src={illusLuggage}
        alt="Travel luggage"
        loading="lazy"
        className="absolute right-2 bottom-0 top-0 my-auto h-[220px] w-auto object-contain pointer-events-none select-none hidden sm:block"
      />
    </div>
  );
};

/* ---------- Empty state card ---------- */
const EmptyStateCard = ({
  title,
  subtitle,
  illus,
  headline,
  hint,
  action,
  actionLabel,
  rightSlot,
}: {
  title: string;
  subtitle: string;
  illus: string;
  headline: string;
  hint: string;
  action?: () => void;
  actionLabel?: string;
  rightSlot?: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-border/60 bg-white p-5 flex flex-col h-full">
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="font-display text-[15px] font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {rightSlot}
    </div>
    <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
      <img src={illus} alt="" loading="lazy" className="h-24 w-auto object-contain" />
      <p className="mt-3 font-display font-bold text-foreground text-[15px]">{headline}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{hint}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-3 h-8 px-3 rounded-full border border-[#F97438]/40 text-[#F97438] text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#FFEDD5] transition"
        >
          <Plus className="w-3.5 h-3.5" /> {actionLabel}
        </button>
      )}
    </div>
  </div>
);

/* ---------- Recommended destinations ---------- */
const RecommendedDestinations = () => {
  const navigate = useNavigate();
  return (
    <div className="rounded-3xl border border-border/60 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[15px] font-bold text-foreground">Recommended Destinations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Explore popular places loved by travelers</p>
        </div>
        <button
          onClick={() => navigate("/discover")}
          className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412] inline-flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {RECOMMENDED.map((d) => (
          <button
            key={d.name}
            onClick={() => navigate("/discover")}
            className="group text-left"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary">
              <img
                src={d.img}
                alt={d.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="mt-2 font-semibold text-sm text-foreground">{d.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {d.tags.join(" · ")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- Empty Dashboard ---------- */
const EmptyDashboardLayout = ({ name }: { name: string }) => {
  const navigate = useNavigate();
  const goPlan = (prompt?: string) => {
    if (prompt) sessionStorage.setItem("voyageai:plan-prompt", prompt);
    navigate("/plan");
  };
  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="xl:col-span-2 h-full">
          <HeroPromptCard onPlan={goPlan} />
        </div>
        <div className="rounded-3xl border border-border/60 bg-white overflow-hidden h-full">
          <FriendsLocationMap />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EmptyStateCard
          title="Upcoming Trips"
          subtitle="You have no upcoming trips"
          illus={illusSignpost}
          headline="Plan your next adventure"
          hint="Start by creating your first trip and it will appear here."
          action={() => goPlan()}
          actionLabel="New Trip"
          rightSlot={
            <button className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412]">View all</button>
          }
        />
        <EmptyStateCard
          title="For you ✨"
          subtitle="Discover amazing places handpicked for you"
          illus={illusMountains}
          headline="Recommendations will appear here"
          hint="Once you start planning, we'll show personalized suggestions."
        />
        <EmptyStateCard
          title="One Week Itinerary"
          subtitle="Create your first itinerary"
          illus={illusCalendar}
          headline="No itinerary yet"
          hint="Your day-by-day plan will be shown here."
        />
      </div>

      <RecommendedDestinations />
    </div>
  );
};

/* ---------- Page ---------- */
const Dashboard = () => {
  const { user } = useAuth();
  const { trips, loading } = useTrips();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const focusTrip = useMemo<Trip | undefined>(
    () => (selectedId ? trips.find((t) => t.id === selectedId) : trips[0]),
    [selectedId, trips]
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="bg-white border border-border/60 rounded-3xl p-10 max-w-md text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Sign in to your dashboard</h2>
          <p className="text-muted-foreground mb-6">Access your trips and travel plans.</p>
          <Link to="/auth"><Button className="bg-[#F97438] hover:bg-[#ea6a30] text-white rounded-full h-11 px-6">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="flex max-w-[1500px] mx-auto">
        <DashboardSidebar trips={trips} activeTripId={focusTrip?.id} onSelectTrip={setSelectedId} />

        <main className="flex-1 p-4 lg:p-8">
          <Header name={user.name} />

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#F97438]" />
            </div>
          ) : (
            <EmptyDashboardLayout name={user.name} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
