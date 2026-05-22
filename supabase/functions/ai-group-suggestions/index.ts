import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Traveler {
  name: string;
  preferences: {
    interests?: string[];
    energy_level?: "low" | "medium" | "high";
    dietary?: string[];
    mobility?: string;
    budget_preference?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const travelers: Traveler[] = body.travelers || [];
    const days: any[] = body.days || [];
    const destination: string = body.destination || "";

    if (!Array.isArray(travelers) || travelers.length < 2) {
      return new Response(
        JSON.stringify({ error: "Need at least 2 travelers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const travelerSummary = travelers.map((t, i) =>
      `${i + 1}. ${t.name} — energy: ${t.preferences.energy_level || "medium"}, interests: ${(t.preferences.interests || []).join(", ") || "none specified"}${t.preferences.dietary?.length ? `, dietary: ${t.preferences.dietary.join(", ")}` : ""}`
    ).join("\n");

    const daySummary = (days || []).slice(0, 5).map((d: any) =>
      `Day ${d.day} (${d.theme || "exploration"}): ${(d.activities || []).map((a: any) => `${a.title} [${a.type}]`).join(" • ")}`
    ).join("\n");

    const systemPrompt = `You are a group travel mediator. Given multiple travelers with different preferences and energy levels, you suggest SPLIT-DAY plans where groups divide for part of a day to satisfy everyone, then reunite.

Return ONLY a JSON object:
{
  "compatibilityScore": 0-100,
  "conflicts": [
    { "type": "energy" | "interest" | "dietary" | "pace", "description": "string", "affected": ["traveler name", ...] }
  ],
  "splitSuggestions": [
    {
      "day": 1,
      "rationale": "Why this split helps the group",
      "groupA": { "members": ["name", ...], "activity": "What they do", "time": "morning|afternoon|evening", "location": "string" },
      "groupB": { "members": ["name", ...], "activity": "What they do", "time": "morning|afternoon|evening", "location": "string" },
      "reunionPlan": "Where and when the group meets back up (specific restaurant, landmark, or time)"
    }
  ],
  "groupActivities": [
    { "activity": "string", "why": "Why this works for the whole group" }
  ]
}`;

    const userPrompt = `Destination: ${destination}

Travelers:
${travelerSummary}

Itinerary days (first 5):
${daySummary || "No itinerary yet — focus on conflicts and group activities."}

Identify real conflicts (energy mismatches, conflicting interests, dietary issues). Suggest 2-3 split-day plans on days where the conflict is sharpest. Suggest 3-4 activities that work for the whole group. Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error [${response.status}]`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = { compatibilityScore: 50, conflicts: [], splitSuggestions: [], groupActivities: [] }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-group-suggestions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
