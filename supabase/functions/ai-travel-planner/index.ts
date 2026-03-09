import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate, budget, styles, groupSize, interests, weatherForecast, nearbyPlaces, upcomingEvents } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const weatherContext = weatherForecast?.forecast?.length
      ? `\n\nWEATHER FORECAST for the trip dates:\n${weatherForecast.forecast.map((d: any) =>
          `${d.date}: ${d.weather} (${d.tempMin}°C-${d.tempMax}°C), humidity ${d.humidity}%, wind ${d.wind}km/h${d.rain ? " ⚠️ RAIN expected" : ""}`
        ).join("\n")}\n\nIMPORTANT: Use this weather data to adapt the itinerary. Move outdoor activities away from rainy days. Suggest indoor alternatives on bad weather days.`
      : "";

    const placesContext = nearbyPlaces?.length
      ? `\n\nVERIFIED ATTRACTIONS (from Google Maps - prioritize these real places):\n${nearbyPlaces.map((p: any) => 
          `- ${p.name} (${p.rating ? `★${p.rating}` : "unrated"}) - ${p.address || "address unavailable"}`
        ).join("\n")}`
      : "";

    const eventsContext = upcomingEvents?.events?.length
      ? `\n\nLOCAL EVENTS during trip dates (from Ticketmaster - recommend relevant ones):\n${upcomingEvents.events.map((e: any) =>
          `- ${e.date}: ${e.name} at ${e.venue || "TBA"} (${e.category || "Event"}${e.priceRange ? ` - $${e.priceRange.min}-$${e.priceRange.max}` : ""})`
        ).join("\n")}`
      : "";

    const systemPrompt = `You are VoyageAI, an expert travel planner that creates REAL, verified, high-quality travel itineraries. You MUST:

1. Only recommend REAL places that exist — real restaurant names, real attraction names, real neighborhoods
2. Include realistic opening hours and travel times between locations
3. Ensure daily schedules are achievable (not too packed, realistic distances)
4. Adapt to weather conditions when forecast data is provided
5. Stay within the specified budget
6. Match the traveler's style and interests

OUTPUT FORMAT: Return a valid JSON object with this exact structure:
{
  "title": "Trip title",
  "summary": "2-3 sentence trip summary",
  "totalBudgetEstimate": number,
  "currency": "USD",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "weather": { "condition": "Sunny/Rainy/etc", "temp": "25°C", "advisory": "optional weather note" },
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Brief description",
          "location": "Real place name, neighborhood",
          "duration": "2 hours",
          "cost": 0,
          "type": "attraction|restaurant|transport|free|shopping|nightlife",
          "weatherSensitive": false,
          "tip": "Optional insider tip"
        }
      ],
      "meals": {
        "breakfast": { "name": "Real restaurant name", "cuisine": "Type", "priceRange": "$-$$$$", "location": "Neighborhood" },
        "lunch": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "..." },
        "dinner": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "..." }
      },
      "dailyBudget": number,
      "travelTip": "Practical tip for the day"
    }
  ],
  "packingTips": ["tip1", "tip2"],
  "budgetBreakdown": { "accommodation": number, "food": number, "activities": number, "transport": number },
  "warnings": ["any important travel warnings"]
}

ONLY output the JSON object, nothing else.`;

    const userPrompt = `Plan a trip to ${destination}
Dates: ${startDate} to ${endDate}
Budget: $${budget} per person
Group size: ${groupSize} travelers
Travel styles: ${styles?.join(", ") || "Any"}
Interests: ${interests?.join(", ") || "General sightseeing"}
${weatherContext}${placesContext}${eventsContext}

Create a detailed day-by-day itinerary with REAL places, restaurants, and attractions. Ensure all recommendations are genuine, well-known establishments. If local events are listed above, consider incorporating relevant ones into the itinerary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error [${response.status}]`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
