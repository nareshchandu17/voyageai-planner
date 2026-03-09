import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const url = new URL(req.url);
    const photoReference = url.searchParams.get("photo_reference");
    const maxWidth = url.searchParams.get("maxwidth") || "400";

    if (!photoReference) {
      return new Response(JSON.stringify({ error: "photo_reference is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
    
    const photoRes = await fetch(photoUrl, { redirect: "follow" });
    
    if (!photoRes.ok) {
      throw new Error(`Photo fetch failed: ${photoRes.status}`);
    }

    const imageBuffer = await photoRes.arrayBuffer();
    const contentType = photoRes.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("Photo proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
