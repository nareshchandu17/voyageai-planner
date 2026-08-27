import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate, budget, styles, groupSize, interests, weatherForecast, nearbyPlaces, upcomingEvents, travelerProfile, narrativeIntensities, planningMode } = await req.json();

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

    const planningModeMap: Record<string, string> = {
      smart_balanced: `PLANNING MODE: SMART BALANCED (default)
- Balance exploration with rest. Avoid overload.
- Mix famous landmarks with hidden local gems (roughly 60/40).
- Optimize pacing so no day feels rushed or empty.
- 4-5 activities per day, with at least one rest window.`,
      deep_exploration: `PLANNING MODE: DEEP EXPLORATION
- This trip is long enough to go beyond top-10 lists. Avoid repeating the same kinds of attractions.
- Build THEMATIC days (one neighborhood / one district / one historic era per day).
- Reduce cross-city movement; cluster activities by geography.
- Include lesser-known museums, residential districts, specialty markets, slow walks.
- Never produce a "top attractions repeated differently" itinerary.`,
      fast_highlights: `PLANNING MODE: FAST HIGHLIGHTS
- Short or aggressive trip. Prioritize the MAJOR must-see attractions only.
- Compress the schedule — 6-7 activities per day, minimal downtime.
- Skip slow/local experiences in favor of iconic landmarks.
- Optimize transit routes to maximize coverage.`,
      adaptive_flow: `PLANNING MODE: ADAPTIVE FLOW (premium)
- Build FLEXIBLE days with optional alternative activities (provide 1 alt per main activity in the tip field, e.g. "Alt: ...").
- Adapt pacing dynamically based on energy curve — front-load mornings, lighter evenings.
- Include buffer windows (free time, café breaks, "wander hour") between major stops.
- Feel like a human travel strategist made this — confident, considered, never rigid.`,
      local_immersion: `PLANNING MODE: LOCAL IMMERSION (premium)
- Prioritize LOCAL CULTURE over tourist circuits.
- Favor neighborhood cafes, family-run eateries, local markets, residential walks, community events.
- Avoid tourist-heavy repetition — at most 1 marquee landmark per day.
- Include slow experiences: long meals, neighborhood lingering, conversations with locals (where appropriate).`,
    };
    const planningModeContext = planningMode && planningModeMap[planningMode]
      ? `\n\n${planningModeMap[planningMode]}\n\nIMPORTANT: This mode shapes the WHOLE trip. Apply it consistently across every day.`
      : "";


    const systemPrompt = `You are VoyageAI — a world-class travel concierge combining a luxury tour planner, professional photographer, food critic, logistics expert, and seasoned local guide. You produce itineraries that exceed Google Travel, TripAdvisor, Wanderlog, Roadtrippers, and Sygic Travel in depth, personalization, and visual richness.

YOU MUST:
- Recommend ONLY REAL, verifiable places (existing restaurants, attractions, hotels, neighborhoods). Never invent names.
- Generate EVERY day of the trip in full detail — no truncation, no "continue later", no placeholders.
- Mix iconic must-sees with HIDDEN GEMS (local secrets, underrated spots, neighborhood walks, family-run eateries).
- Optimize routing to minimize backtracking — cluster activities geographically per day.
- Adapt the plan to weather, opening hours, local events, crowd levels, and the traveler's profile.
- Provide premium concierge-level depth: WHY visit each place, LOCAL secrets, PHOTOGRAPHY tips, COMMON tourist mistakes, ACCESSIBILITY notes.
- For EVERY place include a vivid, search-friendly imageQuery (e.g. "Louvre Museum Paris pyramid sunset" — not just "museum").

OUTPUT FORMAT: Return a single valid JSON object with this exact structure (additional fields encouraged where useful):

{
  "title": "Trip title",
  "summary": "2-3 sentence trip summary",
  "totalBudgetEstimate": number,
  "currency": "USD",
  "tripDNA": [
    { "trait": "Culture", "weight": 80 },
    { "trait": "Food", "weight": 65 },
    { "trait": "Nature", "weight": 40 },
    { "trait": "Adventure", "weight": 30 },
    { "trait": "Relaxation", "weight": 55 }
  ],
  "signatureExperiences": [
    { "name": "The one experience that defines this trip", "day": 1, "why": "Why it is unforgettable", "imageQuery": "specific visual query" }
  ],
  "moneySavers": [
    { "tip": "Specific, actionable saving tactic for this destination", "savings": "~$40" }
  ],
  "localPhrases": [
    { "phrase": "Local-language phrase", "meaning": "English meaning", "pronunciation": "phonetic spelling" }
  ],
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
      "total": number,
      "tiers": {
        "budget": { "daily": number, "total": number, "notes": "Backpacker tips" },
        "midRange": { "daily": number, "total": number, "notes": "Comfort-traveler tips" },
        "luxury": { "daily": number, "total": number, "notes": "Premium upgrade tips" }
      },
      "savingsTips": ["Specific savings opportunity 1", "Tip 2", "Tip 3"]
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
    "hotelRecommendations": [
      {
        "name": "Real hotel name",
        "category": "budget|midRange|luxury|boutique|family|resort",
        "neighborhood": "Area",
        "priceRange": "$-$$$$",
        "rating": 4.5,
        "amenities": ["WiFi", "Pool", "Breakfast"],
        "whyStay": "Why this hotel fits the trip",
        "nearbyAttractions": ["Attraction 1", "Attraction 2"],
        "imageQuery": "hotel name city exterior"
      }
    ],
    "itineraryPreview": [
      { "day": 1, "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"] }
    ]
  },
  "duringTrip": {
    "localTransport": {
      "overview": "Transport system overview",
      "options": [
        { "type": "Metro/Bus/Taxi/Walk/Bike/RideShare/Rental", "description": "How it works", "costRange": "$X-$Y", "tip": "Practical tip", "appNames": ["App1"] }
      ],
      "travelCard": "Recommended travel card or pass if available"
    },
    "restaurants": [
      {
        "name": "Real restaurant name",
        "cuisine": "Cuisine type",
        "category": "street_food|fine_dining|local_cuisine|cafe|dessert|rooftop|vegetarian|vegan",
        "priceRange": "$-$$$$",
        "location": "Neighborhood/area",
        "famousFor": "Signature dish or specialty",
        "mealType": "breakfast/lunch/dinner",
        "vegetarianOptions": true,
        "veganOptions": false,
        "menuHighlights": ["Dish 1", "Dish 2"],
        "tip": "Insider tip",
        "imageQuery": "restaurant name dish cuisine"
      }
    ],
    "experiences": [
      {
        "name": "Experience name",
        "type": "hidden_gem|festival|photo_spot|activity|nightlife|local_market|neighborhood_walk",
        "description": "What makes it special",
        "location": "Where to find it",
        "bestTime": "When to go",
        "cost": "Free/$X",
        "tip": "Insider tip",
        "imageQuery": "specific scene query"
      }
    ],
    "hiddenGems": [
      { "name": "Local secret", "neighborhood": "Area", "why": "Why locals love it", "tip": "How to find it", "imageQuery": "..." }
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
      "theme": "Day theme (e.g. 'Old Town & Riverside Stroll')",
      "neighborhoodFocus": "Main neighborhood/district for the day (for geographic clustering)",
      "imageQuery": "specific landmark or scene for this day",
      "weather": { "condition": "Sunny/Rainy/etc", "temp": "25°C", "advisory": "optional weather note" },
      "activities": [
        {
          "time": "09:00",
          "title": "Activity / Place name",
          "description": "Brief 1-2 sentence description",
          "location": "Real place name, neighborhood",
          "address": "Street address if known",
          "duration": "2 hours",
          "cost": 0,
          "type": "attraction|restaurant|transport|free|shopping|nightlife|photo_spot|hidden_gem",
          "category": "Museum|Landmark|Park|Market|Religious|Historical|Nature|Adventure|Family|Luxury|Cultural|Photography",
          "rating": 4.6,
          "reviewCount": 12000,
          "openingHours": "09:00-18:00 (closed Tue)",
          "ticketPrice": "$15 adult / $8 child / free under 6",
          "bestTimeToVisit": "Early morning to avoid crowds",
          "crowdLevel": "low|moderate|high",
          "hiddenGem": false,
          "whyVisit": "1-sentence concierge pitch — what makes this special",
          "localSecret": "Insider knowledge most tourists miss",
          "photoTip": "Best angle / lighting / spot for photos",
          "commonMistake": "Frequent tourist mistake to avoid",
          "accessibility": "Wheelchair / stroller / mobility notes",
           "tip": "Optional general insider tip",
           "sensory": "ONE evocative sensory line — what you hear/smell/feel standing there (max 18 words)",
           "avgVisitTime": "75 min (typical visitor dwell time)",
           "nearbyRestStop": "Real nearby cafe/bench/rest spot with a 1-phrase reason (e.g. 'Café Verlet, 3 min walk — best espresso break')",
           "imageQuery": "specific place name + visual cue for image search"
        }
      ],
      "meals": {
        "breakfast": { "name": "Real restaurant name", "cuisine": "Type", "priceRange": "$-$$$$", "location": "Neighborhood", "famousFor": "Dish", "vegetarianOptions": true, "imageQuery": "restaurant name or signature dish" },
        "lunch": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "...", "famousFor": "...", "vegetarianOptions": true, "imageQuery": "..." },
        "dinner": { "name": "...", "cuisine": "...", "priceRange": "...", "location": "...", "famousFor": "...", "vegetarianOptions": true, "imageQuery": "..." }
      },
      "hiddenGems": [
        { "name": "Local-only spot", "why": "Why it's special", "imageQuery": "..." }
      ],
      "transportPlan": "1-sentence summary of how to move between today's stops (e.g. 'Walk the Old Town loop, metro line 2 back to hotel')",
      "dailyBudget": number,
      "travelTip": "Practical tip for the day",
      "companionInsight": "A 1-2 sentence personalized note explaining HOW this day was tailored to the traveler's profile or narrative arc. Reference SPECIFIC profile fields or arc intensity.",
      "companionInsights": {
        "morning": "1 sentence companion-memory insight for the MORNING block.",
        "afternoon": "1 sentence companion-memory insight for the AFTERNOON block.",
        "evening": "1 sentence companion-memory insight for the EVENING block."
      }
    }
  ],
  "warnings": ["any important travel warnings"]
}

QUALITY BAR:
- Each day should follow a Morning → Afternoon → Evening → (optional Night) rhythm with 4-7 activities depending on intensity.
- Cluster activities geographically. Do NOT zig-zag across the city.
- Include at least 1 hiddenGem per day.
- Every imageQuery should be specific enough to return a recognizable photo (place name + visual cue).
- Restaurant recommendations must be real establishments known for the cuisine.

ONLY output the JSON object, nothing else. Ensure all data is realistic and verified.`;

    // Compute exact day count from date range so the model never under-generates
    let tripDays = 0;
    try {
      if (startDate && endDate) {
        const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
        tripDays = Math.max(1, Math.round(ms / 86400000) + 1);
      }
    } catch { /* noop */ }

    const dayCountInstruction = tripDays > 0
      ? `\n\n🚨 CRITICAL DAY COUNT REQUIREMENT 🚨
This trip is EXACTLY ${tripDays} day${tripDays > 1 ? "s" : ""} long (from ${startDate} to ${endDate}, inclusive).
The "days" array in your JSON output MUST contain EXACTLY ${tripDays} entries — one object per day, numbered day: 1 through day: ${tripDays}, with sequential dates from ${startDate} to ${endDate}.
Likewise, "beforeTrip.itineraryPreview" MUST contain EXACTLY ${tripDays} entries.
Do NOT truncate. Do NOT stop early. Do NOT summarize remaining days. Generate every single day in full detail.
If you are running long, shorten activity descriptions but NEVER drop days. All ${tripDays} days are mandatory.`
      : "";

    const userPrompt = `Plan a trip to ${destination}
Dates: ${startDate} to ${endDate}${tripDays > 0 ? ` (${tripDays} days total)` : ""}
Budget: $${budget} per person
Group size: ${groupSize} travelers
Travel styles: ${styles?.join(", ") || "Any"}
Interests: ${interests?.join(", ") || "General sightseeing"}
${weatherContext}${placesContext}${eventsContext}${profileContext}${narrativeContext}${planningModeContext}${dayCountInstruction}

Create a comprehensive two-phase travel plan:
1. BEFORE TRIP: Include destination overview, weather forecast, budget estimation, packing checklist, visa/documents info, and itinerary preview${tripDays > 0 ? ` (exactly ${tripDays} days)` : ""}.
2. DURING TRIP: Include local transport guide, restaurant recommendations (6-8 restaurants), unique experiences (5-6), safety information, hotel tips, and navigation guide with key routes.
3. DAYS: Generate exactly ${tripDays || "the correct number of"} day objects in the "days" array. Each day must have activities, meals, dailyBudget, theme, and companionInsights.

All recommendations must be REAL, verified places and establishments. If local events are listed above, incorporate relevant ones.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // NOTE: do NOT switch to a reasoning model (e.g. gemini-2.5-pro).
        // Reasoning models spend the entire token budget on hidden reasoning
        // tokens and emit empty content → itinerary JSON never streams.
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        max_tokens: 32000,
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
