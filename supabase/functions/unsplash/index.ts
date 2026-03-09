import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!UNSPLASH_ACCESS_KEY) throw new Error("UNSPLASH_ACCESS_KEY not configured");

    const { query, count = 5, orientation = "landscape" } = await req.json();
    if (!query) throw new Error("query is required");

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Unsplash API error:", resp.status, text);
      throw new Error(`Unsplash API error [${resp.status}]`);
    }

    const data = await resp.json();
    const photos = (data.results || []).map((p: any) => ({
      id: p.id,
      url: p.urls?.regular,
      small: p.urls?.small,
      thumb: p.urls?.thumb,
      alt: p.alt_description || p.description || query,
      credit: p.user?.name,
      creditLink: p.user?.links?.html,
    }));

    return new Response(JSON.stringify({ photos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unsplash function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
