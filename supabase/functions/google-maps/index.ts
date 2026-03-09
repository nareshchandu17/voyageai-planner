import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const { action, query, location, radius, placeId } = await req.json();

    let result;

    switch (action) {
      case "search": {
        // Text search for places
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "nearby": {
        // Nearby search around a location
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius || 5000}&keyword=${encodeURIComponent(query || "")}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "details": {
        // Place details
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,opening_hours,photos,reviews,price_level,website,formatted_phone_number&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      case "geocode": {
        // Geocode a destination name to lat/lng
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;
        const res = await fetch(url);
        result = await res.json();
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid action. Use: search, nearby, details, geocode" }), {
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
