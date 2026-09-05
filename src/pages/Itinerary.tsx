import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, DollarSign, ArrowLeft, Loader2, Sparkles, Send, Search,
  Download, Cloud, CloudRain, Sun, Snowflake, Filter as FilterIcon,
  Trash2, Pencil, RotateCw, GripVertical, Share2, FileDown, Calendar as CalIcon,
  Map as MapIcon, Plane, Hotel, Utensils, TrainFront, ShieldCheck, Phone,
  Umbrella, Wallet, Package, ChevronDown, ChevronUp, Plus, MessageSquare,
  StickyNote, Folder, Maximize2, Wifi, WifiOff, Printer, CheckCircle2, XCircle,
  Undo2, History,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildGoogleMapsRoute, buildAppleMapsRoute, buildICS, buildMarkdown, downloadBlob,
} from "@/lib/itineraryExports";
import { exportBeforeTripPDF } from "@/lib/exportPDF";
import DayRouteMap from "@/components/itinerary/DayRouteMap";
import DayCostBreakdown, { deriveBreakdown, type CostBreakdown } from "@/components/itinerary/DayCostBreakdown";
import BookingChecklist, { type Reservation } from "@/components/itinerary/BookingChecklist";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


interface Activity {
  id: string;
  time?: string;
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  duration?: string;
  cost?: number;
  type?: string;
}

interface DayData {
  day: number;
  date?: string;
  theme?: string;
  weather?: { condition?: string; temp?: string };
  activities: Activity[];
  dailyBudget?: number;
  costBreakdown?: Partial<CostBreakdown> | null;
  reservations?: Reservation[];
}

interface RegenEntry {
  id: string;
  day: number;
  at: string;
  budgetCap: number | null;
  crowdLevel: string;
  focus: string;
  note: string;
  prevStops: string[];
  newStops: string[];
  cost: number;
  prevCost?: number;
  breakdown?: CostBreakdown;
  prevBreakdown?: CostBreakdown;
}


const weatherIcons: Record<string, any> = {
  sunny: Sun, clear: Sun, rainy: CloudRain, rain: CloudRain, cloudy: Cloud, snow: Snowflake,
};

type ChatMsg = { role: "user" | "ai"; text: string };

