import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Navigation, Footprints, Bus, Car, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchLocationCoordinatesBatch,
  fetchRouteEstimatesBatch,
  type LocationPoint,
  type RouteEstimate,
  type TravelMode,
} from "@/lib/streamChat";

interface Stop {
  title?: string;
  name?: string;
  location?: string;
  address?: string;
  time?: string;
}

interface Props {
  destination: string;
  stops: Stop[];
  /** Titles of stops that were just added by a regeneration — rendered highlighted. */
  highlightTitles?: string[];
}

const modeMeta: Record<TravelMode, { icon: any; color: string; label: string }> = {
  walking: { icon: Footprints, color: "#10b981", label: "Walk" },
  transit: { icon: Bus, color: "#3b82f6", label: "Transit" },
  driving: { icon: Car, color: "#f59e0b", label: "Drive" },
};

const numberedIcon = (n: number, accent = "#0ea5e9", highlighted = false) =>
  L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
      ${highlighted ? `<span style="position:absolute;width:44px;height:44px;border-radius:50%;background:${accent}33;animation:dayroute-pulse 1.6s ease-out infinite;"></span>` : ""}
      <div style="position:relative;background:${accent};color:#fff;width:${highlighted ? 32 : 28}px;height:${highlighted ? 32 : 28}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 4px 10px rgba(0,0,0,.25);border:${highlighted ? "3px solid #fff" : "2px solid #fff"};font-family:Inter,sans-serif;">${n}</div>
    </div>
    <style>@keyframes dayroute-pulse{0%{transform:scale(.7);opacity:.85}100%{transform:scale(1.35);opacity:0}}</style>`,
    iconSize: [highlighted ? 44 : 28, highlighted ? 44 : 28],
    iconAnchor: [highlighted ? 22 : 14, highlighted ? 22 : 14],
  });


const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 1) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points as any, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

const stopQuery = (s: Stop, dest: string) => {
  const base = s.address || s.location || s.title || s.name || "";
  if (!base) return "";
  return /,/.test(base) ? base : `${base}, ${dest}`;
};

const DayRouteMap = ({ destination, stops }: Props) => {
  const validStops = useMemo(
    () => stops.filter((s) => s.address || s.location || s.title || s.name),
    [stops]
  );
  const [coords, setCoords] = useState<Record<string, LocationPoint>>({});
  const [routes, setRoutes] = useState<Record<string, RouteEstimate>>({});
  const [loading, setLoading] = useState(false);
  const [modeOverride, setModeOverride] = useState<"auto" | TravelMode>("auto");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!validStops.length) return;
      setLoading(true);
      const queries = validStops.map((s) => stopQuery(s, destination)).filter(Boolean);
      const c = await fetchLocationCoordinatesBatch(queries);
      if (cancelled) return;
      setCoords(c);
      // route segments
      const pairs: Array<{ key: string; origin: LocationPoint; destination: LocationPoint }> = [];
      for (let i = 0; i < queries.length - 1; i++) {
        const o = c[queries[i]];
        const d = c[queries[i + 1]];
        if (o && d) pairs.push({ key: `${i}-${i + 1}`, origin: o, destination: d });
      }
      if (pairs.length) {
        const r = await fetchRouteEstimatesBatch(pairs);
        if (!cancelled) setRoutes(r);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [validStops, destination]);

  const points = useMemo(() => {
    return validStops
      .map((s) => coords[stopQuery(s, destination)])
      .filter((p): p is LocationPoint => !!p)
      .map((p) => [p.lat, p.lng] as [number, number]);
  }, [validStops, coords, destination]);

  const segments = useMemo(() => {
    const segs: Array<{
      from: [number, number];
      to: [number, number];
      mode: TravelMode;
      durationText?: string;
      distanceText?: string;
      durationValue?: number;
      fromLabel: string;
      toLabel: string;
      unavailable?: boolean;
    }> = [];
    for (let i = 0; i < validStops.length - 1; i++) {
      const o = coords[stopQuery(validStops[i], destination)];
      const d = coords[stopQuery(validStops[i + 1], destination)];
      if (!o || !d) continue;
      const r = routes[`${i}-${i + 1}`];
      const recommended = r?.recommendedMode || "walking";
      const pick: TravelMode = modeOverride === "auto" ? recommended : modeOverride;
      const picked = r?.modes?.[pick];
      const fallback =
        modeOverride !== "auto" && !picked && r
          ? r.modes?.[recommended]
          : undefined;
      const useMode: TravelMode = picked ? pick : recommended;
      const useData = picked || fallback || (r ? { durationText: r.durationText, distanceText: r.distanceText, durationValue: 0 } : undefined);
      segs.push({
        from: [o.lat, o.lng],
        to: [d.lat, d.lng],
        mode: useMode,
        durationText: useData?.durationText,
        distanceText: useData?.distanceText,
        durationValue: useData?.durationValue,
        fromLabel: validStops[i].title || validStops[i].name || `Stop ${i + 1}`,
        toLabel: validStops[i + 1].title || validStops[i + 1].name || `Stop ${i + 2}`,
        unavailable: modeOverride !== "auto" && !picked,
      });
    }
    return segs;
  }, [validStops, coords, routes, destination, modeOverride]);

  const totals = useMemo(() => {
    const secs = segments.reduce((s, x) => s + (x.durationValue || 0), 0);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.round((secs % 3600) / 60);
    const durationText = secs > 0 ? (hrs ? `${hrs}h ${mins}m` : `${mins}m`) : "—";
    return { durationText, count: segments.length };
  }, [segments]);

  const gmapsTravelMode = modeOverride === "auto" ? "walking" : modeOverride;
  const gmapsRoute = useMemo(() => {
    const qs = validStops.map((s) => encodeURIComponent(stopQuery(s, destination))).filter(Boolean);
    if (qs.length < 2) return null;
    const origin = qs[0];
    const dest = qs[qs.length - 1];
    const waypoints = qs.slice(1, -1).join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }&travelmode=${gmapsTravelMode}`;
  }, [validStops, destination, gmapsTravelMode]);

  if (!validStops.length) return null;

  const center: [number, number] = points[0] || [0, 0];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card/40">
      <div className="relative h-[320px] sm:h-[380px] w-full bg-muted">
        {points.length > 0 ? (
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <FitBounds points={points} />
            {validStops.map((s, i) => {
              const p = coords[stopQuery(s, destination)];
              if (!p) return null;
              return (
                <Marker key={i} position={[p.lat, p.lng]} icon={numberedIcon(i + 1)}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-semibold">{s.title || s.name}</div>
                      {s.time && <div className="text-muted-foreground">{s.time}</div>}
                      {(s.address || s.location) && (
                        <div className="text-muted-foreground">{s.address || s.location}</div>
                      )}
                      <a
                        className="text-sky-600 underline mt-1 inline-block"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          stopQuery(s, destination)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Maps ↗
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {segments.map((seg, i) => (
              <Polyline
                key={i}
                positions={[seg.from, seg.to]}
                pathOptions={{
                  color: modeMeta[seg.mode].color,
                  weight: 4,
                  opacity: 0.85,
                  dashArray: seg.mode === "walking" ? "6 8" : undefined,
                }}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Locating stops…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> No mappable stops yet
              </span>
            )}
          </div>
        )}
        {loading && points.length > 0 && (
          <div className="absolute top-2 right-2 z-[1000] bg-background/90 backdrop-blur px-2 py-1 rounded-md text-[10px] inline-flex items-center gap-1.5 shadow">
            <Loader2 className="w-3 h-3 animate-spin" /> Computing routes
          </div>
        )}
      </div>

      {/* Mode toggle + legend */}
      {segments.length > 0 && (
        <div className="p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[11px]">
              {([
                { id: "auto" as const, label: "Auto", Icon: Navigation },
                { id: "walking" as const, label: "Walk", Icon: Footprints },
                { id: "transit" as const, label: "Transit", Icon: Bus },
                { id: "driving" as const, label: "Drive", Icon: Car },
              ]).map(({ id, label, Icon }) => {
                const active = modeOverride === id;
                return (
                  <button
                    key={id}
                    onClick={() => setModeOverride(id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                      active
                        ? "bg-background shadow-sm text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{totals.count}</span> segments ·{" "}
              <span className="font-medium text-foreground">{totals.durationText}</span> total
            </div>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {segments.map((seg, i) => {
              const Icon = modeMeta[seg.mode].icon;
              const url = `https://www.google.com/maps/dir/?api=1&origin=${seg.from[0]},${seg.from[1]}&destination=${seg.to[0]},${seg.to[1]}&travelmode=${seg.mode}`;
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition"
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ background: modeMeta[seg.mode].color }}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                  <span className="flex-1 truncate">
                    <span className="text-muted-foreground">{i + 1} → {i + 2}</span>{" "}
                    <span className="text-foreground">{seg.fromLabel} → {seg.toLabel}</span>
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {modeMeta[seg.mode].label}
                    {seg.durationText ? ` · ${seg.durationText}` : ""}
                    {seg.distanceText ? ` · ${seg.distanceText}` : ""}
                    {seg.unavailable ? " · fallback" : ""}
                  </Badge>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              );
            })}
          </div>
          {gmapsRoute && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => window.open(gmapsRoute, "_blank")}
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              Open optimized route in Google Maps
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DayRouteMap;
