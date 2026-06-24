import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Photo = {
  id: string;
  url: string;
  small: string;
  thumb: string;
  alt: string;
  credit: string;
  creditLink?: string;
  source: "unsplash" | "wikimedia" | "openverse" | "pexels" | "pixabay";
};

const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const PIXABAY_API_KEY = Deno.env.get("PIXABAY_API_KEY");

async function fromUnsplash(query: string, count: number): Promise<Photo[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&content_filter=high`;
    const r = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.results || []).map((p: any) => ({
      id: `u_${p.id}`,
      url: p.urls?.regular,
      small: p.urls?.small,
      thumb: p.urls?.thumb,
      alt: p.alt_description || p.description || query,
      credit: p.user?.name || "Unsplash",
      creditLink: p.user?.links?.html,
      source: "unsplash" as const,
    })).filter((p: Photo) => p.url);
  } catch { return []; }
}

async function fromPexels(query: string, count: number): Promise<Photo[]> {
  if (!PEXELS_API_KEY) return [];
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.photos || []).map((p: any) => ({
      id: `p_${p.id}`,
      url: p.src?.large || p.src?.original,
      small: p.src?.medium,
      thumb: p.src?.small,
      alt: p.alt || query,
      credit: p.photographer || "Pexels",
      creditLink: p.photographer_url,
      source: "pexels" as const,
    })).filter((p: Photo) => p.url);
  } catch { return []; }
}

async function fromPixabay(query: string, count: number): Promise<Photo[]> {
  if (!PIXABAY_API_KEY) return [];
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${Math.max(3, count)}&safesearch=true`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.hits || []).slice(0, count).map((p: any) => ({
      id: `px_${p.id}`,
      url: p.largeImageURL || p.webformatURL,
      small: p.webformatURL,
      thumb: p.previewURL,
      alt: p.tags || query,
      credit: p.user || "Pixabay",
      creditLink: p.pageURL,
      source: "pixabay" as const,
    })).filter((p: Photo) => p.url);
  } catch { return []; }
}

async function fromWikimedia(query: string, count: number): Promise<Photo[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=${count}&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&origin=*`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) as any[] : [];
    return pages.map((page: any) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata || {};
      return {
        id: `w_${page.pageid}`,
        url: info.thumburl || info.url,
        small: info.thumburl || info.url,
        thumb: info.thumburl || info.url,
        alt: (meta.ImageDescription?.value || page.title || query).replace(/<[^>]+>/g, "").slice(0, 200),
        credit: (meta.Artist?.value || "Wikimedia Commons").replace(/<[^>]+>/g, "").slice(0, 80),
        creditLink: `https://commons.wikimedia.org/?curid=${page.pageid}`,
        source: "wikimedia" as const,
      };
    }).filter((p): p is Photo => !!p && !!p.url);
  } catch { return []; }
}

async function fromOpenverse(query: string, count: number): Promise<Photo[]> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${count}&license_type=all&mature=false&aspect_ratio=wide`;
    const r = await fetch(url, { headers: { "User-Agent": "lovable-travel-planner" } });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.results || []).map((p: any) => ({
      id: `o_${p.id}`,
      url: p.url,
      small: p.thumbnail || p.url,
      thumb: p.thumbnail || p.url,
      alt: p.title || query,
      credit: p.creator || p.source || "Openverse",
      creditLink: p.foreign_landing_url,
      source: "openverse" as const,
    })).filter((p: Photo) => p.url);
  } catch { return []; }
}

function dedupe(photos: Photo[]): Photo[] {
  const seen = new Set<string>();
  const out: Photo[] = [];
  for (const p of photos) {
    const key = (p.url || "").split("?")[0];
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

async function aggregate(query: string, perQuery: number): Promise<Photo[]> {
  // Run primary sources in parallel, then fallback if empty.
  const primary = await Promise.all([
    fromUnsplash(query, perQuery),
    fromPexels(query, perQuery),
  ]);
  let combined = dedupe([...primary[0], ...primary[1]]);
  if (combined.length < perQuery) {
    const fallback = await Promise.all([
      fromWikimedia(query, perQuery),
      fromOpenverse(query, perQuery),
      fromPixabay(query, perQuery),
    ]);
    combined = dedupe([...combined, ...fallback[0], ...fallback[1], ...fallback[2]]);
  }
  return combined.slice(0, perQuery);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { queries, perQuery = 1 } = await req.json();
    if (!queries || !Array.isArray(queries)) throw new Error("queries array is required");

    const uniqueQueries = [...new Set(queries.map((q: string) => (q || "").trim()).filter(Boolean))];

    const results: Record<string, any> = {};
    const galleries: Record<string, Photo[]> = {};
    const batchSize = 5;

    for (let i = 0; i < uniqueQueries.length; i += batchSize) {
      const batch = uniqueQueries.slice(i, i + batchSize);
      const fetches = batch.map(async (query) => {
        const photos = await aggregate(query, Math.max(1, Math.min(8, perQuery)));
        return { query, photos };
      });
      const batchResults = await Promise.all(fetches);
      for (const { query, photos } of batchResults) {
        results[query] = photos[0] || null;
        galleries[query] = photos;
      }
    }

    return new Response(JSON.stringify({ results, galleries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Image batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