const TripWorkspace = () => {
  const [params] = useSearchParams();
  const tripId = params.get("id");
  const { user, isLoading: authLoading } = useAuth();
  const { trips, loading, updateTrip } = useTrips();

  const [activeDay, setActiveDay] = useState(1);
  const [tab, setTab] = useState<"itinerary" | "chat" | "notes" | "files">("itinerary");
  const [filters, setFilters] = useState({ attractions: true, hotels: true, restaurants: true, transport: true });
  const [placeQuery, setPlaceQuery] = useState("");
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm your trip co-pilot. Ask me to swap places, regenerate a day, or find nearby spots." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ time: string; title: string }>({ time: "", title: "" });
  const [dragId, setDragId] = useState<string | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenPrefs, setRegenPrefs] = useState<{ budgetCap: string; crowdLevel: string; focus: string; note: string }>({
    budgetCap: "", crowdLevel: "any", focus: "any", note: "",
  });
  const [previewDay, setPreviewDay] = useState<DayData | null>(null);
  const [undoSnapshots, setUndoSnapshots] = useState<Record<number, DayData>>({});
  const [regenHistory, setRegenHistory] = useState<RegenEntry[]>([]);
  const [bookedReservations, setBookedReservations] = useState<Record<string, boolean>>({});
  const [historyOpen, setHistoryOpen] = useState(false);

  const [newTitles, setNewTitles] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const trip = useMemo(() => {
    if (!trips.length) return null;
    if (tripId) return trips.find((t) => t.id === tripId) || null;
    return trips.find((t) => t.status === "active") || trips.find((t) => t.status === "planned") || trips[0];
  }, [trips, tripId]);

  const initialDays: DayData[] = useMemo(() => {
    const raw = (trip?.itinerary_data as any)?.days || (trip?.itinerary_data as any)?.itinerary || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((d: any, i: number) => ({
      day: d.day ?? i + 1,
      date: d.date,
      theme: d.theme,
      weather: d.weather,
      dailyBudget: d.dailyBudget,
      costBreakdown: d.costBreakdown ?? null,
      reservations: Array.isArray(d.reservations) ? d.reservations : [],
      activities: (d.activities || d.items || []).map((a: any, j: number) => ({
        id: a.id || `${i}-${j}-${a.title || a.name || "act"}`,
        time: a.time,
        title: a.title || a.name,
        description: a.description,
        location: a.location,
        address: a.address,
        duration: a.duration,
        cost: typeof a.cost === "number" ? a.cost : typeof a.price === "number" ? a.price : 0,
        type: (a.type || a.category || "attraction").toLowerCase(),
      })),
    }));
  }, [trip]);

  const [days, setDays] = useState<DayData[]>([]);
  useEffect(() => { setDays(initialDays); }, [initialDays]);

  useEffect(() => {
    const itineraryData = (trip?.itinerary_data as any) || {};
    const hist = itineraryData.regenHistory;
    if (Array.isArray(hist)) setRegenHistory(hist as RegenEntry[]);
    setBookedReservations(
      itineraryData.bookedReservations && typeof itineraryData.bookedReservations === "object"
        ? itineraryData.bookedReservations
        : {},
    );
  }, [trip?.id]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!trip) return <Navigate to="/dashboard" replace />;

  const currentDay = days.find((d) => d.day === activeDay) || days[0];
  const totalSpent = days.flatMap((d) => d.activities).reduce((s, a) => s + (a.cost || 0), 0);
  const totalBudget = Number(trip.budget) || 0;
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const budgetPct = totalBudget ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const currency = trip.currency || "₹";
  const WIcon = weatherIcons[(currentDay?.weather?.condition || "sunny").toLowerCase()] || Sun;

  const typeMatchesFilter = (t?: string) => {
    const tt = (t || "").toLowerCase();
    if (tt.includes("hotel") || tt.includes("stay")) return filters.hotels;
    if (tt.includes("food") || tt.includes("restaurant") || tt.includes("meal") || tt.includes("lunch") || tt.includes("dinner") || tt.includes("breakfast")) return filters.restaurants;
    if (tt.includes("transit") || tt.includes("transport") || tt.includes("metro") || tt.includes("train")) return filters.transport;
    return filters.attractions;
  };

  const visibleStops = (currentDay?.activities || []).filter((a) => typeMatchesFilter(a.type));

  const persistDays = async (
    next: DayData[],
    history: RegenEntry[] = regenHistory,
    booked: Record<string, boolean> = bookedReservations,
  ) => {
    setDays(next);
    if (!trip) return;
    const data: any = {
      ...(trip.itinerary_data as any || {}),
      days: next,
      regenHistory: history,
      bookedReservations: booked,
    };
    await updateTrip(trip.id, { itinerary_data: data });
  };

  const toggleBookedReservation = (key: string, value: boolean) => {
    const nextBooked = { ...bookedReservations, [key]: value };
    setBookedReservations(nextBooked);
    void persistDays(days, regenHistory, nextBooked);
  };


  const deleteActivity = (dayNum: number, id: string) => {
    const next = days.map((d) => d.day === dayNum ? { ...d, activities: d.activities.filter((a) => a.id !== id) } : d);
    persistDays(next);
    toast.success("Removed");
  };

  const commitEdit = (dayNum: number, id: string) => {
    const next = days.map((d) => d.day === dayNum
      ? { ...d, activities: d.activities.map((a) => a.id === id ? { ...a, time: editDraft.time, title: editDraft.title } : a) }
      : d);
    persistDays(next);
    setEditingId(null);
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDrop = (dayNum: number, targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = days.map((d) => {
      if (d.day !== dayNum) return d;
      const arr = [...d.activities];
      const from = arr.findIndex((a) => a.id === dragId);
      const to = arr.findIndex((a) => a.id === targetId);
      if (from < 0 || to < 0) return d;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...d, activities: arr };
    });
    persistDays(next);
    setDragId(null);
  };

  const sendChat = () => {
    const q = chatInput.trim();
    if (!q) return;
    setChatMsgs((m) => [...m, { role: "user", text: q }]);
    setChatInput("");
    setTimeout(() => {
      setChatMsgs((m) => [...m, { role: "ai", text: `Got it — I'll consider "${q}" for ${trip.destination}. (Live AI wiring next.)` }]);
    }, 700);
  };

  const regenerateDay = async (dayNum: number) => {
    const target = days.find((d) => d.day === dayNum);
    if (!target || regeneratingDay) return;
    setRegeneratingDay(dayNum);
    const toastId = toast.loading(`Regenerating Day ${dayNum}…`, { description: "AI is drafting fresh stops." });
    try {
      const { data, error } = await supabase.functions.invoke("regenerate-day", {
        body: {
          destination: trip.destination,
          dayNumber: dayNum,
          date: target.date,
          theme: target.theme,
          currentActivities: target.activities.map((a) => ({ time: a.time, title: a.title, type: a.type })),
          otherDayTitles: days.filter((d) => d.day !== dayNum).flatMap((d) => d.activities.map((a) => a.title).filter(Boolean)),
          interests: trip.interests || [],
          styles: trip.styles || [],
           travelVibe: (trip.itinerary_data as any)?.travelVibe || undefined,
          groupSize: trip.group_size || 1,
          dailyBudget: target.dailyBudget,
          currency: trip.currency || "USD",
          constraints: {
            budgetCap: regenPrefs.budgetCap ? Number(regenPrefs.budgetCap) : null,
            crowdLevel: regenPrefs.crowdLevel,
            focus: regenPrefs.focus,
            note: regenPrefs.note.trim(),
          },
        },
      });

      const errMsg = (error as any)?.message || (data as any)?.error;
      if (errMsg || !(data as any)?.day) throw new Error(errMsg || "Could not regenerate this day");

      const fresh: any = (data as any).day;
      const newDay: DayData = {
        day: dayNum,
        date: fresh.date || target.date,
        theme: fresh.theme || target.theme,
        weather: target.weather,
        dailyBudget: typeof fresh.dailyBudget === "number" ? fresh.dailyBudget : target.dailyBudget,
        costBreakdown: fresh.costBreakdown ?? null,
        reservations: Array.isArray(fresh.reservations) ? fresh.reservations : [],
        activities: (fresh.activities || []).map((a: any, j: number) => ({
          id: `${dayNum}-r${Date.now()}-${j}`,
          time: a.time,
          title: a.title || a.name,
          description: a.description,
          location: a.location,
          address: a.address,
          duration: a.duration,
          cost: typeof a.cost === "number" ? a.cost : 0,
          type: (a.type || "attraction").toLowerCase(),
        })),
      };

      setPreviewDay(newDay);
      toast.success(`Draft ready for Day ${dayNum}`, { id: toastId, description: `${newDay.activities.length} fresh stops — review and confirm.` });
    } catch (e) {
      toast.error("Regeneration failed", { id: toastId, description: e instanceof Error ? e.message : "Please try again." });
    } finally {
      setRegeneratingDay(null);
    }
  };

  const confirmRegeneration = async () => {
    if (!previewDay) return;
    const dayNum = previewDay.day;
    const prev = days.find((d) => d.day === dayNum);
    if (prev) setUndoSnapshots((s) => ({ ...s, [dayNum]: prev }));

    const prevBreakdown = prev
      ? deriveBreakdown(prev.activities, prev.costBreakdown)
      : deriveBreakdown([], null);
    const breakdown = deriveBreakdown(previewDay.activities, previewDay.costBreakdown);

    const entry: RegenEntry = {
      id: `${dayNum}-${Date.now()}`,
      day: dayNum,
      at: new Date().toISOString(),
      budgetCap: regenPrefs.budgetCap ? Number(regenPrefs.budgetCap) : null,
      crowdLevel: regenPrefs.crowdLevel,
      focus: regenPrefs.focus,
      note: regenPrefs.note.trim(),
      prevStops: (prev?.activities || []).map((a) => a.title || "").filter(Boolean),
      newStops: previewDay.activities.map((a) => a.title || "").filter(Boolean),
      cost: breakdown.total,
      prevCost: prevBreakdown.total,
      breakdown,
      prevBreakdown,
    };
    const nextHistory = [entry, ...regenHistory].slice(0, 30);
    setRegenHistory(nextHistory);

    await persistDays(days.map((d) => (d.day === dayNum ? previewDay : d)), nextHistory);
    setNewTitles(previewDay.activities.map((a) => a.title || "").filter(Boolean));
    setPreviewDay(null);
    setRegenOpen(false);
    setActiveDay(dayNum);
    toast.success(`Day ${dayNum} updated`, {
      description: "New stops highlighted — you can undo this.",
      action: { label: "Undo", onClick: () => undoRegeneration(dayNum) },
    });
  };

  const undoRegeneration = async (dayNum: number) => {
    const snap = undoSnapshots[dayNum];
    if (!snap) return;
    setUndoSnapshots((s) => {
      const n = { ...s };
      delete n[dayNum];
      return n;
    });
    const nextHistory = regenHistory.filter((h, i) => !(h.day === dayNum && i === regenHistory.findIndex((x) => x.day === dayNum)));
    setRegenHistory(nextHistory);
    setNewTitles([]);
    await persistDays(days.map((d) => (d.day === dayNum ? snap : d)), nextHistory);
    setActiveDay(dayNum);
    toast.success(`Day ${dayNum} restored`, { description: "Your previous itinerary is back." });
  };


  const discardRegeneration = () => {
    setPreviewDay(null);
    toast("Draft discarded", { description: "Your original day is unchanged." });
  };

  const openRegenModal = () => {
    setPreviewDay(null);
    setRegenOpen(true);
  };


  const handleExport = async (kind: "gmaps" | "apple" | "ics" | "md" | "pdf" | "print") => {
    const dayExport = days.map((d) => ({
      day: d.day, date: d.date, theme: d.theme,
      activities: d.activities.map((a) => ({
        time: a.time, title: a.title, name: a.title, location: a.location,
        address: a.address, description: a.description, duration: a.duration,
      })),
    }));
    const allActs = dayExport.flatMap((d) => d.activities);
    if (kind === "gmaps") { const u = buildGoogleMapsRoute(allActs); u ? window.open(u, "_blank") : toast.error("No stops"); }
    else if (kind === "apple") { const u = buildAppleMapsRoute(allActs); u ? window.open(u, "_blank") : toast.error("No stops"); }
    else if (kind === "ics") { downloadBlob(`${trip.destination}.ics`, "text/calendar", buildICS(trip.title || trip.destination, dayExport)); toast.success("Calendar downloaded"); }
    else if (kind === "md") { downloadBlob(`${trip.destination}.md`, "text/markdown", buildMarkdown(trip.title || trip.destination, trip.destination, dayExport)); toast.success("Markdown downloaded"); }
    else if (kind === "pdf") {
      try {
        const data: any = trip.itinerary_data || {};
        exportBeforeTripPDF({
          title: data.title || trip.title || trip.destination,
          summary: data.summary || "",
          totalBudgetEstimate: data.totalBudgetEstimate,
          currency: data.currency || trip.currency,
          beforeTrip: data.beforeTrip,
          days: data.days || days,
          warnings: data.warnings,
        });
      } catch { toast.error("PDF export failed"); }
    } else if (kind === "print") window.print();
  };

  const shareTrip = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); toast.success("Trip link copied"); }
    catch { toast.error("Couldn't copy link"); }
  };

  const beforeTrip: any = (trip.itinerary_data as any)?.beforeTrip || {};
  const packingList: string[] = beforeTrip?.packingList?.slice(0, 6) || ["Passport", "Universal adapter", "Comfortable shoes", "Rain jacket", "Power bank", "Prescriptions"];
  const emergency = beforeTrip?.emergencyNumbers || { police: "110", ambulance: "119", tourist: "050-3816-2787" };
  const visaStatus = beforeTrip?.visa?.status || "eVisa required · 5–7 days";
  const dayHistory = currentDay ? regenHistory.filter((h) => h.day === currentDay.day) : [];
  const currentBreakdown = currentDay ? deriveBreakdown(currentDay.activities, currentDay.costBreakdown) : null;
  const previousBreakdown = dayHistory[0]?.prevBreakdown || null;
  const varianceTrail = dayHistory
    .slice(1)
    .reverse()
    .map((h, i) => ({ label: `Regeneration ${i + 1}`, total: h.breakdown?.total ?? h.cost }));

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Top bar */}
      <div className="px-4 lg:px-6 pt-4 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-sm hover:shadow transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-display font-bold text-foreground truncate">{trip.destination}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <WIcon className="w-3.5 h-3.5 text-amber-500" />
              {currentDay?.weather?.temp || "23°C"} · {currentDay?.weather?.condition || "Clear"}
              <span className="mx-1">·</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live planning</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full bg-white" onClick={() => setOfflineMode((v) => !v)}>
            {offlineMode ? <WifiOff className="w-3.5 h-3.5 mr-1.5" /> : <Wifi className="w-3.5 h-3.5 mr-1.5" />}
            {offlineMode ? "Offline" : "Online"}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full bg-white" onClick={shareTrip}>
            <Share2 className="w-3.5 h-3.5 mr-1.5" />Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                <Download className="w-3.5 h-3.5 mr-1.5" />Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleExport("pdf")}><FileDown className="w-4 h-4 mr-2" />Download PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("ics")}><CalIcon className="w-4 h-4 mr-2" />Google Calendar (.ics)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("ics")}><CalIcon className="w-4 h-4 mr-2" />Apple Calendar (.ics)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}><FileDown className="w-4 h-4 mr-2" />Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("gmaps")}><MapIcon className="w-4 h-4 mr-2" />Open route in Maps</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("print")}><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 3-column workspace */}
      <div className="px-4 lg:px-6 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-4 h-[calc(100vh-120px)]">
        {/* LEFT — Map */}
        <section className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-black/5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={placeQuery} onChange={(e) => setPlaceQuery(e.target.value)} placeholder="Search places" className="pl-9 rounded-full bg-[#F5F5F7] border-transparent h-9" />
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-9 w-9 shrink-0"><FilterIcon className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: "attractions", label: "Attractions", icon: Sparkles, color: "bg-violet-500" },
                { key: "hotels", label: "Hotels", icon: Hotel, color: "bg-sky-500" },
                { key: "restaurants", label: "Restaurants", icon: Utensils, color: "bg-orange-500" },
                { key: "transport", label: "Transport", icon: TrainFront, color: "bg-emerald-500" },
              ].map(({ key, label, icon: Icon, color }) => (
                <label key={key} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[.03] cursor-pointer">
                  <span className={`${color} w-6 h-6 rounded-md flex items-center justify-center text-white`}><Icon className="w-3.5 h-3.5" /></span>
                  <span className="flex-1 font-medium text-foreground">{label}</span>
                  <Checkbox checked={filters[key as keyof typeof filters]} onCheckedChange={(v) => setFilters((f) => ({ ...f, [key]: !!v }))} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex-1 relative min-h-[400px]">
            {visibleStops.length > 0 ? (
              <DayRouteMap
                destination={trip.destination}
                stops={visibleStops.map((a) => ({ title: a.title, location: a.location, address: a.address, time: a.time }))}
                highlightTitles={newTitles}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No stops for this day</div>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium shadow-sm border border-black/5 inline-flex items-center gap-2">
                <MapIcon className="w-3.5 h-3.5" /> Route Overview · Day {activeDay}
              </div>
            </div>
          </div>
        </section>

        {/* CENTER — Workspace */}
        <section className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-black/5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">{trip.title || `${trip.destination} Trip`} · {days.length} Days</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live planning
                </p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full h-8 w-8"><Maximize2 className="w-4 h-4" /></Button>
            </div>
            <div className="inline-flex bg-[#F5F5F7] rounded-full p-1 text-xs">
              {[
                { k: "itinerary", label: "Itinerary", icon: CalIcon },
                { k: "chat", label: "Chat", icon: MessageSquare },
                { k: "notes", label: "Notes", icon: StickyNote },
                { k: "files", label: "Files", icon: Folder },
              ].map(({ k, label, icon: Icon }) => (
                <button
                  key={k}
                  onClick={() => setTab(k as any)}
                  className={`px-4 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 transition ${tab === k ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "itinerary" && (
              <div className="p-4 space-y-3">
                {/* Day tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setActiveDay(d.day)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${activeDay === d.day ? "bg-foreground text-background" : "bg-[#F5F5F7] text-muted-foreground hover:text-foreground"}`}
                    >
                      Day {d.day}{d.theme ? ` · ${d.theme}` : ""}
                    </button>
                  ))}
                </div>

                {currentDay && (
                  <div className="rounded-2xl border border-black/5 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-black/5">
                      <div>
                        <p className="font-display font-semibold text-foreground">Day {currentDay.day}{currentDay.theme ? ` — ${currentDay.theme}` : ""}</p>
                        <p className="text-xs text-muted-foreground">{currentDay.activities.length} stops · {currency} {currentDay.dailyBudget ?? currentDay.activities.reduce((s, a) => s + (a.cost || 0), 0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const dayHistory = regenHistory.filter((h) => h.day === currentDay.day);
                          return dayHistory.length > 0 ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-full text-xs"
                              onClick={() => setHistoryOpen((o) => !o)}
                            >
                              <History className="w-3.5 h-3.5 mr-1.5" />
                              History ({dayHistory.length})
                              {historyOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                            </Button>
                          ) : null;
                        })()}
                        {undoSnapshots[currentDay.day] && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                            onClick={() => undoRegeneration(currentDay.day)}
                          >
                            <Undo2 className="w-3.5 h-3.5 mr-1.5" />Undo regenerate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={regeneratingDay !== null}
                          onClick={openRegenModal}
                        >
                          {regeneratingDay === currentDay.day ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Regenerating…</>
                          ) : (
                            <><RotateCw className="w-3.5 h-3.5 mr-1.5" />Regenerate Day</>
                          )}
                        </Button>
                      </div>
                    </div>

                     {currentBreakdown && (
                       <DayCostBreakdown
                         breakdown={currentBreakdown}
                         previous={previousBreakdown}
                         currency={currency}
                         trail={varianceTrail}
                       />
                     )}
                     <BookingChecklist
                       dayNum={currentDay.day}
                       date={currentDay.date}
                       reservations={currentDay.reservations || []}
                       booked={bookedReservations}
                       onToggle={toggleBookedReservation}
                     />

                    <AnimatePresence initial={false}>
                      {historyOpen && regenHistory.some((h) => h.day === currentDay.day) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden border-b border-black/5 bg-white"
                        >
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Constraints used for Day {currentDay.day}
                            </p>
                            {regenHistory.filter((h) => h.day === currentDay.day).map((h, idx) => (
                              <div key={h.id} className="rounded-xl border border-black/5 bg-[#FAFAFA] px-3 py-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-foreground">
                                    {idx === 0 ? "Latest" : `Regeneration #${regenHistory.filter((x) => x.day === currentDay.day).length - idx}`}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {new Date(h.at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <Badge variant="secondary" className="text-[10px] rounded-full">
                                    Budget cap: {h.budgetCap ? `${currency} ${h.budgetCap}` : "none"}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] rounded-full capitalize">
                                    Crowd: {h.crowdLevel || "any"}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] rounded-full capitalize">
                                    Focus: {h.focus || "any"}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] rounded-full">
                                    Result: {currency} {h.cost} · {h.newStops.length} stops
                                  </Badge>
                                </div>
                                {h.note && (
                                  <p className="text-[11px] text-muted-foreground mt-2 italic">“{h.note}”</p>
                                )}
                                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                                  <span className="font-medium text-foreground/70">Replaced:</span> {h.prevStops.join(", ") || "—"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>


                    <ul className="divide-y divide-black/5">
                      {currentDay.activities.map((a) => {
                        const isNew = newTitles.some((t) => t.toLowerCase().trim() === (a.title || "").toLowerCase().trim());
                        return (
                        <motion.li
                          key={a.id}
                          initial={isNew ? { opacity: 0, y: 8 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                          draggable
                          onDragStart={() => onDragStart(a.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(currentDay.day, a.id)}
                          className={`group flex items-start gap-3 px-4 py-3 transition ${isNew ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-[#FAFAFA]"}`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-1.5 cursor-grab opacity-0 group-hover:opacity-100 transition" />
                          <div className="w-14 shrink-0 text-xs font-semibold text-muted-foreground pt-1">
                            {editingId === a.id ? (
                              <Input value={editDraft.time} onChange={(e) => setEditDraft((d) => ({ ...d, time: e.target.value }))} className="h-7 text-xs px-2" />
                            ) : (a.time || "—")}
                          </div>
                          <div className="relative flex flex-col items-center pt-2">
                            <span className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow ${isNew ? "bg-amber-500" : "bg-violet-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            {editingId === a.id ? (
                              <div className="flex gap-2">
                                <Input value={editDraft.title} onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))} className="h-8 text-sm" />
                                <Button size="icon" className="h-8 w-8" onClick={() => commitEdit(currentDay.day, a.id)}><CheckCircle2 className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingId(null)}><XCircle className="w-4 h-4" /></Button>
                              </div>
                            ) : (
                              <>
                                <p className="font-medium text-sm text-foreground truncate flex items-center gap-2">
                                  <span className="truncate">{a.title}</span>
                                  {isNew && <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] px-1.5 py-0 shrink-0">New</Badge>}
                                </p>
                                {a.location && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</p>}
                              </>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(a.id); setEditDraft({ time: a.time || "", title: a.title || "" }); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:text-rose-600" onClick={() => deleteActivity(currentDay.day, a.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.li>
                        );
                      })}
                      {currentDay.activities.length === 0 && (
                        <li className="px-4 py-6 text-center text-sm text-muted-foreground">No activities yet for this day.</li>
                      )}
                    </ul>

                    <div className="px-4 py-3 border-t border-black/5 bg-[#FAFAFA]">
                      <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground w-full justify-start">
                        <Plus className="w-4 h-4 mr-1.5" />Add activity
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "chat" && (
              <div className="p-4 space-y-3">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-foreground text-background rounded-br-sm" : "bg-[#F5F5F7] text-foreground rounded-bl-sm"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {tab === "notes" && (
              <div className="p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot ideas, reminders, restaurant picks…"
                  className="w-full h-[400px] rounded-2xl bg-[#FAFAFA] border border-black/5 p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
                />
              </div>
            )}

            {tab === "files" && (
              <div className="p-4">
                <div className="border-2 border-dashed border-black/10 rounded-2xl p-10 text-center text-sm text-muted-foreground">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-60" />
                  Drop tickets, passes, or PDFs here.
                </div>
              </div>
            )}
          </div>

          {/* AI Input */}
          <div className="border-t border-black/5 p-3 bg-white">
            <div className="flex items-center gap-2 bg-[#F5F5F7] rounded-full pl-3 pr-1.5 py-1.5">
              <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask AI: replace Tokyo Tower with something less crowded…"
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              />
              <Button size="icon" className="rounded-full h-8 w-8 bg-foreground text-background hover:bg-foreground/90" onClick={sendChat}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* RIGHT — Smart Assistant */}
        <section className="overflow-y-auto space-y-4 pr-1">
          {/* Trip Overview */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground">Trip Overview</h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { icon: Wallet, color: "bg-violet-100 text-violet-600", label: "Total Budget", value: `${currency}${totalBudget || "—"}` },
                { icon: DollarSign, color: "bg-emerald-100 text-emerald-600", label: "Spent", value: `${currency}${totalSpent}` },
                { icon: DollarSign, color: "bg-orange-100 text-orange-600", label: "Remaining", value: `${currency}${remaining}`, highlight: true },
                { icon: Clock, color: "bg-sky-100 text-sky-600", label: "Duration", value: `${days.length} Days` },
                { icon: Sun, color: "bg-emerald-100 text-emerald-600", label: "Best Time", value: "Mar–May" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`${row.color} w-8 h-8 rounded-lg flex items-center justify-center`}><row.icon className="w-4 h-4" /></span>
                    <span className="text-muted-foreground">{row.label}</span>
                  </div>
                  <span className={`font-semibold ${row.highlight ? "text-orange-500" : "text-foreground"}`}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Progress value={budgetPct} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{Math.round(budgetPct)}% of budget used</p>
            </div>
          </div>

          {/* AI Suggestion */}
          {!suggestionDismissed && (
            <motion.div layout className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl p-4 text-white shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <Umbrella className="w-4 h-4 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Rain expected tomorrow</p>
                  <p className="opacity-90 text-xs mt-0.5">Move outdoor activities from Day 2 to Day 3?</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="rounded-full bg-white text-violet-600 hover:bg-white/90 h-8" onClick={() => { toast.success("Applied AI suggestion"); setSuggestionDismissed(true); }}>Accept</Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/10 h-8" onClick={() => setSuggestionDismissed(true)}>Dismiss</Button>
              </div>
            </motion.div>
          )}

          {/* Weather */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-bold text-foreground">{trip.destination.split(",")[0]}</h3>
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <WIcon className="w-10 h-10 text-amber-500" />
              <div>
                <p className="text-3xl font-display font-bold text-foreground leading-none">{currentDay?.weather?.temp || "23°C"}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentDay?.weather?.condition || "Clear Sky"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div><p className="text-[10px] text-muted-foreground">Humidity</p><p className="text-sm font-semibold text-foreground">48%</p></div>
              <div><p className="text-[10px] text-muted-foreground">Wind</p><p className="text-sm font-semibold text-foreground">8 km/h</p></div>
              <div><p className="text-[10px] text-muted-foreground">Feels</p><p className="text-sm font-semibold text-foreground">21°C</p></div>
            </div>
          </div>

          {/* Transport */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrainFront className="w-4 h-4 text-sky-500" />
              <h3 className="font-display font-bold text-foreground text-sm">Next Train</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-display font-bold text-foreground leading-none">10:35 AM</p>
                <p className="text-xs text-muted-foreground mt-1">Platform 3 · 8 mins away</p>
              </div>
              <Badge className="bg-sky-500/10 text-sky-600 border-0">On time</Badge>
            </div>
          </div>

          {/* Essentials */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-4 space-y-3">
            <h3 className="font-display font-bold text-foreground text-sm">Essentials</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-[#FAFAFA] p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="w-3.5 h-3.5" />Visa</div>
                <p className="font-medium text-foreground mt-1 text-xs">{visaStatus}</p>
              </div>
              <div className="rounded-xl bg-[#FAFAFA] p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="w-3.5 h-3.5" />Currency</div>
                <p className="font-medium text-foreground mt-1 text-xs">1 USD ≈ 149 ¥</p>
              </div>
              <div className="rounded-xl bg-[#FAFAFA] p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground"><Plane className="w-3.5 h-3.5" />Flight</div>
                <p className="font-medium text-foreground mt-1 text-xs">AI-873 · 06:20</p>
              </div>
              <div className="rounded-xl bg-[#FAFAFA] p-2.5">
                <div className="flex items-center gap-1.5 text-muted-foreground"><Hotel className="w-3.5 h-3.5" />Hotel</div>
                <p className="font-medium text-foreground mt-1 text-xs">Shibuya Stay</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><Package className="w-3.5 h-3.5" />Packing list</div>
              <div className="flex flex-wrap gap-1.5">
                {packingList.map((p, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full text-[10px] font-normal">{p}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><Phone className="w-3.5 h-3.5" />Emergency</div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <Badge variant="outline">Police {emergency.police}</Badge>
                <Badge variant="outline">Ambulance {emergency.ambulance}</Badge>
                <Badge variant="outline">Tourist {emergency.tourist}</Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-4">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Hotel, label: "Book Hotel", color: "bg-sky-100 text-sky-600" },
                { icon: Plane, label: "Book Flight", color: "bg-violet-100 text-violet-600" },
                { icon: MapPin, label: "Add Place", color: "bg-emerald-100 text-emerald-600" },
                { icon: FileDown, label: "PDF", color: "bg-orange-100 text-orange-600" },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => a.label === "PDF" ? handleExport("pdf") : toast.info(`${a.label} coming soon`)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#FAFAFA] transition"
                >
                  <span className={`${a.color} w-9 h-9 rounded-xl flex items-center justify-center`}><a.icon className="w-4 h-4" /></span>
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Dialog open={regenOpen} onOpenChange={(o) => { setRegenOpen(o); if (!o) setPreviewDay(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Regenerate Day {currentDay?.day}</DialogTitle>
            <DialogDescription>
              Set your preferences, preview the AI's draft, then confirm before anything changes.
            </DialogDescription>
          </DialogHeader>

          {!previewDay ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Budget cap ({currency})</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 120"
                    value={regenPrefs.budgetCap}
                    onChange={(e) => setRegenPrefs((p) => ({ ...p, budgetCap: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Crowd level</Label>
                  <div className="flex gap-1.5">
                    {[
                      { id: "any", label: "Any" },
                      { id: "quiet", label: "Quiet" },
                      { id: "balanced", label: "Balanced" },
                      { id: "lively", label: "Lively" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setRegenPrefs((p) => ({ ...p, crowdLevel: o.id }))}
                        className={`flex-1 text-xs py-2 rounded-lg border transition ${
                          regenPrefs.crowdLevel === o.id
                            ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                            : "border-black/10 text-muted-foreground hover:bg-black/[.03]"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Focus</Label>
                <div className="flex gap-1.5">
                  {[
                    { id: "any", label: "Mixed" },
                    { id: "outdoor", label: "Outdoor" },
                    { id: "indoor", label: "Indoor" },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setRegenPrefs((p) => ({ ...p, focus: o.id }))}
                      className={`flex-1 text-xs py-2 rounded-lg border transition ${
                        regenPrefs.focus === o.id
                          ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                          : "border-black/10 text-muted-foreground hover:bg-black/[.03]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Anything else? (optional)</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. keep the morning free, more local food, avoid long walks"
                  value={regenPrefs.note}
                  onChange={(e) => setRegenPrefs((p) => ({ ...p, note: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              <div className="rounded-xl border border-black/10 overflow-hidden">
                <div className="px-3 py-2 bg-[#FAFAFA] text-xs font-semibold text-muted-foreground border-b border-black/5">
                  Current day
                </div>
                <ul className="divide-y divide-black/5">
                  {(days.find((d) => d.day === previewDay.day)?.activities || []).map((a) => (
                    <li key={a.id} className="px-3 py-2 text-xs">
                      <span className="text-muted-foreground mr-1.5">{a.time || "—"}</span>
                      <span className="line-through decoration-rose-400/70">{a.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-300 overflow-hidden">
                <div className="px-3 py-2 bg-amber-50 text-xs font-semibold text-amber-700 border-b border-amber-200 flex items-center justify-between">
                  <span>New draft{previewDay.theme ? ` — ${previewDay.theme}` : ""}</span>
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px]">
                    {currency} {previewDay.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                  </Badge>
                </div>
                <ul className="divide-y divide-black/5">
                  {previewDay.activities.map((a) => (
                    <li key={a.id} className="px-3 py-2 text-xs">
                      <span className="text-muted-foreground mr-1.5">{a.time || "—"}</span>
                      <span className="font-medium text-foreground">{a.title}</span>
                      {a.location && <span className="block text-muted-foreground">{a.location}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {!previewDay ? (
              <>
                <Button variant="outline" className="rounded-full" onClick={() => setRegenOpen(false)}>Cancel</Button>
                <Button
                  className="rounded-full"
                  disabled={regeneratingDay !== null || !currentDay}
                  onClick={() => currentDay && regenerateDay(currentDay.day)}
                >
                  {regeneratingDay !== null ? (
                    <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Drafting…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1.5" />Preview new day</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="rounded-full" onClick={discardRegeneration}>Discard</Button>
                <Button className="rounded-full" onClick={confirmRegeneration}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />Confirm & replace
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripWorkspace;
