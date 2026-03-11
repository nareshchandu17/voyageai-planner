import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  duration: string | null;
  budget: number;
  currency: string;
  group_size: number;
  styles: string[];
  interests: string[];
  status: "planned" | "active" | "completed";
  itinerary_data: any;
  weather_data: any;
  nearby_places: any;
  upcoming_events: any;
  destination_photos: any;
  image_url: string | null;
  travel_story: string | null;
  created_at: string;
  updated_at: string;
}

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } else {
      setTrips((data as any[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const saveTrip = async (tripData: Partial<Trip>) => {
    if (!user) {
      toast.error("Please sign in to save trips");
      return null;
    }
    const { data, error } = await supabase
      .from("trips")
      .insert([{ ...tripData, user_id: user.id }] as any)
      .select()
      .single();

    if (error) {
      console.error("Error saving trip:", error);
      toast.error("Failed to save trip");
      return null;
    }
    await fetchTrips();
    return data;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    const { error } = await supabase
      .from("trips")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", id);

    if (error) {
      console.error("Error updating trip:", error);
      toast.error("Failed to update trip");
      return false;
    }
    await fetchTrips();
    return true;
  };

  const updateStatus = async (id: string, status: "planned" | "active" | "completed") => {
    return updateTrip(id, { status });
  };

  const planned = trips.filter((t) => t.status === "planned");
  const active = trips.filter((t) => t.status === "active");
  const completed = trips.filter((t) => t.status === "completed");

  return { trips, planned, active, completed, loading, saveTrip, updateTrip, updateStatus, fetchTrips };
};
