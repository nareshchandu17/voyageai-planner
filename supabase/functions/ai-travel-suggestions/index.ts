import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { completedTrips } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const tripsContext = (completedTrips || []).map((t: any) =>
      `- ${t.destination} (${t.duration || "unknown duration"}, budget $${t.budget}, styles: ${(t.styles || []).join(", ")}, interests: ${(t.interests || []).join(", ")})`
    ).join("\n");

    const systemPrompt = `You are a travel recommendation expert. Based on the user's completed trips, suggest 4 next destinations they would love. Consider their travel styles, interests, budget range, and trip patterns.

Return ONLY a JSON array with this structure:
[
  {
    "destination": "City, Country",
    "reason": "1-2 sentence personalized reason why they'd love it",
    "matchScore": 85,
    "bestSeason": "Spring/Summer/Fall/Winter",
    "estimatedBudget": "$X,XXX",
    "highlights": ["highlight1", "highlight2", "highlight3"]
  }
]

Make suggestions diverse — mix similar vibes with exciting new experiences. Only output valid JSON.`;

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
          { role: "user", content: `My completed trips:\n${tripsContext}\n\nSuggest 4 next destinations.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error [${response.status}]`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response
    let suggestions = [];
    try {
      let cleaned = content.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        suggestions = JSON.parse(cleaned.slice(start, end + 1));
      }
    } catch { /* return empty */ }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Suggestions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
