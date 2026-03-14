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

    const { queries } = await req.json();
    if (!queries || !Array.isArray(queries)) throw new Error("queries array is required");

    // Deduplicate queries
    const uniqueQueries = [...new Set(queries.map((q: string) => q.trim()).filter(Boolean))];

    // Fetch in parallel with concurrency limit of 5
    const results: Record<string, any> = {};
    const batchSize = 5;

    for (let i = 0; i < uniqueQueries.length; i += batchSize) {
      const batch = uniqueQueries.slice(i, i + batchSize);
      const fetches = batch.map(async (query: string) => {
        try {
          const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
          const resp = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
          });
          if (!resp.ok) return { query, photo: null };
          const data = await resp.json();
          const p = data.results?.[0];
          if (!p) return { query, photo: null };
          return {
            query,
            photo: {
              id: p.id,
              url: p.urls?.regular,
              small: p.urls?.small,
              thumb: p.urls?.thumb,
              alt: p.alt_description || p.description || query,
              credit: p.user?.name,
              creditLink: p.user?.links?.html,
            },
          };
        } catch {
          return { query, photo: null };
        }
      });

      const batchResults = await Promise.all(fetches);
      for (const r of batchResults) {
        results[r.query] = r.photo;
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unsplash batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
