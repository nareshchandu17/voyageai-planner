import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus, LogOut, LayoutDashboard, Map, Compass,
  BookOpen, Users, Home, Sparkles, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";

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

const fmtRange = (t: Trip) => {
  if (!t.start_date) return t.duration || "";
  const s = new Date(t.start_date);
  const e = t.end_date ? new Date(t.end_date) : null;
  const days = e ? Math.max(1, Math.round((+e - +s) / 86400000) + 1) : 1;
  return `${days} Days, ${s.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`;
};

interface Props {
  trips?: Trip[];
  activeTripId?: string;
  onSelectTrip?: (id: string) => void;
}

const DashboardSidebar = ({ trips: tripsProp, activeTripId, onSelectTrip }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { trips: fetchedTrips } = useTrips();
  const trips = tripsProp ?? fetchedTrips;
  const initials = (user?.name || "T").slice(0, 2).toUpperCase();

  const navGroups = [
    {
      title: "GENERAL",
      items: [
        { icon: Home, label: "Home", to: "/" },
        { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
        { icon: Sparkles, label: "Plan Trip", to: "/plan", badge: "AI" },
        { icon: Map, label: "Itinerary", to: "/itinerary" },
      ],
    },
    {
      title: "DISCOVER",
      items: [
        { icon: Compass, label: "Explore", to: "/discover" },
        { icon: BookOpen, label: "Guide", to: "/blog" },
        { icon: Users, label: "Memories", to: "/memories" },
        { icon: Info, label: "About", to: "/about" },
      ],
    },
  ];

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  const handleTripClick = (id: string) => {
    if (onSelectTrip) onSelectTrip(id);
    if (pathname !== "/dashboard") navigate("/dashboard");
  };

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
      {trips.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-1 mb-2">TRIPS</p>
          <div className="rounded-2xl border border-border/60 p-2 space-y-1 max-h-[220px] overflow-y-auto">
            {trips.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTripClick(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl text-left transition",
                  activeTripId === t.id ? "bg-secondary/70" : "hover:bg-secondary/50"
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
      )}

      {/* Nav */}
      <div className="mt-6 flex-1 overflow-y-auto space-y-5">
        {navGroups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-1 mb-2">{g.title}</p>
            <div className="space-y-1">
              {g.items.map((it) => {
                const active = isActive(it.to);
                return (
                  <Link
                    key={it.label}
                    to={it.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                      active ? "bg-foreground text-white" : "text-foreground/70 hover:bg-secondary/60"
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
                );
              })}
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

export default DashboardSidebar;
