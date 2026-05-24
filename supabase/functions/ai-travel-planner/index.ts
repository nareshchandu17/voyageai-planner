import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate, budget, styles, groupSize, interests, weatherForecast, nearbyPlaces, upcomingEvents, travelerProfile, narrativeIntensities } = await req.json();

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

    const profileContext = travelerProfile
      ? `\n\nTRAVELER PROFILE (personalize the itinerary based on this):
- Pace preference: ${travelerProfile.pace_preference || "moderate"}
- Energy tolerance: ${travelerProfile.energy_tolerance || 3}/5 (1=relaxed, 5=intense)
- Cuisine preferences: ${travelerProfile.cuisine_preferences?.join(", ") || "no specific preference"}
- Travel style: ${travelerProfile.travel_style?.join(", ") || "general"}
- Past trips completed: ${travelerProfile.trip_count || 0}
- Average trip rating: ${travelerProfile.average_rating || "N/A"}/5
${travelerProfile.past_patterns?.avg_activities_per_day ? `- Preferred activities per day: ${travelerProfile.past_patterns.avg_activities_per_day}` : ""}
${travelerProfile.past_patterns?.preferred_time_of_day ? `- Preferred time of day: ${travelerProfile.past_patterns.preferred_time_of_day}` : ""}
${travelerProfile.past_patterns?.avg_daily_budget ? `- Average daily budget: $${travelerProfile.past_patterns.avg_daily_budget}` : ""}
${travelerProfile.past_patterns?.favorite_activity_types?.length ? `- Favorite activity types: ${travelerProfile.past_patterns.favorite_activity_types.join(", ")}` : ""}
${travelerProfile.past_patterns?.skipped_activity_types?.length ? `- Tends to skip: ${travelerProfile.past_patterns.skipped_activity_types.join(", ")} (avoid these)` : ""}
${travelerProfile.past_patterns?.trip_ratings?.length ? `- Past destinations & ratings: ${travelerProfile.past_patterns.trip_ratings.map((r: any) => `${r.destination} (${r.rating}/5)`).join(", ")}` : ""}

IMPORTANT: Use this profile to personalize the itinerary:
- Match activity intensity to the energy tolerance level
- Prioritize favorite activity types and cuisine preferences
- Schedule ${travelerProfile.past_patterns?.avg_activities_per_day || 4} activities per day based on their history
- If pace is "relaxed", add more free time; if "intense", pack more activities
- Avoid activity types they tend to skip`
      : "";

    // Build narrative intensity context from user-shaped arc
    const narrativeContext = narrativeIntensities && Object.keys(narrativeIntensities).length > 0
      ? `\n\nNARRATIVE ARC PACING (user has manually shaped the trip intensity arc — FOLLOW THIS CLOSELY):
${Object.entries(narrativeIntensities).map(([dayIdx, intensity]) => {
  const dayNum = parseInt(dayIdx) + 1;
  let activityCount: string;
  const pct = intensity as number;
  if (pct <= 25) activityCount = "2 activities (very relaxed, mostly free time)";
  else if (pct <= 40) activityCount = "3 activities (light and easy)";
  else if (pct <= 60) activityCount = "4 activities (moderate pace)";
  else if (pct <= 80) activityCount = "5-6 activities (active and packed)";
  else activityCount = "6-7 activities (maximum intensity, dawn to late night)";
  return `- Day ${dayNum}: intensity ${pct}% → ${activityCount}`;
}).join("\n")}

IMPORTANT: The user has customized the emotional pacing of their trip. Days with higher intensity should have MORE activities, MORE ambitious plans, and LONGER days. Days with lower intensity should have FEWER activities, more free time, leisurely meals, and relaxation. This overrides default pacing.`
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
      "travelTip": "Practical tip for the day",
      "companionInsight": "A 1-2 sentence personalized note explaining HOW this day was tailored to the traveler's profile or narrative arc — e.g. 'We've softened Day 2 mornings since you prefer slower starts' or 'Packed Day 3 with culture stops because museums are your top interest.' Reference SPECIFIC profile fields or arc intensity.",
      "companionInsights": {
        "morning": "1 sentence companion-memory insight for the MORNING block referencing the traveler's pace, energy tolerance, or past patterns — e.g. 'Gentle 10am start since you skipped early activities on past trips.'",
        "afternoon": "1 sentence companion-memory insight for the AFTERNOON block referencing cuisine prefs or favorite activity types.",
        "evening": "1 sentence companion-memory insight for the EVENING block referencing energy tolerance / nightlife appetite from past trips."
      }
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
${weatherContext}${placesContext}${eventsContext}${profileContext}${narrativeContext}

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
