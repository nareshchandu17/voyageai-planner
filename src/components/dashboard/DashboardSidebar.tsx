import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogOut, LayoutDashboard, Map, Compass,
  BookOpen, Users, Sparkles, Info, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

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

const STORAGE_KEY = "voyageai:sidebar:collapsed";

// Elegant spring — fast, physical, no bounce overshoot
const SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };

const DashboardSidebar = ({ trips: tripsProp, activeTripId, onSelectTrip }: Props) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { trips: fetchedTrips } = useTrips();
  const trips = tripsProp ?? fetchedTrips;
  const initials = (user?.name || "T").slice(0, 2).toUpperCase();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    // notify other sidebar instances / listeners
    window.dispatchEvent(new CustomEvent("voyageai:sidebar:toggle", { detail: { collapsed } }));
  }, [collapsed]);

  // Keep multiple sidebar instances in sync + hotkey [
  useEffect(() => {
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.collapsed === "boolean") setCollapsed(detail.collapsed);
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "[") { e.preventDefault(); setCollapsed((c) => !c); }
    };
    window.addEventListener("voyageai:sidebar:toggle", onSync as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("voyageai:sidebar:toggle", onSync as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const navGroups = [
    {
      title: "GENERAL",
      items: [
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

  const WIDTH_EXPANDED = 264;
  const WIDTH_COLLAPSED = 84;

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
        transition={SPRING}
        className="hidden lg:flex flex-col shrink-0 bg-white border border-border/60 rounded-3xl m-4 mr-0 p-3 sticky top-4 h-[calc(100vh-2rem)] relative overflow-hidden"
        style={{ willChange: "width" }}
      >
        {/* Floating collapse handle — always visible, morphs with state */}
        <motion.button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute -right-3 top-8 z-20 w-6 h-10 rounded-full bg-foreground text-white flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35)] ring-2 ring-white"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {collapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
          </motion.div>
        </motion.button>

        <div className={cn("p-2", collapsed && "px-0")}>
          {/* profile card */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border/60 transition-all",
              collapsed ? "p-1.5 justify-center border-transparent" : "p-2.5 pr-3"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 cursor-default">
                  {initials}
                </div>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{user?.name || "Traveler"}</TooltipContent>}
            </Tooltip>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="profile-info"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 min-w-0 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Traveler"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">Part-time Traveller</p>
                  </div>
                  <button className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-secondary/60 shrink-0">
                    <span className="text-[10px] font-bold">ID</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Trip CTA */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/plan")}
                className={cn(
                  "mt-4 h-12 w-full rounded-2xl bg-[#F97438] hover:bg-[#ea6a30] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(249,116,56,0.6)] transition-all hover:shadow-[0_14px_28px_-8px_rgba(249,116,56,0.7)]"
                )}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      New Trip
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">New Trip</TooltipContent>}
          </Tooltip>
        </div>

        {/* Trips list — hidden when collapsed */}
        <AnimatePresence initial={false}>
          {!collapsed && trips.length > 0 && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-4 px-2 overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className={cn("mt-6 flex-1 overflow-y-auto overflow-x-hidden space-y-5", collapsed ? "px-1" : "px-2")}>
          {navGroups.map((g) => (
            <div key={g.title}>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-1 mb-2"
                  >
                    {g.title}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                {g.items.map((it) => {
                  const active = isActive(it.to);
                  const link = (
                    <Link
                      to={it.to}
                      className={cn(
                        "group relative flex items-center rounded-xl text-sm font-medium transition-colors",
                        collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
                        active ? "bg-foreground text-white" : "text-foreground/70 hover:bg-secondary/60"
                      )}
                    >
                      <it.icon className="w-4 h-4 shrink-0" />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.16 }}
                            className="flex-1 whitespace-nowrap"
                          >
                            {it.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!collapsed && it.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500 text-white">
                          {it.badge}
                        </span>
                      )}
                      {collapsed && it.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white" />
                      )}
                    </Link>
                  );
                  return collapsed ? (
                    <Tooltip key={it.label}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2">
                        {it.label}
                        {it.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500 text-white">
                            {it.badge}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={it.label}>{link}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className={cn("mt-4", collapsed ? "px-1" : "px-2")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setLogoutOpen(true)}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium text-[#F04A3F] hover:bg-red-50 transition-colors w-full",
                  collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5"
                )}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.16 }}
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>

        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Log out of VoyageAI?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll be signed out and returned to the home page. You can sign back in anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await signOut();
                  setLogoutOpen(false);
                  navigate("/", { replace: true });
                }}
                className="rounded-full bg-[#F04A3F] hover:bg-[#d93f36] text-white"
              >
                Yes, log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
