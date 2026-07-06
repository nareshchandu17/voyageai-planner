import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, X, Navigation2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export type FriendStop = { name: string; time: string; note?: string };
export type Friend = {
  id: string;
  name: string;
  place: string;
  country: string;
  lat: number;
  lng: number;
  color: string;
  history: FriendStop[];
};

const FRIENDS: Friend[] = [
  {
    id: "shelly",
    name: "Shelly A.",
    place: "Kyoto",
    country: "Japan",
    lat: 35.0116,
    lng: 135.7681,
    color: "#F97438",
    history: [
      { name: "Fushimi Inari Shrine", time: "2h ago", note: "Sunset shots at the torii gates" },
      { name: "Nishiki Market", time: "6h ago", note: "Street food crawl" },
      { name: "Gion District", time: "Yesterday", note: "Spotted a geiko!" },
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
      { name: "La Boca", time: "1h ago", note: "Tango in the streets" },
      { name: "Recoleta Cemetery", time: "Yesterday" },
      { name: "Palermo Soho", time: "2 days ago", note: "Best steak dinner" },
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
      { name: "Nairobi National Park", time: "3h ago", note: "Saw 4 rhinos" },
      { name: "Karen Blixen Museum", time: "Yesterday" },
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
      { name: "Belém Tower", time: "30m ago" },
      { name: "Time Out Market", time: "5h ago", note: "Pastel de nata #4" },
    ],
  },
];

// Simple equirectangular projection for a decorative world dot-grid
const project = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * 100,
  y: ((90 - lat) / 180) * 100,
});

export default function FriendsLocationMap({ onExpand }: { onExpand?: () => void }) {
  const [selected, setSelected] = useState<Friend | null>(null);
  const [expanded, setExpanded] = useState(false);
  const leafletRef = useRef<HTMLDivElement | null>(null);

  // Lazy-init Leaflet only when expanded modal opens (avoids heavy load on dashboard mount)
  useEffect(() => {
    if (!expanded || !leafletRef.current) return;
    let map: any;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !leafletRef.current) return;
      map = L.map(leafletRef.current, { zoomControl: true, worldCopyJump: true }).setView([15, 10], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      FRIENDS.forEach((f) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:34px;height:34px;border-radius:50%;background:${f.color};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;">${f.name.split(" ").map((n) => n[0]).join("")}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([f.lat, f.lng], { icon })
          .addTo(map)
          .on("click", () => setSelected(f))
          .bindTooltip(`${f.name} · ${f.place}`, { direction: "top", offset: [0, -14] });
      });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [expanded]);

  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6 h-full">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Friends Location</h3>
          <p className="text-xs text-muted-foreground mt-1">Check on your friend live location</p>
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
        {FRIENDS.map((f, i) => {
          const { x, y } = project(f.lat, f.lng);
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setSelected(f)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex items-center gap-2 bg-white/95 backdrop-blur rounded-full pl-1 pr-3 py-1 shadow-md border border-border/60 hover:shadow-lg hover:-translate-y-[52%] transition"
              style={{ top: `${y}%`, left: `${x}%` }}
              aria-label={`View ${f.name} history`}
            >
              <span
                className="w-6 h-6 rounded-full border-2 border-white shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: f.color }}
              >
                {f.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="leading-tight text-left">
                <span className="block text-xs font-semibold text-foreground">{f.name}</span>
                <span className="block text-[10px] text-muted-foreground">{f.country}</span>
              </span>
              {/* pulsing pin dot */}
              <span
                className="absolute -bottom-1 left-3 w-2 h-2 rounded-full"
                style={{ background: f.color, boxShadow: `0 0 0 4px ${f.color}22` }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Friend list quick-strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FRIENDS.map((f) => (
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
          </button>
        ))}
      </div>

      {/* Expanded interactive Leaflet map */}
      <Sheet open={expanded} onOpenChange={setExpanded}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-5 border-b">
            <SheetTitle className="font-display text-xl">Friends around the world</SheetTitle>
          </SheetHeader>
          <div ref={leafletRef} className="flex-1 min-h-[400px]" />
          <div className="p-4 border-t max-h-56 overflow-y-auto space-y-2">
            {FRIENDS.map((f) => (
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
                    {f.place}, {f.country} · Last: {f.history[0]?.name}
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
