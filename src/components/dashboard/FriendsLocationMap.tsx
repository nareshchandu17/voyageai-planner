import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  ExternalLink,
  X,
  Navigation2,
  Radio,
  Shield,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  Users,
  Check,
} from "lucide-react";
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

// ---- Privacy controls ---------------------------------------------------

type Audience = "everyone" | "friends" | "close" | "nobody";
type DurationKey = "15m" | "1h" | "8h" | "until_off";

type PrivacyState = {
  sharing: boolean;
  audience: Audience;
  duration: DurationKey;
  /** Timestamp (ms) when sharing auto-expires. null = no expiry ("until_off"). */
  expiresAt: number | null;
  /** Friend ids allowed to see me (used by "close" audience). */
  allowlist: string[];
  /** Friend ids explicitly blocked from seeing me. */
  blocklist: string[];
  /** Hide precise location — only show city/country. */
  approximateOnly: boolean;
  /** Pause on-map presence but keep account-level sharing settings. */
  ghostMode: boolean;
};

const PRIVACY_KEY = "friends_presence_privacy_v1";
const DURATION_MS: Record<DurationKey, number | null> = {
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  until_off: null,
};
const DURATION_LABEL: Record<DurationKey, string> = {
  "15m": "15 minutes",
  "1h": "1 hour",
  "8h": "8 hours",
  until_off: "Until I turn off",
};
const AUDIENCE_LABEL: Record<Audience, string> = {
  everyone: "Everyone",
  friends: "All friends",
  close: "Close friends only",
  nobody: "Nobody",
};

const defaultPrivacy = (friendIds: string[]): PrivacyState => ({
  sharing: true,
  audience: "friends",
  duration: "until_off",
  expiresAt: null,
  allowlist: friendIds.slice(0, 2),
  blocklist: [],
  approximateOnly: false,
  ghostMode: false,
});

const loadPrivacy = (friendIds: string[]): PrivacyState => {
  if (typeof window === "undefined") return defaultPrivacy(friendIds);
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (!raw) return defaultPrivacy(friendIds);
    const parsed = JSON.parse(raw) as PrivacyState;
    return { ...defaultPrivacy(friendIds), ...parsed };
  } catch {
    return defaultPrivacy(friendIds);
  }
};

// -------------------------------------------------------------------------

