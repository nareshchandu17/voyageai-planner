import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, X, Navigation2, Radio } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export type FriendStop = {
  name: string;
  time: string;
  note?: string;
  lat?: number;
  lng?: number;
};
export type Friend = {
  id: string;
  name: string;
  place: string;
  country: string;
  lat: number;
  lng: number;
  color: string;
  history: FriendStop[];
  /** Upcoming stops the friend is progressing toward (drives live movement). */
  route?: { name: string; lat: number; lng: number; note?: string }[];
};

const INITIAL_FRIENDS: Friend[] = [
  {
    id: "shelly",
    name: "Shelly A.",
    place: "Kyoto",
    country: "Japan",
    lat: 35.0116,
    lng: 135.7681,
    color: "#F97438",
    history: [
      { name: "Fushimi Inari Shrine", time: "2h ago", note: "Sunset shots at the torii gates", lat: 34.9671, lng: 135.7727 },
      { name: "Nishiki Market", time: "6h ago", note: "Street food crawl", lat: 35.0050, lng: 135.7649 },
      { name: "Gion District", time: "Yesterday", note: "Spotted a geiko!", lat: 35.0037, lng: 135.7788 },
    ],
    route: [
      { name: "Kinkaku-ji (Golden Pavilion)", lat: 35.0394, lng: 135.7292, note: "Golden hour arrival" },
      { name: "Arashiyama Bamboo Grove", lat: 35.0170, lng: 135.6710, note: "Sunrise walk" },
    ],
  },
  {
    id: "edgar",
    name: "Edgar P.",
    place: "Buenos Aires",
    country: "Argentina",
    lat: -34.6037,
    lng: -58.3816,
    color: "#0EA5E9",
    history: [
      { name: "La Boca", time: "1h ago", note: "Tango in the streets", lat: -34.6345, lng: -58.3631 },
      { name: "Recoleta Cemetery", time: "Yesterday", lat: -34.5875, lng: -58.3928 },
      { name: "Palermo Soho", time: "2 days ago", note: "Best steak dinner", lat: -34.5883, lng: -58.4306 },
    ],
    route: [
      { name: "Teatro Colón", lat: -34.6010, lng: -58.3830, note: "Evening opera" },
      { name: "Puerto Madero", lat: -34.6118, lng: -58.3628, note: "Riverside dinner" },
    ],
  },
  {
    id: "mira",
    name: "Mira T.",
    place: "Nairobi",
    country: "Kenya",
    lat: -1.2921,
    lng: 36.8219,
    color: "#10B981",
    history: [
      { name: "Nairobi National Park", time: "3h ago", note: "Saw 4 rhinos", lat: -1.3733, lng: 36.8583 },
      { name: "Karen Blixen Museum", time: "Yesterday", lat: -1.3521, lng: 36.7115 },
    ],
    route: [
      { name: "Giraffe Centre", lat: -1.3746, lng: 36.7457, note: "Feeding time" },
      { name: "Kazuri Beads", lat: -1.3706, lng: 36.7290 },
    ],
  },
  {
    id: "leo",
    name: "Leo K.",
    place: "Lisbon",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    color: "#F59E0B",
    history: [
      { name: "Belém Tower", time: "30m ago", lat: 38.6916, lng: -9.2160 },
      { name: "Time Out Market", time: "5h ago", note: "Pastel de nata #4", lat: 38.7071, lng: -9.1459 },
    ],
    route: [
      { name: "Alfama viewpoint", lat: 38.7118, lng: -9.1305, note: "Fado at dusk" },
      { name: "LX Factory", lat: 38.7036, lng: -9.1786 },
    ],
  },
];

// Simple equirectangular projection for a decorative world dot-grid
const project = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

