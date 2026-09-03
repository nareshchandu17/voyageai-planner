import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      destination,
      dayNumber,
      date,
      theme,
      currentActivities = [],
      otherDayTitles = [],
      interests = [],
      styles = [],
      groupSize = 1,
      dailyBudget,
      currency = "USD",
      instruction = "",
      constraints = {},
    } = await req.json();

    const {
      budgetCap = null,
      crowdLevel = "any",
      focus = "any",
      note = "",
    } = (constraints || {}) as {
      budgetCap?: number | null;
      crowdLevel?: string;
      focus?: string;
      note?: string;
    };

    if (!destination) {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const count = Math.max(currentActivities.length || 5, 4);

    const systemPrompt = `You are an elite local travel planner. You rewrite ONE single day of an existing itinerary.
Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "day": ${dayNumber ?? 1},
  "date": ${JSON.stringify(date ?? null)},
  "theme": "short evocative theme for the day",
  "dailyBudget": number,
  "activities": [
    {
      "time": "09:00 AM",
      "title": "Real, specific place name",
      "description": "1-2 vivid sentences",
      "location": "Neighborhood, City",
      "address": "Full street address",
      "duration": "1.5 hours",
      "cost": number,
      "type": "attraction | restaurant | hotel | transport",
      "whyVisit": "one line",
         "localSecret": "insider tip"
    }
   ],
   "reservations": [
     { "what": "Restaurant / tour / ticket to book", "leadTime": "Book 3 days ahead", "urgency": "low|medium|high", "how": "Official website / phone / app", "bookingUrl": "https://official-booking-page.example", "bookingProvider": "Official site" }
   ],
   "costBreakdown": { "activities": number, "food": number, "transport": number, "extras": number, "total": number, "currency": "${currency}" }
}
Rules:
- Exactly ${count} activities, chronological, geographically clustered to minimise travel.
- Use REAL, verifiable places in ${destination}. Never invent venues.
- Replace the previous suggestions with FRESH alternatives — do not repeat the current activities or any place used on other days.
- Include at least one meal stop and one hidden gem.
- For every reservation, include a valid direct HTTPS bookingUrl to the official venue, ticket seller, or trusted booking provider, plus bookingProvider. Never invent a URL; omit a reservation if no reliable direct booking page can be identified.
${budgetCap ? `- HARD CONSTRAINT: the sum of all "cost" values MUST stay at or below ${budgetCap} ${currency} for the day. Prefer free/low-cost options to stay under it.` : ""}
${crowdLevel && crowdLevel !== "any" ? `- Crowd preference: ${crowdLevel === "quiet" ? "quiet, low-tourist, off-the-beaten-path spots; avoid famous crowded landmarks" : crowdLevel === "lively" ? "lively, buzzing, popular places with energy and people" : "a balanced mix of iconic spots and calmer places"}.` : ""}
${focus && focus !== "any" ? `- Focus: ${focus === "outdoor" ? "mostly OUTDOOR activities (parks, walks, viewpoints, markets)" : focus === "indoor" ? "mostly INDOOR activities (museums, galleries, cafés, workshops) — good for bad weather" : "a mix of indoor and outdoor"}.` : ""}
${note ? `- Additional user preference to honour strictly: ${note}` : ""}`;

    const userPrompt = `Destination: ${destination}
Day ${dayNumber} ${date ? `(${date})` : ""}${theme ? ` — current theme: ${theme}` : ""}
Group size: ${groupSize}. Styles: ${styles.join(", ") || "general"}. Interests: ${interests.join(", ") || "general"}.
Daily budget: ${budgetCap ? `${budgetCap} ${currency} (STRICT CAP)` : dailyBudget ? `${dailyBudget} ${currency}` : "flexible"}.
Crowd level preference: ${crowdLevel}. Indoor/outdoor focus: ${focus}.

CURRENT activities on this day (replace them all with better, different options):
${currentActivities.map((a: any) => `- ${a.time || ""} ${a.title || ""} (${a.type || "attraction"})`).join("\n") || "- none"}

Places already used on OTHER days (do NOT reuse):
${otherDayTitles.slice(0, 60).map((t: string) => `- ${t}`).join("\n") || "- none"}

${note ? `User note for this day: ${note}` : ""}
${instruction ? `User request for this day: ${instruction}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      const message =
        response.status === 429
          ? "Too many requests right now — try again in a moment."
          : response.status === 402
            ? "AI credits exhausted. Please add credits to continue."
            : `AI gateway error [${response.status}]`;
      return new Response(JSON.stringify({ error: message }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let raw: string = data.choices?.[0]?.message?.content ?? "";
    raw = raw.trim();
    if (raw.startsWith("```json")) raw = raw.slice(7);
    else if (raw.startsWith("```")) raw = raw.slice(3);
    if (raw.endsWith("```")) raw = raw.slice(0, -3);
    raw = raw.trim();

    let day: any = null;
    try {
      day = JSON.parse(raw);
    } catch {
      const s = raw.indexOf("{");
      const e = raw.lastIndexOf("}");
      if (s !== -1 && e > s) {
        try { day = JSON.parse(raw.slice(s, e + 1)); } catch { /* ignore */ }
      }
    }

    if (!day || !Array.isArray(day.activities) || day.activities.length === 0) {
      return new Response(JSON.stringify({ error: "Could not generate a new day. Please retry." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ day }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("regenerate-day error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
