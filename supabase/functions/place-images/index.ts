import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ImageSource = "google_places" | "wikimedia" | "unsplash" | "openverse";

type ImageCandidate = {
  id: string;
  url: string;
  small: string;
  thumb: string;
  alt: string;
  credit: string;
  creditLink?: string;
  source: ImageSource;
  relevanceScore: number;
};

type CacheRow = {
  query_key: string;
  search_query: string;
  image_url: string;
  small_url: string | null;
  thumb_url: string | null;
  alt_text: string | null;
  credit: string | null;
  credit_link: string | null;
  source: string;
  relevance_score: number;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");

const sourcePriority: Record<ImageSource, number> = {
  google_places: 1,
  wikimedia: 0.78,
  unsplash: 0.72,
  openverse: 0.58,
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeQuery = (query: string) =>
  query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const queryTokens = (query: string) =>
  new Set(normalizeQuery(query).split(" ").filter((token) => token.length > 2));

const relevance = (query: string, text: string, source: ImageSource) => {
  const wanted = queryTokens(query);
  const found = queryTokens(text);
  const overlap = wanted.size
    ? [...wanted].filter((token) => found.has(token)).length / wanted.size
    : 0;
  return Math.min(0.99, sourcePriority[source] * 0.7 + overlap * 0.3);
};

const cleanText = (value: unknown, fallback: string, max = 220) =>
  String(value || fallback)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

async function fromGooglePlaces(query: string): Promise<ImageCandidate[]> {
  if (!GOOGLE_MAPS_API_KEY) return [];
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).flatMap((place: any) => {
      const photo = place.photos?.[0];
      if (!photo?.photo_reference) return [];
      const photoUrl = `${SUPABASE_URL}/functions/v1/google-maps-photo?photo_reference=${encodeURIComponent(photo.photo_reference)}&maxwidth=1200`;
      const label = `${place.name || ""} ${place.formatted_address || ""}`;
      return [{
        id: `google_${place.place_id || place.name}`,
        url: photoUrl,
        small: `${SUPABASE_URL}/functions/v1/google-maps-photo?photo_reference=${encodeURIComponent(photo.photo_reference)}&maxwidth=640`,
        thumb: `${SUPABASE_URL}/functions/v1/google-maps-photo?photo_reference=${encodeURIComponent(photo.photo_reference)}&maxwidth=320`,
        alt: cleanText(place.name, query),
        credit: "Google Places",
        creditLink: place.place_id ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(place.place_id)}` : undefined,
        source: "google_places" as const,
        relevanceScore: relevance(query, label, "google_places"),
      }];
    });
  } catch {
    return [];
  }
}

async function fromWikimedia(query: string): Promise<ImageCandidate[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=${encodeURIComponent(`filetype:bitmap ${query}`)}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1200&origin=*`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) as any[] : [];
    return pages.flatMap((page: any) => {
      const info = page.imageinfo?.[0];
      if (!info?.url || info.mime?.startsWith("video/")) return [];
      const metadata = info.extmetadata || {};
      const label = `${page.title || ""} ${metadata.ImageDescription?.value || ""}`;
      return [{
        id: `wikimedia_${page.pageid}`,
        url: info.thumburl || info.url,
        small: info.thumburl || info.url,
        thumb: info.thumburl || info.url,
        alt: cleanText(metadata.ImageDescription?.value || page.title, query),
        credit: cleanText(metadata.Artist?.value, "Wikimedia Commons", 100),
        creditLink: `https://commons.wikimedia.org/?curid=${page.pageid}`,
        source: "wikimedia" as const,
        relevanceScore: relevance(query, label, "wikimedia"),
      }];
    });
  } catch {
    return [];
  }
}

async function fromUnsplash(query: string): Promise<ImageCandidate[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape&content_filter=high`;
    const response = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).flatMap((photo: any) => {
      if (!photo.urls?.regular) return [];
      const label = `${photo.alt_description || ""} ${photo.description || ""}`;
      return [{
        id: `unsplash_${photo.id}`,
        url: photo.urls.regular,
        small: photo.urls.small || photo.urls.regular,
        thumb: photo.urls.thumb || photo.urls.small || photo.urls.regular,
        alt: cleanText(photo.alt_description || photo.description, query),
        credit: cleanText(photo.user?.name, "Unsplash", 100),
        creditLink: photo.user?.links?.html,
        source: "unsplash" as const,
        relevanceScore: relevance(query, label, "unsplash"),
      }];
    });
  } catch {
    return [];
  }
}

async function fromOpenverse(query: string): Promise<ImageCandidate[]> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=6&license_type=all&mature=false&aspect_ratio=wide`;
    const response = await fetch(url, { headers: { "User-Agent": "voyageai-place-images" } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).flatMap((photo: any) => {
      if (!photo.url) return [];
      return [{
        id: `openverse_${photo.id}`,
        url: photo.url,
        small: photo.thumbnail || photo.url,
        thumb: photo.thumbnail || photo.url,
        alt: cleanText(photo.title, query),
        credit: cleanText(photo.creator || photo.source, "Openverse", 100),
        creditLink: photo.foreign_landing_url,
        source: "openverse" as const,
        relevanceScore: relevance(query, `${photo.title || ""} ${photo.tags || ""}`, "openverse"),
      }];
    });
  } catch {
    return [];
  }
}

const chooseBest = (query: string, candidates: ImageCandidate[]): ImageCandidate | null => {
  const seen = new Set<string>();
  return candidates
    .filter((candidate) => {
      const key = candidate.url.split("?")[0];
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)[0] || null;
};

const toCacheRow = (queryKey: string, searchQuery: string, image: ImageCandidate): CacheRow => ({
  query_key: queryKey,
  search_query: searchQuery,
  image_url: image.url,
  small_url: image.small,
  thumb_url: image.thumb,
  alt_text: image.alt,
  credit: image.credit,
  credit_link: image.creditLink || null,
  source: image.source,
  relevance_score: image.relevanceScore,
});

const fromCacheRow = (row: CacheRow) => ({
  id: `cached_${row.query_key}`,
  url: row.image_url,
  small: row.small_url || row.image_url,
  thumb: row.thumb_url || row.small_url || row.image_url,
  alt: row.alt_text || row.search_query,
  credit: row.credit || row.source,
  creditLink: row.credit_link || undefined,
  source: row.source,
  relevanceScore: row.relevance_score,
});

async function resolveQuery(searchQuery: string): Promise<ImageCandidate | null> {
  const sources = await Promise.all([
    fromGooglePlaces(searchQuery),
    fromWikimedia(searchQuery),
    fromUnsplash(searchQuery),
    fromOpenverse(searchQuery),
  ]);
  return chooseBest(searchQuery, sources.flat());
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Image service is not configured" }, 500);
    }

    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) return jsonResponse({ error: "Authentication required" }, 401);

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return jsonResponse({ error: "Authentication required" }, 401);

    const body = await req.json().catch(() => null);
    const rawQueries = body?.queries;
    if (!Array.isArray(rawQueries)) return jsonResponse({ error: "queries must be an array" }, 400);

    const destination = typeof body.destination === "string" ? body.destination.trim().slice(0, 180) : "";
    const queries = [...new Set(rawQueries
      .filter((query: unknown): query is string => typeof query === "string")
      .map((query: string) => query.trim().slice(0, 180))
      .filter(Boolean))].slice(0, 30);
    if (!queries.length) return jsonResponse({ results: {}, fetched: 0, cached: 0 });

    const requested = queries.map((query) => {
      const searchQuery = destination && !normalizeQuery(query).includes(normalizeQuery(destination))
        ? `${query}, ${destination}`
        : query;
      return { query, searchQuery, queryKey: normalizeQuery(searchQuery) };
    });

    const database = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const keys = requested.map((item) => item.queryKey);
    const { data: cachedRows, error: cacheError } = await database
      .from("place_image_cache")
      .select("query_key, search_query, image_url, small_url, thumb_url, alt_text, credit, credit_link, source, relevance_score")
      .in("query_key", keys);
    if (cacheError) console.error("Place image cache read failed:", cacheError.message);

    const cachedByKey = new Map<string, CacheRow>((cachedRows || []).map((row) => [row.query_key, row as CacheRow]));
    const results: Record<string, unknown> = {};
    const missing = requested.filter((item) => !cachedByKey.has(item.queryKey));

    for (const item of requested.filter((entry) => cachedByKey.has(entry.queryKey))) {
      results[item.query] = fromCacheRow(cachedByKey.get(item.queryKey) as CacheRow);
      void database.from("place_image_cache").update({ last_used_at: new Date().toISOString() }).eq("query_key", item.queryKey);
    }

    const batchSize = 4;
    for (let index = 0; index < missing.length; index += batchSize) {
      const batch = missing.slice(index, index + batchSize);
      const resolved = await Promise.all(batch.map(async (item) => ({ item, image: await resolveQuery(item.searchQuery) })));
      const rows = resolved
        .filter((entry): entry is { item: typeof entry.item; image: ImageCandidate } => !!entry.image)
        .map(({ item, image }) => toCacheRow(item.queryKey, item.searchQuery, image));

      if (rows.length) {
        const { error: writeError } = await database.from("place_image_cache").upsert(rows, { onConflict: "query_key" });
        if (writeError) console.error("Place image cache write failed:", writeError.message);
      }

      for (const { item, image } of resolved) {
        results[item.query] = image || null;
      }
    }

    return jsonResponse({ results, fetched: missing.length, cached: requested.length - missing.length });
  } catch (error) {
    console.error("Place image resolver error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});