const formatRelative = (ts: number) => {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function FriendsLocationMap({ onExpand }: { onExpand?: () => void }) {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [selected, setSelected] = useState<Friend | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [lastPing, setLastPing] = useState<Record<string, number>>(() =>
    Object.fromEntries(INITIAL_FRIENDS.map((f) => [f.id, Date.now() - Math.floor(Math.random() * 60_000)])),
  );
  const leafletRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Record<string, any>>({});
  const tickRef = useRef(0);

  // Simulated real-time presence: interpolate each friend toward their next planned stop.
  // In production, swap this interval for a Supabase Realtime channel subscription.
  useEffect(() => {
    const STEP = 0.18; // fraction of remaining distance per tick (~smooth glide)
    const ARRIVE = 0.02; // ~2km-ish threshold in degrees
    const id = window.setInterval(() => {
      tickRef.current += 1;
      setFriends((prev) =>
        prev.map((f) => {
          const next = f.route?.[0];
          if (!next) return f;
          const dLat = next.lat - f.lat;
          const dLng = next.lng - f.lng;
          const dist = Math.hypot(dLat, dLng);
          // Arrived → promote destination into history, pop from route
          if (dist < ARRIVE) {
            const arrived: FriendStop = {
              name: next.name,
              time: "just now",
              note: next.note,
              lat: next.lat,
              lng: next.lng,
            };
            setLastPing((p) => ({ ...p, [f.id]: Date.now() }));
            return {
              ...f,
              lat: next.lat,
              lng: next.lng,
              place: next.name.split(" ")[0] || f.place,
              history: [arrived, ...f.history].slice(0, 8),
              route: f.route!.slice(1),
            };
          }
          // Small heartbeat ping every few ticks even without arrival
          if (tickRef.current % 4 === 0) {
            setLastPing((p) => ({ ...p, [f.id]: Date.now() }));
          }
          return { ...f, lat: f.lat + dLat * STEP, lng: f.lng + dLng * STEP };
        }),
      );
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  // Keep the selected sheet in sync as the underlying friend moves
  useEffect(() => {
    if (!selected) return;
    const fresh = friends.find((f) => f.id === selected.id);
    if (fresh && (fresh.lat !== selected.lat || fresh.history[0]?.name !== selected.history[0]?.name)) {
      setSelected(fresh);
    }
  }, [friends, selected]);

  // Lazy-init Leaflet only when expanded modal opens
  useEffect(() => {
    if (!expanded || !leafletRef.current) return;
    let map: any;
    let L: any;
    let cancelled = false;
    (async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !leafletRef.current) return;
      map = L.map(leafletRef.current, { zoomControl: true, worldCopyJump: true }).setView([15, 10], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      friends.forEach((f) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:34px;height:34px;">
            <span style="position:absolute;inset:-6px;border-radius:50%;background:${f.color}33;animation:friendPulse 1.8s ease-out infinite;"></span>
            <div style="position:relative;width:34px;height:34px;border-radius:50%;background:${f.color};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;">${f.name.split(" ").map((n) => n[0]).join("")}</div>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const marker = L.marker([f.lat, f.lng], { icon })
          .addTo(map)
          .on("click", () => setSelected(f))
          .bindTooltip(`${f.name} · ${f.place}`, { direction: "top", offset: [0, -14] });
        markersRef.current[f.id] = marker;
      });
    })();
    return () => {
      cancelled = true;
      markersRef.current = {};
      map?.remove();
    };
  }, [expanded]);

  // Smoothly slide Leaflet markers as friends move
  useEffect(() => {
    if (!expanded) return;
    friends.forEach((f) => {
      const m = markersRef.current[f.id];
      if (m && typeof m.setLatLng === "function") {
        m.setLatLng([f.lat, f.lng]);
        if (m.getTooltip()) m.setTooltipContent(`${f.name} · ${f.place}`);
      }
    });
  }, [friends, expanded]);

  const liveCount = useMemo(
    () => Object.values(lastPing).filter((t) => Date.now() - t < 30_000).length,
    // recompute on every friends update so the badge stays lively
    [lastPing, friends],
  );

  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6 h-full">
      <style>{`@keyframes friendPulse {0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.2);opacity:0}}`}</style>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Friends Location</h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <span className="relative rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            {liveCount} live now · updating in real-time
          </p>
        </div>
        <button
          onClick={() => {
            setExpanded(true);
            onExpand?.();
          }}
          className="text-xs font-semibold text-[#C2410C] bg-[#FFEDD5] hover:bg-[#FED7AA] px-3 py-1.5 rounded-full transition"
        >
          Expand
        </button>
      </div>

      {/* Decorative dot-grid world with pinpoints (fast, no map tiles) */}
      <div
        className="relative mt-4 h-[240px] rounded-2xl overflow-hidden bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--muted-foreground)/0.28)_1px,_transparent_0)] [background-size:9px_9px] ring-1 ring-border/50"
      >
        {friends.map((f, i) => {
          const { x, y } = project(f.lat, f.lng);
          const pinged = Date.now() - (lastPing[f.id] || 0) < 4000;
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, top: `${y}%`, left: `${x}%` }}
              transition={{
                opacity: { delay: 0.08 * i },
                scale: { delay: 0.08 * i, type: "spring", stiffness: 260, damping: 20 },
                top: { type: "tween", duration: 3.2, ease: "linear" },
                left: { type: "tween", duration: 3.2, ease: "linear" },
              }}
              onClick={() => setSelected(f)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex items-center gap-2 bg-white/95 backdrop-blur rounded-full pl-1 pr-3 py-1 shadow-md border border-border/60 hover:shadow-lg hover:-translate-y-[52%] transition"
              aria-label={`View ${f.name} history`}
            >
              <span className="relative shrink-0">
                {pinged && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: `${f.color}55` }}
                  />
                )}
                <span
                  className="relative w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: f.color }}
                >
                  {f.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </span>
              <span className="leading-tight text-left">
                <span className="block text-xs font-semibold text-foreground">{f.name}</span>
                <span className="block text-[10px] text-muted-foreground">{f.place}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Friend list quick-strip with live timestamps */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {friends.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f)}
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 hover:bg-secondary/60 transition"
          >
            <span
              className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
              style={{ background: f.color }}
            >
              {f.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <span className="text-xs font-medium text-foreground">{f.place}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" /> {formatRelative(lastPing[f.id] || Date.now())}
            </span>
          </button>
        ))}
      </div>

      {/* Expanded interactive Leaflet map */}
      <Sheet open={expanded} onOpenChange={setExpanded}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-5 border-b">
            <SheetTitle className="font-display text-xl flex items-center gap-2">
              Friends around the world
              <span className="text-xs font-normal text-emerald-600 flex items-center gap-1.5">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  <span className="relative rounded-full w-2 h-2 bg-emerald-500" />
                </span>
                {liveCount} live
              </span>
            </SheetTitle>
          </SheetHeader>
          <div ref={leafletRef} className="flex-1 min-h-[400px]" />
          <div className="p-4 border-t max-h-56 overflow-y-auto space-y-2">
            {friends.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 text-left"
              >
                <span
                  className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: f.color }}
                >
                  {f.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {f.place}, {f.country} · Last: {f.history[0]?.name} · {formatRelative(lastPing[f.id] || Date.now())}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Friend detail — stop history */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          {selected && (
            <>
              <div
                className="p-6 text-white relative"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}dd)` }}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg">
                    {selected.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{selected.name}</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {selected.place}, {selected.country}
                    </p>
                    <p className="text-white/70 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3 h-3" /> Live · pinged {formatRelative(lastPing[selected.id] || Date.now())}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  <Navigation2 className="w-3.5 h-3.5" /> Open in Maps
                </a>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-4">
                  RECENT STOPS
                </p>
                <ol className="relative border-l-2 border-dashed border-border/60 ml-3 space-y-5">
                  {selected.history.map((s, i) => (
                    <li key={i} className="pl-5 relative">
                      <span
                        className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white"
                        style={{ background: selected.color }}
                      />
                      <p className="font-semibold text-sm text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {s.time}
                      </p>
                      {s.note && (
                        <p className="text-xs text-foreground/70 mt-1 italic">"{s.note}"</p>
                      )}
                    </li>
                  ))}
                </ol>
                {selected.route && selected.route.length > 0 && (
                  <>
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground mt-6 mb-3">
                      HEADING NEXT
                    </p>
                    <ul className="space-y-2">
                      {selected.route.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/50 rounded-lg px-3 py-2"
                        >
                          <Navigation2 className="w-3.5 h-3.5" style={{ color: selected.color }} />
                          <span className="flex-1">{r.name}</span>
                          {i === 0 && (
                            <span className="text-[10px] font-semibold text-emerald-600">EN ROUTE</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
