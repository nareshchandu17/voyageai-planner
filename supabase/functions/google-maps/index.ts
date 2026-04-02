import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.24.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const RequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("search"), query: z.string().min(1) }),
  z.object({ action: z.literal("nearby"), location: LocationSchema, radius: z.number().optional(), query: z.string().optional() }),
  z.object({ action: z.literal("details"), placeId: z.string().min(1) }),
  z.object({ action: z.literal("geocode"), query: z.string().min(1) }),
  z.object({ action: z.literal("route_estimates"), origin: LocationSchema, destination: LocationSchema }),
  z.object({ action: z.literal("directions_steps"), origin: LocationSchema, destination: LocationSchema, mode: z.enum(["walking", "transit", "driving"]) }),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = parsed.data;

    let result;

    switch (payload.action) {
      case "search": {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(payload.query)}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "nearby": {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${payload.location.lat},${payload.location.lng}&radius=${payload.radius || 5000}&keyword=${encodeURIComponent(payload.query || "")}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "details": {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${payload.placeId}&fields=name,formatted_address,geometry,rating,opening_hours,photos,reviews,price_level,website,formatted_phone_number&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "geocode": {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(payload.query)}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "route_estimates": {
        const travelModes = ["walking", "transit", "driving"] as const;
        const routes = await Promise.all(travelModes.map(async (mode) => {
          const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${payload.origin.lat},${payload.origin.lng}&destination=${payload.destination.lat},${payload.destination.lng}&mode=${mode}&key=${API_KEY}`;
          const res = await fetch(url);
          if (!res.ok) return null;
          const data = await res.json();
          const leg = data.routes?.[0]?.legs?.[0];
          if (!leg?.duration || !leg?.distance) return null;
          return {
            mode,
            durationText: leg.duration.text,
            durationValue: leg.duration.value,
            distanceText: leg.distance.text,
          };
        }));

        const availableRoutes = routes.filter((route): route is NonNullable<typeof route> => !!route)
          .sort((a, b) => a.durationValue - b.durationValue);

        if (!availableRoutes.length) {
          return new Response(JSON.stringify({ error: "No route estimates available" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const recommended = availableRoutes[0];
        result = {
          recommendedMode: recommended.mode,
          durationText: recommended.durationText,
          distanceText: recommended.distanceText,
          modes: Object.fromEntries(
            availableRoutes.map((route) => [route.mode, {
              durationText: route.durationText,
              distanceText: route.distanceText,
              durationValue: route.durationValue,
            }]),
          ),
        };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid action. Use: search, nearby, details, geocode, route_estimates" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Google Maps error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
