import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate } = await req.json();
    const API_KEY = Deno.env.get("OPENWEATHERMAP_API_KEY");
    if (!API_KEY) throw new Error("OPENWEATHERMAP_API_KEY is not configured");

    // Geocode the destination
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoRes.json();
    if (!geoData.length) {
      return new Response(JSON.stringify({ error: "Destination not found", forecast: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lon, name, country } = geoData[0];

    // Get 5-day/3-hour forecast (free tier)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastRes.json();

    if (!forecastRes.ok) {
      throw new Error(`Weather API error [${forecastRes.status}]: ${JSON.stringify(forecastData)}`);
    }

    // Group by day and pick midday reading
    const dailyMap: Record<string, any> = {};
    for (const item of forecastData.list) {
      const date = item.dt_txt.split(" ")[0];
      const hour = parseInt(item.dt_txt.split(" ")[1].split(":")[0]);
      if (!dailyMap[date] || Math.abs(hour - 12) < Math.abs(parseInt(dailyMap[date].dt_txt.split(" ")[1]) - 12)) {
        dailyMap[date] = item;
      }
    }

    const forecast = Object.entries(dailyMap).map(([date, item]: [string, any]) => ({
      date,
      temp: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      humidity: item.main.humidity,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      wind: Math.round(item.wind.speed * 3.6), // m/s to km/h
      rain: item.weather[0].main === "Rain",
    }));

    return new Response(JSON.stringify({
      location: { name, country, lat, lon },
      forecast,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