export default function FriendsLocationMap({ onExpand }: { onExpand?: () => void }) {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [selected, setSelected] = useState<Friend | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyState>(() =>
    loadPrivacy(INITIAL_FRIENDS.map((f) => f.id)),
  );
  const [, forceTick] = useState(0);
  const [lastPing, setLastPing] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      INITIAL_FRIENDS.map((f) => [f.id, Date.now() - Math.floor(Math.random() * 60_000)]),
    ),
  );
  const leafletRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Record<string, any>>({});
  const tickRef = useRef(0);

  // Persist privacy prefs
  useEffect(() => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy));
    } catch {
      /* ignore quota errors */
    }
  }, [privacy]);

  // Auto-expire sharing when the timer runs out
  useEffect(() => {
    if (!privacy.sharing || !privacy.expiresAt) return;
    const remaining = privacy.expiresAt - Date.now();
    if (remaining <= 0) {
      setPrivacy((p) => ({ ...p, sharing: false, expiresAt: null }));
      return;
    }
    const t = window.setTimeout(() => {
      setPrivacy((p) => ({ ...p, sharing: false, expiresAt: null }));
    }, remaining);
    // Also tick every 30s so the "expires in" label stays fresh
    const i = window.setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(i);
    };
  }, [privacy.sharing, privacy.expiresAt]);

  // Simulated real-time presence: interpolate each friend toward their next planned stop.
  useEffect(() => {
    const STEP = 0.18;
    const ARRIVE = 0.02;
    const id = window.setInterval(() => {
      tickRef.current += 1;
      setFriends((prev) =>
        prev.map((f) => {
          const next = f.route?.[0];
          if (!next) return f;
          const dLat = next.lat - f.lat;
          const dLng = next.lng - f.lng;
          const dist = Math.hypot(dLat, dLng);
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
          if (tickRef.current % 4 === 0) {
            setLastPing((p) => ({ ...p, [f.id]: Date.now() }));
          }
          return { ...f, lat: f.lat + dLat * STEP, lng: f.lng + dLng * STEP };
        }),
      );
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fresh = friends.find((f) => f.id === selected.id);
    if (
      fresh &&
      (fresh.lat !== selected.lat || fresh.history[0]?.name !== selected.history[0]?.name)
    ) {
      setSelected(fresh);
    }
  }, [friends, selected]);

  useEffect(() => {
    if (!expanded || !leafletRef.current) return;
    let map: any;
    let L: any;
    let cancelled = false;
    (async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !leafletRef.current) return;
      map = L.map(leafletRef.current, { zoomControl: true, worldCopyJump: true }).setView(
        [15, 10],
        2,
      );
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
    [lastPing, friends],
  );

  // Reciprocity: if I'm not sharing, I can't see live pins either — mirror the rule.
  // Also honor "audience" as a symmetric filter on which friends' pings I receive.
  const visibleFriends = useMemo(() => {
    if (!privacy.sharing || privacy.ghostMode) return [];
    return friends.filter((f) => {
      if (privacy.blocklist.includes(f.id)) return false;
      if (privacy.audience === "nobody") return false;
      if (privacy.audience === "close") return privacy.allowlist.includes(f.id);
      return true;
    });
  }, [friends, privacy]);

  const expiresLabel = useMemo(() => {
    if (!privacy.sharing) return "Sharing is off";
    if (!privacy.expiresAt) return "Sharing until you turn it off";
    const ms = privacy.expiresAt - Date.now();
    if (ms <= 0) return "Expired";
    const m = Math.round(ms / 60000);
    if (m < 60) return `Expires in ${m}m`;
    const h = Math.round(m / 60);
    return `Expires in ${h}h`;
  }, [privacy]);

  const setDuration = (d: DurationKey) => {
    const dur = DURATION_MS[d];
    setPrivacy((p) => ({
      ...p,
      duration: d,
      expiresAt: dur ? Date.now() + dur : null,
    }));
  };

  const toggleSharing = () => {
    setPrivacy((p) => {
      const turningOn = !p.sharing;
      const dur = DURATION_MS[p.duration];
      return {
        ...p,
        sharing: turningOn,
        expiresAt: turningOn && dur ? Date.now() + dur : null,
        ghostMode: turningOn ? p.ghostMode : false,
      };
    });
  };

  const toggleAllow = (id: string) =>
    setPrivacy((p) => ({
      ...p,
      allowlist: p.allowlist.includes(id)
        ? p.allowlist.filter((x) => x !== id)
        : [...p.allowlist, id],
    }));

  const toggleBlock = (id: string) =>
    setPrivacy((p) => ({
      ...p,
      blocklist: p.blocklist.includes(id)
        ? p.blocklist.filter((x) => x !== id)
        : [...p.blocklist, id],
      allowlist: p.allowlist.filter((x) => x !== id),
    }));

  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6 h-full">
      <style>{`@keyframes friendPulse {0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.2);opacity:0}}`}</style>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold text-foreground">Friends Location</h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {privacy.sharing && !privacy.ghostMode ? (
              <>
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  <span className="relative rounded-full w-2 h-2 bg-emerald-500" />
                </span>
                {liveCount} live · {AUDIENCE_LABEL[privacy.audience].toLowerCase()}
              </>
            ) : (
              <>
                <ShieldOff className="w-3 h-3 text-muted-foreground" />
                {privacy.ghostMode ? "Ghost mode — hidden from friends" : "Location sharing paused"}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPrivacyOpen(true)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition inline-flex items-center gap-1.5 ${
              privacy.sharing && !privacy.ghostMode
                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                : "text-slate-700 bg-slate-100 hover:bg-slate-200"
            }`}
            aria-label="Location privacy settings"
          >
            {privacy.sharing && !privacy.ghostMode ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
            Privacy
          </button>
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
      </div>

      {/* Privacy status strip */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-secondary/40 border border-border/50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-foreground/80 min-w-0">
          {privacy.approximateOnly ? (
            <EyeOff className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Eye className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">
            {privacy.sharing
              ? `Visible to ${AUDIENCE_LABEL[privacy.audience]}${privacy.approximateOnly ? " · approximate" : ""}`
              : "You're invisible on the map"}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground shrink-0">{expiresLabel}</span>
      </div>

      {/* Decorative dot-grid world with pinpoints */}
      <div className="relative mt-4 h-[240px] rounded-2xl overflow-hidden bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--muted-foreground)/0.28)_1px,_transparent_0)] [background-size:9px_9px] ring-1 ring-border/50">
        {visibleFriends.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <ShieldOff className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">Presence is off</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              Turn sharing on in Privacy to see friends who share back with you.
            </p>
          </div>
        )}
        {visibleFriends.map((f, i) => {
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
                <span className="block text-[10px] text-muted-foreground">
                  {privacy.approximateOnly ? f.country : f.place}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Friend list quick-strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {visibleFriends.map((f) => (
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
            <span className="text-xs font-medium text-foreground">
              {privacy.approximateOnly ? f.country : f.place}
            </span>
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
                    {f.place}, {f.country} · Last: {f.history[0]?.name} ·{" "}
                    {formatRelative(lastPing[f.id] || Date.now())}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy sheet */}
      <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-6 border-b bg-gradient-to-br from-slate-900 to-slate-700 text-white">
            <SheetTitle className="font-display text-2xl text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Location privacy
            </SheetTitle>
            <p className="text-white/70 text-sm mt-1">
              Control exactly who sees your live location, how precise it is, and for how long.
            </p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Master toggle */}
            <section className="rounded-2xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Share my live location</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{expiresLabel}</p>
                </div>
                <button
                  onClick={toggleSharing}
                  role="switch"
                  aria-checked={privacy.sharing}
                  className={`relative h-6 w-11 rounded-full transition ${
                    privacy.sharing ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      privacy.sharing ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Audience */}
            <section>
              <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">
                WHO CAN SEE ME
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => {
                  const active = privacy.audience === a;
                  return (
                    <button
                      key={a}
                      onClick={() => setPrivacy((p) => ({ ...p, audience: a }))}
                      disabled={!privacy.sharing}
                      className={`text-left px-3 py-2.5 rounded-xl border text-sm transition disabled:opacity-50 ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        {a === "everyone" && <Users className="w-3.5 h-3.5" />}
                        {a === "friends" && <Users className="w-3.5 h-3.5" />}
                        {a === "close" && <ShieldCheck className="w-3.5 h-3.5" />}
                        {a === "nobody" && <ShieldOff className="w-3.5 h-3.5" />}
                        {AUDIENCE_LABEL[a]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Duration */}
            <section>
              <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">
                FOR HOW LONG
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(DURATION_LABEL) as DurationKey[]).map((d) => {
                  const active = privacy.duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      disabled={!privacy.sharing}
                      className={`px-2 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-50 ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      {d === "until_off" ? "∞" : d}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {DURATION_LABEL[privacy.duration]} — sharing turns off automatically when the timer
                ends.
              </p>
            </section>

            {/* Precision + ghost */}
            <section className="space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                <span>
                  <span className="block text-sm font-semibold">Approximate location only</span>
                  <span className="block text-xs text-muted-foreground">
                    Show city/country instead of your exact place.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-500"
                  checked={privacy.approximateOnly}
                  onChange={(e) =>
                    setPrivacy((p) => ({ ...p, approximateOnly: e.target.checked }))
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                <span>
                  <span className="block text-sm font-semibold">Ghost mode</span>
                  <span className="block text-xs text-muted-foreground">
                    Temporarily disappear from the map without changing settings.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-slate-900"
                  checked={privacy.ghostMode}
                  onChange={(e) => setPrivacy((p) => ({ ...p, ghostMode: e.target.checked }))}
                />
              </label>
            </section>

            {/* Per-friend controls */}
            <section>
              <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">
                PER-FRIEND CONTROLS
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Star friends to include them in <strong>Close friends only</strong>. Block anyone to
                hide from them regardless of audience.
              </p>
              <ul className="space-y-2">
                {friends.map((f) => {
                  const allowed = privacy.allowlist.includes(f.id);
                  const blocked = privacy.blocklist.includes(f.id);
                  return (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-xl border border-border/60 p-2.5"
                    >
                      <span
                        className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ background: f.color }}
                      >
                        {f.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {f.place}, {f.country}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAllow(f.id)}
                        disabled={blocked}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 disabled:opacity-40 ${
                          allowed
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "border-border hover:bg-secondary/60"
                        }`}
                      >
                        {allowed && <Check className="w-3 h-3" />} Close
                      </button>
                      <button
                        onClick={() => toggleBlock(f.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          blocked
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "border-border hover:bg-secondary/60"
                        }`}
                      >
                        {blocked ? "Blocked" : "Block"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <button
              onClick={() => setPrivacyOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              Save & close
            </button>
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
                style={{
                  background: `linear-gradient(135deg, ${selected.color}, ${selected.color}dd)`,
                }}
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
                      <MapPin className="w-3.5 h-3.5" />{" "}
                      {privacy.approximateOnly
                        ? selected.country
                        : `${selected.place}, ${selected.country}`}
                    </p>
                    <p className="text-white/70 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3 h-3" /> Live · pinged{" "}
                      {formatRelative(lastPing[selected.id] || Date.now())}
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
                          <Navigation2
                            className="w-3.5 h-3.5"
                            style={{ color: selected.color }}
                          />
                          <span className="flex-1">{r.name}</span>
                          {i === 0 && (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              EN ROUTE
                            </span>
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
