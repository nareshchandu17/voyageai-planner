import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TravelerProfile {
  id: string;
  user_id: string;
  pace_preference: string;
  energy_tolerance: number;
  cuisine_preferences: string[];
  travel_style: string[];
  past_patterns: {
    avg_activities_per_day?: number;
    preferred_time_of_day?: string;
    avg_daily_budget?: number;
    skipped_activity_types?: string[];
    favorite_activity_types?: string[];
    trip_ratings?: { destination: string; rating: number }[];
    total_countries?: number;
  };
  trip_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export const useTravelerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("traveler_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) setProfile(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const upsertProfile = async (updates: Partial<TravelerProfile>) => {
    if (!user) return false;
    const { data: existing } = await supabase
      .from("traveler_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("traveler_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("user_id", user.id);
      if (error) return false;
    } else {
      const { error } = await supabase
        .from("traveler_profiles")
        .insert([{ ...updates, user_id: user.id }] as any);
      if (error) return false;
    }
    await fetchProfile();
    return true;
  };

  const learnFromTrip = async (trip: any) => {
    if (!user || !trip.itinerary_data?.days) return;
    const days = trip.itinerary_data.days;
    const totalActivities = days.reduce((sum: number, d: any) => sum + (d.activities?.length || 0), 0);
    const avgPerDay = Math.round(totalActivities / days.length);

    const activityTypes: Record<string, number> = {};
    days.forEach((d: any) => d.activities?.forEach((a: any) => {
      activityTypes[a.type] = (activityTypes[a.type] || 0) + 1;
    }));
    const sorted = Object.entries(activityTypes).sort(([, a], [, b]) => b - a);
    const favorites = sorted.slice(0, 3).map(([t]) => t);

    const currentPatterns = profile?.past_patterns || {};
    const ratings = currentPatterns.trip_ratings || [];
    ratings.push({ destination: trip.destination, rating: 4 });

    await upsertProfile({
      trip_count: (profile?.trip_count || 0) + 1,
      past_patterns: {
        ...currentPatterns,
        avg_activities_per_day: avgPerDay,
        favorite_activity_types: favorites,
        trip_ratings: ratings,
        total_countries: (currentPatterns.total_countries || 0) + 1,
        avg_daily_budget: trip.budget ? Math.round(trip.budget / days.length) : currentPatterns.avg_daily_budget,
      },
    } as any);
  };

  return { profile, loading, upsertProfile, learnFromTrip, fetchProfile };
};
