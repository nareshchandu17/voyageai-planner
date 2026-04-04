import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate, budget, styles, groupSize, interests, weatherForecast, nearbyPlaces, upcomingEvents, travelerProfile } = await req.json();

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

    const systemPrompt = `You are VoyageAI, an expert travel planner. You create comprehensive travel plans with TWO phases:
1. BEFORE TRIP — preparation intelligence so the user is fully ready
2. DURING TRIP — a live travel companion with practical info for while traveling

You MUST only recommend REAL places, restaurants, and attractions. Keep recommendations practical and verified.

OUTPUT FORMAT: Return a valid JSON object with this exact structure:

{
  "title": "Trip title",
  "summary": "2-3 sentence trip summary",
  "totalBudgetEstimate": number,
  "currency": "USD",
  "beforeTrip": {
    "destinationOverview": {
      "country": "Country name",
      "language": "Primary language",
      "timezone": "UTC+X",
      "currency": "Local currency (code)",
      "bestMonths": ["Month1", "Month2"],
      "topAttractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
      "cultureTips": ["Cultural tip 1", "Cultural tip 2", "Cultural tip 3"]
    },
    "weatherForecast": {
      "overview": "General weather summary for trip dates",
      "avgTemp": "XX°C",
      "rainChance": "XX%",
      "bestTimeToExplore": "Morning/Afternoon/Evening",
      "dailyForecast": [
        { "date": "YYYY-MM-DD", "condition": "Sunny/Rainy/etc", "tempHigh": "XX°C", "tempLow": "XX°C", "advisory": "optional note" }
      ]
    },
    "budgetEstimation": {
      "flights": { "estimate": number, "notes": "Budget airline tips" },
      "hotels": { "estimate": number, "notes": "Accommodation type recommendation" },
      "food": { "estimate": number, "notes": "Daily food budget tip" },
      "transport": { "estimate": number, "notes": "Local transport cost info" },
      "activities": { "estimate": number, "notes": "Activity costs overview" },
      "total": number
    },
    "packingChecklist": {
      "clothing": ["item1", "item2", "item3"],
      "documents": ["item1", "item2"],
      "electronics": ["item1", "item2"],
      "essentials": ["item1", "item2", "item3"]
    },
    "visaAndDocuments": {
      "visaRequired": true,
      "visaType": "Tourist visa / Visa-free / eVisa",
      "passportValidity": "6 months minimum",
      "entryRules": ["Rule 1", "Rule 2"],
      "additionalDocs": ["Doc 1"]
    },
    "itineraryPreview": [
      { "day": 1, "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"] }
    ]
  },
  "duringTrip": {
    "localTransport": {
      "overview": "Transport system overview",
      "options": [
        { "type": "Metro/Bus/Taxi/etc", "description": "How it works", "costRange": "$X-$Y", "tip": "Practical tip" }
      ],
      "travelCard": "Recommended travel card or pass if available"
    },
    "restaurants": [
      {
        "name": "Real restaurant name",
        "cuisine": "Cuisine type",
        "priceRange": "$-$$$$",
        "location": "Neighborhood/area",
        "famousFor": "Signature dish or specialty",
        "mealType": "breakfast/lunch/dinner",
        "tip": "Insider tip"
      }
    ],
    "experiences": [
      {
        "name": "Experience name",
        "type": "hidden_gem/festival/photo_spot/activity",
        "description": "What makes it special",
        "location": "Where to find it",
        "bestTime": "When to go",
        "cost": "Free/$X",
        "tip": "Insider tip"
      }
    ],
    "safety": {
      "emergencyNumber": "Local emergency number",
      "policeNumber": "Police number",
      "nearbyHospitals": ["Hospital name 1"],
      "safeAreas": ["Safe area 1", "Safe area 2"],
      "areasToAvoid": ["Area to avoid at night"],
      "travelInsurance": "Recommendation",
      "currencyExchange": "Where and how to exchange",
      "atmTips": "ATM usage tips",
      "scamsToWatch": ["Common scam 1"]
    },
    "hotelInfo": {
      "checkInTip": "Standard check-in info",
      "wifiTip": "WiFi availability",
      "nearbyServices": ["Pharmacy", "Convenience store", "ATM"],
      "restaurantsNearHotel": "Dining options near typical hotel areas"
    },
    "navigation": {
      "recommendedApps": ["App 1", "App 2"],
      "offlineMaps": "Offline maps recommendation",
      "walkingTips": "General walking/navigation tips",
      "keyRoutes": [
        { "from": "Location A", "to": "Location B", "method": "Walk/Metro/Taxi", "duration": "XX mins", "cost": "$X" }
      ]
    }
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "imageQuery": "specific landmark or scene for this day, e.g. 'Eiffel Tower Paris sunset'",
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
          "tip": "Optional insider tip",
          "imageQuery": "specific place name for image search, e.g. 'Louvre Museum Paris interior'"
        }
      ],
      "meals": {
        "breakfast": { "name": "Real restaurant name", "cuisine": "Type", "priceRange": "$-$$$$", "location": "Neighborhood", "imageQuery": "restaurant name or cuisine type photo query" },
        "lunch": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "...", "imageQuery": "..." },
        "dinner": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "...", "imageQuery": "..." }
      },
      "dailyBudget": number,
      "travelTip": "Practical tip for the day"
    }
  ],
  "warnings": ["any important travel warnings"]
}

ONLY output the JSON object, nothing else. Ensure all data is realistic and verified.`;

    const userPrompt = `Plan a trip to ${destination}
Dates: ${startDate} to ${endDate}
Budget: $${budget} per person
Group size: ${groupSize} travelers
Travel styles: ${styles?.join(", ") || "Any"}
Interests: ${interests?.join(", ") || "General sightseeing"}
${weatherContext}${placesContext}${eventsContext}

Create a comprehensive two-phase travel plan:
1. BEFORE TRIP: Include destination overview, weather forecast, budget estimation, packing checklist, visa/documents info, and itinerary preview.
2. DURING TRIP: Include local transport guide, restaurant recommendations (6-8 restaurants), unique experiences (5-6), safety information, hotel tips, and navigation guide with key routes.

All recommendations must be REAL, verified places and establishments. If local events are listed above, incorporate relevant ones.`;

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
