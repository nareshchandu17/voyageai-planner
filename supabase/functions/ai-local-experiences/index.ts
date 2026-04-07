import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, interests, styles, days } = await req.json();
    if (!destination) {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a hyper-local travel expert who knows hidden gems, secret spots, and authentic local experiences that most tourists never discover. You specialize in finding places loved by residents, not guidebook recommendations.

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.

Return a JSON object with this exact structure:
{
  "categories": [
    {
      "title": "Category Name",
      "icon": "one of: food, cafe, market, viewpoint, art, nature, nightlife, culture, wellness, shopping",
      "experiences": [
        {
          "name": "Place Name",
          "description": "2-3 sentences about why this is special and what makes it a hidden gem",
          "localTip": "A specific insider tip that only locals would know",
          "bestTime": "Best time to visit (e.g. 'Early morning before 8am', 'Thursday evenings')",
          "priceLevel": "free | $ | $$ | $$$",
          "neighborhood": "The specific neighborhood/area",
          "tags": ["tag1", "tag2"],
          "confidence": 0.85
        }
      ]
    }
  ],
  "insiderNote": "A brief compelling note about what makes the local scene in this destination unique"
}

Generate 4-5 categories with 3-4 experiences each. Focus on:
- Hidden food spots (street food stalls, family-run restaurants, bakeries locals love)
- Secret viewpoints and photo spots tourists miss
- Local markets and artisan shops
- Neighborhood walks and cultural pockets
- Underground or alternative scenes
- Seasonal or time-specific experiences

Make every recommendation feel like a tip from a close local friend. Be specific with names, neighborhoods, and details.`;

    const userPrompt = `Destination: ${destination}
${interests?.length ? `Traveler interests: ${interests.join(", ")}` : ""}
${styles?.length ? `Travel style: ${styles.join(", ")}` : ""}
${days ? `Trip duration: ${days} days` : ""}

Generate hidden local experiences for this destination. Focus on authentic, off-the-beaten-path recommendations that would make a traveler feel like they have insider knowledge.`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let parsed;
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end > start) {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("local-experiences error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
