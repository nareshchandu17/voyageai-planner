import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { trip } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const days = trip.itinerary_data?.days || [];
    const daysSummary = days.map((d: any) =>
      `Day ${d.day} (${d.theme || ""}): ${(d.activities || []).map((a: any) => a.title).join(", ")}`
    ).join("\n");

    const systemPrompt = `You are a creative travel storyteller. Generate a vivid, engaging travel narrative based on the trip data provided. Write in second person ("you"). Include:
1. A compelling opening paragraph setting the scene
2. Day-by-day narrative highlights (not a list — weave it into prose)
3. Sensory details (sights, sounds, flavors, textures)
4. A reflective closing paragraph

Also provide a JSON block at the end with highlights:
{"highlights": {"bestMoment": "...", "favoritePlace": "...", "bestFood": "...", "mostSurprising": "..."}}

Output format: Write the narrative first as plain text, then on a new line output the JSON highlights block wrapped in \`\`\`json ... \`\`\``;

    const userPrompt = `Trip: ${trip.title}
Destination: ${trip.destination}
Duration: ${trip.duration || days.length + " days"}
Dates: ${trip.start_date || "unknown"} to ${trip.end_date || "unknown"}
Budget: $${trip.budget}
Travel styles: ${(trip.styles || []).join(", ")}
Interests: ${(trip.interests || []).join(", ")}
Group size: ${trip.group_size}

Itinerary:
${daysSummary}

${trip.itinerary_data?.summary || ""}`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
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
    const content = data.choices?.[0]?.message?.content || "";

    // Parse highlights JSON from content
    let highlights = null;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try { highlights = JSON.parse(jsonMatch[1]); } catch { /* ignore */ }
    }

    const narrative = content.replace(/```json[\s\S]*?```/, "").trim();

    return new Response(JSON.stringify({ narrative, highlights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Travel story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
