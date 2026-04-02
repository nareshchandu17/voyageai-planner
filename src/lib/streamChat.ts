const PLANNER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-travel-planner`;
const WEATHER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather`;
const GOOGLE_MAPS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-maps`;
const TICKETMASTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ticketmaster`;
const UNSPLASH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsplash`;

export interface LocationPoint {
  lat: number;
  lng: number;
  address?: string;
}

export type TravelMode = "walking" | "transit" | "driving";

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  transit?: {
    line: string;
    vehicle: string;
    departureStop: string;
    arrivalStop: string;
    numStops: number;
  };
}

export interface DirectionsDetail {
  mode: TravelMode;
  durationText: string;
  distanceText: string;
  startAddress: string;
  endAddress: string;
  steps: DirectionStep[];
}

export interface RouteEstimate {
  recommendedMode: TravelMode;
  durationText: string;
  distanceText: string;
  modes: Partial<Record<TravelMode, { durationText: string; distanceText: string; durationValue: number }>>;
}

export interface TripParams {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  styles: string[];
  groupSize: number;
  interests: string[];
}

export async function fetchWeather(destination: string, startDate: string, endDate: string) {
  const resp = await fetch(WEATHER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ destination, startDate, endDate }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Weather fetch failed" }));
    throw new Error(err.error || "Weather fetch failed");
  }
  return resp.json();
}

export function getPlacePhotoUrl(photoReference: string, maxWidth = 400): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-maps-photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`;
}

export async function fetchNearbyPlaces(destination: string) {
  try {
    const resp = await fetch(GOOGLE_MAPS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action: "search", query: `top attractions in ${destination}` }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return (data.results || []).slice(0, 10).map((p: any) => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      userRatingsTotal: p.user_ratings_total,
      types: p.types?.slice(0, 3),
      location: p.geometry?.location,
      photoReference: p.photos?.[0]?.photo_reference,
      placeId: p.place_id,
    }));
  } catch {
    return null;
  }
}

export async function fetchEvents(destination: string, startDate: string, endDate: string) {
  try {
    const resp = await fetch(TICKETMASTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ destination, startDate, endDate, size: 8 }),
    });
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export async function fetchLocationCoordinates(query: string): Promise<LocationPoint | null> {
  try {
    const resp = await fetch(GOOGLE_MAPS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action: "geocode", query }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    const match = data.results?.[0];
    const point = match?.geometry?.location;
    if (!point?.lat || !point?.lng) return null;

    return {
      lat: point.lat,
      lng: point.lng,
      address: match.formatted_address,
    };
  } catch {
    return null;
  }
}

export async function fetchLocationCoordinatesBatch(
  queries: string[],
): Promise<Record<string, LocationPoint>> {
  const uniqueQueries = [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
  const results = await Promise.all(
    uniqueQueries.map(async (query) => ({
      query,
      point: await fetchLocationCoordinates(query),
    })),
  );

  return results.reduce<Record<string, LocationPoint>>((acc, item) => {
    if (item.point) {
      acc[item.query] = item.point;
    }
    return acc;
  }, {});
}

export async function fetchRouteEstimate(
  origin: LocationPoint,
  destination: LocationPoint,
): Promise<RouteEstimate | null> {
  try {
    const resp = await fetch(GOOGLE_MAPS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action: "route_estimates", origin, destination }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function fetchDirectionsSteps(
  origin: LocationPoint,
  destination: LocationPoint,
  mode: TravelMode,
): Promise<DirectionsDetail | null> {
  try {
    const resp = await fetch(GOOGLE_MAPS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action: "directions_steps", origin, destination, mode }),
    });
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export async function fetchRouteEstimatesBatch(
  pairs: Array<{ key: string; origin: LocationPoint; destination: LocationPoint }>,
): Promise<Record<string, RouteEstimate>> {
  const results = await Promise.all(
    pairs.map(async (pair) => ({
      key: pair.key,
      route: await fetchRouteEstimate(pair.origin, pair.destination),
    })),
  );

  return results.reduce<Record<string, RouteEstimate>>((acc, item) => {
    if (item.route) {
      acc[item.key] = item.route;
    }
    return acc;
  }, {});
}

export async function streamItinerary({
  params,
  weatherData,
  nearbyPlaces,
  upcomingEvents,
  onDelta,
  onDone,
  onError,
}: {
  params: TripParams;
  weatherData?: any;
  nearbyPlaces?: any;
  upcomingEvents?: any;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(PLANNER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ ...params, weatherForecast: weatherData, nearbyPlaces, upcomingEvents }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "AI planner failed" }));
      onError(err.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Unknown error");
  }
}

const UNSPLASH_BATCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsplash-batch`;

export async function fetchUnsplashBatch(queries: string[]): Promise<Record<string, any> | null> {
  try {
    const resp = await fetch(UNSPLASH_BATCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ queries }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.results || null;
  } catch {
    return null;
  }
}

export async function fetchUnsplashPhotos(query: string, count = 5): Promise<any[] | null> {
  try {
    const resp = await fetch(UNSPLASH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ query, count }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.photos || null;
  } catch {
    return null;
  }
}

export function parseItineraryJSON(raw: string): any | null {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in the string
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
