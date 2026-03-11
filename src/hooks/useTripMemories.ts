import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TripMemory {
  id: string;
  trip_id: string;
  user_id: string;
  type: "photo" | "journal";
  title: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

export const useTripMemories = (tripId: string | null) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<TripMemory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!user || !tripId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("trip_memories")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching memories:", error);
    else setMemories((data as any[]) || []);
    setLoading(false);
  }, [user, tripId]);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const addJournalEntry = async (title: string, content: string) => {
    if (!user || !tripId) return null;
    const { data, error } = await supabase
      .from("trip_memories")
      .insert([{ trip_id: tripId, user_id: user.id, type: "journal", title, content }] as any)
      .select()
      .single();

    if (error) { toast.error("Failed to save journal entry"); return null; }
    toast.success("Journal entry saved!");
    await fetchMemories();
    return data;
  };

  const uploadPhoto = async (file: File, caption?: string) => {
    if (!user || !tripId) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${tripId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("trip-photos")
      .upload(path, file);

    if (uploadErr) { toast.error("Failed to upload photo"); return null; }

    const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path);

    const { data, error } = await supabase
      .from("trip_memories")
      .insert([{ trip_id: tripId, user_id: user.id, type: "photo", title: caption || null, image_url: urlData.publicUrl }] as any)
      .select()
      .single();

    if (error) { toast.error("Failed to save photo record"); return null; }
    toast.success("Photo uploaded!");
    await fetchMemories();
    return data;
  };

  const deleteMemory = async (id: string) => {
    const { error } = await supabase.from("trip_memories").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    await fetchMemories();
  };

  const photos = memories.filter((m) => m.type === "photo");
  const journals = memories.filter((m) => m.type === "journal");

  return { memories, photos, journals, loading, addJournalEntry, uploadPhoto, deleteMemory, fetchMemories };
};
