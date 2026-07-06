import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Search, Bell, LogOut, LayoutDashboard, Map, Compass,
  BookOpen, Users, Heart, ArrowUpRight, Calendar, Star, ExternalLink,
  Loader2, Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";

/* ---------- helpers ---------- */
const fmtRange = (t: Trip) => {
  if (!t.start_date) return t.duration || "";
  const s = new Date(t.start_date);
  const e = t.end_date ? new Date(t.end_date) : null;
  const days = e ? Math.max(1, Math.round((+e - +s) / 86400000) + 1) : 1;
  return `${days} Days, ${s.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`;
};

const flagFor = (dest: string) => {
  const d = dest.toLowerCase();
  if (d.includes("malay") || d.includes("kuala") || d.includes("ipoh")) return "🇲🇾";
  if (d.includes("japan") || d.includes("tokyo") || d.includes("kyoto")) return "🇯🇵";
  if (d.includes("thai") || d.includes("bangkok") || d.includes("phuket")) return "🇹🇭";
  if (d.includes("viet") || d.includes("hanoi") || d.includes("saigon")) return "🇻🇳";
  if (d.includes("indo") || d.includes("bali") || d.includes("jakarta")) return "🇮🇩";
  if (d.includes("france") || d.includes("paris")) return "🇫🇷";
  if (d.includes("italy") || d.includes("rome")) return "🇮🇹";
  if (d.includes("spain") || d.includes("madrid") || d.includes("barcelona")) return "🇪🇸";
  if (d.includes("usa") || d.includes("york") || d.includes("angeles")) return "🇺🇸";
  if (d.includes("uk") || d.includes("london")) return "🇬🇧";
  return "🌍";
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

/* ---------- Sidebar ---------- */
const Sidebar = ({ trips, activeId, onSelect }: { trips: Trip[]; activeId?: string; onSelect: (id: string) => void }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name || "T").slice(0, 2).toUpperCase();

  const navGroups = [
    {
      title: "GENERAL",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard", active: true },
        { icon: Map, label: "Itinerary", to: "/plan", badge: "NEW!" },
      ],
    },
    {
      title: "DISCOVER",
      items: [
        { icon: Compass, label: "Explore", to: "/discover" },
        { icon: BookOpen, label: "Guide", to: "/blog" },
        { icon: Users, label: "Friends", to: "/memories" },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[264px] shrink-0 bg-white border border-border/60 rounded-3xl m-4 mr-0 p-5 sticky top-4 h-[calc(100vh-2rem)]">
      {/* profile card */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-2.5 pr-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Traveler"}</p>
          <p className="text-[11px] text-muted-foreground truncate">Part-time Traveller</p>
        </div>
        <button className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-secondary/60">
          <span className="text-[10px] font-bold">ID</span>
        </button>
      </div>

      {/* New Trip CTA */}
      <button
        onClick={() => navigate("/plan")}
        className="mt-4 h-12 w-full rounded-2xl bg-[#F97438] hover:bg-[#ea6a30] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(249,116,56,0.6)] transition"
      >
        <Plus className="w-4 h-4" /> New Trip
      </button>

      {/* Trips list */}
      <div className="mt-6">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-1 mb-2">TRIPS</p>
        <div className="rounded-2xl border border-border/60 p-2 space-y-1">
          {trips.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No trips yet</p>
          )}
          {trips.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-xl text-left transition",
                activeId === t.id ? "bg-secondary/70" : "hover:bg-secondary/50"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base shrink-0">
                {flagFor(t.destination)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{t.destination.split(",")[0]}</p>
                <p className="text-[11px] text-muted-foreground truncate">{fmtRange(t)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="mt-6 flex-1 overflow-y-auto space-y-5">
        {navGroups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-1 mb-2">{g.title}</p>
            <div className="space-y-1">
              {g.items.map((it) => (
                <Link
                  key={it.label}
                  to={it.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    it.active ? "bg-foreground text-white" : "text-foreground/70 hover:bg-secondary/60"
                  )}
                >
                  <it.icon className="w-4 h-4" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500 text-white">
                      {it.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut()}
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#F04A3F] hover:bg-red-50 transition"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
};

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

/* ---------- Destinations carousel ---------- */
const DestinationsRail = ({
  trips,
  activeId,
  onSelect,
}: {
  trips: Trip[];
  activeId?: string;
  onSelect: (id: string) => void;
}) => {
  const items = trips.slice(0, 8);
  const placeholders = Array.from({ length: Math.max(0, 6 - items.length) });
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    const el = itemRefs.current[activeId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  const handleClick = (t: Trip) => {
    onSelect(t.id);
    // Smoothly scroll the recommendations section into view
    requestAnimationFrame(() => {
      document.getElementById("reco-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div
      ref={scrollerRef}
      className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth -mx-1 px-1
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((t) => {
        const isActive = activeId === t.id;
        return (
          <button
            key={t.id}
            ref={(el) => (itemRefs.current[t.id] = el)}
            onClick={() => handleClick(t)}
            aria-pressed={isActive}
            aria-label={`Focus ${t.destination}`}
            className={cn(
              "relative shrink-0 w-[104px] h-[104px] rounded-2xl overflow-hidden group snap-center outline-none",
              "ring-2 transition-all duration-300 focus-visible:ring-[#F97438]",
              isActive ? "ring-[#F97438] scale-[1.03]" : "ring-transparent hover:ring-[#F97438]/60 hover:-translate-y-0.5"
            )}
          >
            <img
              src={t.image_url || t.destination_photos?.[0]?.url || "/placeholder.svg"}
              alt={t.destination}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className={cn(
              "absolute inset-0 transition-opacity",
              isActive ? "bg-black/0" : "bg-black/10 group-hover:bg-black/0"
            )} />
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/85 backdrop-blur text-foreground/80">
              {flagFor(t.destination)} {t.destination.split(",")[0].slice(0, 8)}
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-300 to-pink-400 text-white text-[10px] font-bold flex items-center justify-center">
                {t.destination.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </button>
        );
      })}
      {placeholders.map((_, i) => (
        <div key={i} className="shrink-0 w-[104px] h-[104px] rounded-2xl bg-secondary/60 snap-center" />
      ))}
    </div>
  );
};


/* ---------- Upcoming trip card ---------- */
const UpcomingCard = ({ trip }: { trip: Trip }) => {
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const day = start?.getDate();
  const month = start?.toLocaleDateString("en", { month: "short" });
  const days = trip.start_date && trip.end_date
    ? Math.max(1, Math.round((+new Date(trip.end_date) - +new Date(trip.start_date)) / 86400000) + 1)
    : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-3 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      <div className="flex gap-3">
        <img
          src={trip.image_url || "/placeholder.svg"}
          alt={trip.destination}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 flex gap-2">
          {day && (
            <div className="rounded-xl bg-[#FFEDD5] px-3 py-2 text-center min-w-[52px]">
              <p className="text-[10px] font-semibold text-[#C2410C]">{month}</p>
              <p className="text-lg font-display font-bold text-[#9A3412] leading-none">{day}</p>
            </div>
          )}
          {days && (
            <div className="rounded-xl bg-[#FEE2E2] px-3 py-2 text-center min-w-[52px]">
              <p className="text-lg font-display font-bold text-[#B91C1C] leading-none">{days}</p>
              <p className="text-[10px] font-semibold text-[#B91C1C] mt-0.5">Days</p>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="font-display font-bold text-foreground text-[15px] leading-tight">{trip.title || trip.destination}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{trip.destination}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground">Budget: <span className="font-semibold text-foreground">${trip.budget?.toLocaleString()}</span></p>
        <div className="flex -space-x-1.5">
          {Array.from({ length: Math.min(trip.group_size || 1, 3) }).map((_, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-300 to-pink-500 border-2 border-white" />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Friends Location ---------- */
const FriendsLocation = () => {
  const friends = [
    { name: "Shelly A.", place: "Japan", top: "22%", left: "72%" },
    { name: "Edgar P.", place: "Argentina", top: "58%", left: "30%" },
    { name: "Mira T.", place: "Kenya", top: "62%", left: "56%" },
  ];
  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6 h-full">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Friends Location</h3>
          <p className="text-xs text-muted-foreground mt-1">Check on your friend live location</p>
        </div>
        <button className="text-xs font-semibold text-[#C2410C] bg-[#FFEDD5] hover:bg-[#FED7AA] px-3 py-1.5 rounded-full transition">
          Expand
        </button>
      </div>
      <div className="relative mt-4 h-[240px] rounded-2xl overflow-hidden bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--muted-foreground)/0.25)_1px,_transparent_0)] [background-size:10px_10px]">
        {friends.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="absolute flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-md border border-border/60"
            style={{ top: f.top, left: f.left }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-pink-500 border-2 border-white shrink-0" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-foreground">{f.name}</p>
              <p className="text-[10px] text-muted-foreground">{f.place}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Recommendation row ---------- */
const RecoRow = ({ trip }: { trip: Trip }) => {
  const places = useMemo(() => {
    const p = (trip?.nearby_places as any[]) || [];
    return p.slice(0, 3);
  }, [trip]);

  const fallback = [
    { name: `Central Market - ${trip.destination.split(",")[0]}`, rating: 4.5, count: 47, desc: "A vibrant cultural landmark offering local crafts, souvenirs, and more.", tags: ["Shopping", "Souvenirs", "Culture"], guide: "Nita" },
    { name: `Old Square - ${trip.destination.split(",")[0]}`, rating: 4.6, count: 53, desc: "An iconic historic site surrounded by colonial buildings and cafés.", tags: ["History", "Architecture", "Photography"], guide: "El Primo" },
  ];
  const items = places.length ? places.map((p, i) => ({
    name: p.name,
    rating: p.rating || 4.5,
    count: p.user_ratings_total || 40 + i,
    desc: (p.types || []).slice(0, 3).join(", ") || "A must-see spot loved by travellers.",
    tags: (p.types || []).slice(0, 3).map((t: string) => t.replace(/_/g, " ")),
    guide: ["Nita", "El Primo", "Marco"][i % 3],
    img: p.photo,
  })) : fallback;

  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            For your <span className="text-[#F97438]">{trip.destination.split(",")[0]}</span>{" "}
            <span className="text-2xl">⛺</span> Trip
          </h3>
          <p className="text-xs text-muted-foreground mt-1">These can't be missed places</p>
        </div>
        <button className="text-xs font-semibold text-[#C2410C] bg-[#FFEDD5] hover:bg-[#FED7AA] px-3 py-1.5 rounded-full">Details</button>
      </div>
      <div className="mt-5 space-y-4">
        {items.slice(0, 2).map((p: any, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-secondary">
              <img
                src={p.img || trip.image_url || "/placeholder.svg"}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-sm leading-tight">{p.name}</p>
                <div className="flex gap-1.5 shrink-0">
                  <button className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-secondary/60">
                    <Heart className="w-3.5 h-3.5 text-[#F04A3F]" fill={i === 0 ? "#F04A3F" : "none"} />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-[#F97438] flex items-center justify-center hover:bg-[#ea6a30]">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.desc}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">{p.rating}</span>
                <span className="text-xs text-muted-foreground">({p.count})</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Guide by:</span>
                  <div className="flex items-center gap-1 bg-secondary/60 rounded-full pl-0.5 pr-2 py-0.5">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-300 to-pink-500" />
                    <span className="text-[10px] font-semibold text-foreground">{p.guide}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map((t: string, k: number) => (
                    <span
                      key={k}
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                        ["bg-orange-50 text-orange-700 border-orange-100", "bg-emerald-50 text-emerald-700 border-emerald-100", "bg-sky-50 text-sky-700 border-sky-100"][k % 3]
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Featured itinerary ---------- */
const FeaturedItinerary = ({ trip }: { trip: Trip }) => {
  const days = trip.itinerary_data?.days?.length || 7;
  return (
    <div className="rounded-3xl border border-border/60 bg-white p-5 h-full flex flex-col">
      <p className="font-display text-lg font-bold text-foreground leading-tight">
        One Week Itinerary - {trip.destination.split(",")[0]}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">Traveller:</span>
        <div className="flex items-center gap-1.5 bg-secondary/60 rounded-full pl-0.5 pr-2 py-0.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-300 to-pink-500" />
          <span className="text-xs font-semibold text-foreground">Mortis A.</span>
        </div>
      </div>
      <div className="mt-3 rounded-2xl overflow-hidden aspect-[4/3] bg-secondary">
        <img
          src={trip.image_url || trip.destination_photos?.[0]?.url || "/placeholder.svg"}
          alt={trip.destination}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>
      <p className="text-xs font-semibold text-foreground mt-4">Details:</p>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: "Budget", value: `$${(trip.budget || 1200).toLocaleString()}`, bg: "bg-orange-50" },
          { label: "Person", value: String(trip.group_size || 2), bg: "bg-rose-50" },
          { label: "Durations", value: `${days}d, ${Math.max(1, days - 1)}n`, bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl px-3 py-2", s.bg)}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-display font-bold text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const Dashboard = () => {
  const { user } = useAuth();
  const { trips, planned, active, loading } = useTrips();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const focusTrip = useMemo(() => {
    if (selectedId) return trips.find((t) => t.id === selectedId) || trips[0];
    return active[0] || planned[0] || trips[0];
  }, [selectedId, trips, active, planned]);

  const upcoming = useMemo(() => planned.slice(0, 2), [planned]);

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
        <Sidebar trips={trips} activeId={focusTrip?.id} onSelect={setSelectedId} />

        <main className="flex-1 p-4 lg:p-8">
          <Header name={user.name} />

          {loading ? (
            <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#F97438]" /></div>
          ) : trips.length === 0 ? (
            <EmptyDashboard onNew={() => navigate("/plan")} />
          ) : (
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* LEFT column (2/3) */}
              <div className="xl:col-span-2 space-y-6">
                <DestinationsRail trips={trips} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Upcoming Trip</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Remember your upcoming trips!</p>
                    </div>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-xs font-semibold text-[#C2410C] bg-[#FFEDD5] hover:bg-[#FED7AA] px-3 py-1.5 rounded-full transition"
                    >
                      Details
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcoming.length > 0 ? upcoming.map((t) => <UpcomingCard key={t.id} trip={t} />) : (
                      <div className="col-span-2 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No upcoming trips.{" "}
                        <button onClick={() => navigate("/plan")} className="text-[#F97438] font-semibold underline underline-offset-2">Plan one</button>
                      </div>
                    )}
                  </div>
                </div>

                {focusTrip && <RecoRow trip={focusTrip} />}
              </div>

              {/* RIGHT column (1/3) */}
              <div className="space-y-6">
                <FriendsLocation />
                {focusTrip && <FeaturedItinerary trip={focusTrip} />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const EmptyDashboard = ({ onNew }: { onNew: () => void }) => (
  <div className="mt-16 rounded-3xl border border-border/60 bg-white p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#FFEDD5] flex items-center justify-center mx-auto mb-5">
      <Compass className="w-8 h-8 text-[#F97438]" />
    </div>
    <h3 className="font-display text-2xl font-bold text-foreground">Start planning your first trip</h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
      Create an itinerary and it will appear here with all your recommendations, friends, and highlights.
    </p>
    <button
      onClick={onNew}
      className="mt-6 h-11 px-6 rounded-full bg-[#F97438] hover:bg-[#ea6a30] text-white font-semibold text-sm inline-flex items-center gap-2 transition"
    >
      <Plus className="w-4 h-4" /> New Trip <ArrowUpRight className="w-4 h-4" />
    </button>
    <div className="hidden">
      <Calendar />
    </div>
  </div>
);

export default Dashboard;
