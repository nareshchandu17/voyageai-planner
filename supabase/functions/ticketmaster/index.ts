import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("TICKETMASTER_API_KEY");
    if (!API_KEY) throw new Error("TICKETMASTER_API_KEY is not configured");

    const { destination, startDate, endDate, keyword, size } = await req.json();

    // Build Ticketmaster Discovery API URL
    const params = new URLSearchParams({
      apikey: API_KEY,
      size: String(size || 10),
      sort: "date,asc",
    });

    if (destination) params.set("city", destination.split(",")[0].trim());
    if (startDate) params.set("startDateTime", `${startDate}T00:00:00Z`);
    if (endDate) params.set("endDateTime", `${endDate}T23:59:59Z`);
    if (keyword) params.set("keyword", keyword);

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Ticketmaster API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    // Extract relevant event info
    const events = (data._embedded?.events || []).map((event: any) => ({
      id: event.id,
      name: event.name,
      date: event.dates?.start?.localDate,
      time: event.dates?.start?.localTime,
      venue: event._embedded?.venues?.[0]?.name,
      address: event._embedded?.venues?.[0]?.address?.line1,
      city: event._embedded?.venues?.[0]?.city?.name,
      category: event.classifications?.[0]?.segment?.name,
      genre: event.classifications?.[0]?.genre?.name,
      priceRange: event.priceRanges?.[0] ? {
        min: event.priceRanges[0].min,
        max: event.priceRanges[0].max,
        currency: event.priceRanges[0].currency,
      } : null,
      image: event.images?.find((img: any) => img.ratio === "16_9" && img.width > 500)?.url || event.images?.[0]?.url,
      url: event.url,
    }));

    return new Response(JSON.stringify({ events, totalEvents: data.page?.totalElements || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Ticketmaster error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
