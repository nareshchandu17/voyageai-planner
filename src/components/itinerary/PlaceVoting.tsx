import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  vote: 1 | -1;
}

interface Props {
  tripId: string;
  placeKey: string;
  placeName: string;
  dayNum?: number;
  compact?: boolean;
}

export const PlaceVoting = ({ tripId, placeKey, placeName, dayNum, compact }: Props) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("trip_place_votes")
      .select("id, voter_id, voter_name, vote")
      .eq("trip_id", tripId)
      .eq("place_key", placeKey);
    setVotes((data as any[]) || []);
  }, [tripId, placeKey]);

  useEffect(() => {
    if (!tripId || !placeKey) return;
    load();
    const channel = supabase
      .channel(`votes-${tripId}-${placeKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_place_votes", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const row = (payload.new || payload.old) as any;
          if (row?.place_key === placeKey) load();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tripId, placeKey, load]);

  const myVote = user ? votes.find((v) => v.voter_id === user.id)?.vote : undefined;
  const ups = votes.filter((v) => v.vote === 1).length;
  const downs = votes.filter((v) => v.vote === -1).length;

  const cast = async (value: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to vote"); return; }
    setLoading(true);
    const voterName = user.name || user.email?.split("@")[0] || "Traveler";
    if (myVote === value) {
      await supabase.from("trip_place_votes")
        .delete()
        .eq("trip_id", tripId).eq("place_key", placeKey).eq("voter_id", user.id);
    } else {
      await supabase.from("trip_place_votes")
        .upsert([{
          trip_id: tripId, place_key: placeKey, place_name: placeName,
          day_num: dayNum ?? null, voter_id: user.id, voter_name: voterName, vote: value,
        }] as any, { onConflict: "trip_id,place_key,voter_id" });
    }
    setLoading(false);
    load();
  };

  const upNames = votes.filter((v) => v.vote === 1).map((v) => v.voter_name).join(", ");
  const downNames = votes.filter((v) => v.vote === -1).map((v) => v.voter_name).join(", ");

  return (
    <div className={cn("inline-flex items-center gap-1", compact && "text-[10px]")} onClick={(e) => e.stopPropagation()}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => cast(1, e)}
        disabled={loading}
        title={ups ? `${ups} like${ups > 1 ? "s" : ""}: ${upNames}` : "Like this place"}
        className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-medium transition-colors",
          myVote === 1
            ? "bg-green-500/15 text-green-600 border-green-500/30"
            : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
        )}
      >
        {loading && myVote !== -1 ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
        {ups > 0 && <span>{ups}</span>}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => cast(-1, e)}
        disabled={loading}
        title={downs ? `${downs} dislike${downs > 1 ? "s" : ""}: ${downNames}` : "Pass on this place"}
        className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-medium transition-colors",
          myVote === -1
            ? "bg-red-500/15 text-red-600 border-red-500/30"
            : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
        )}
      >
        <ThumbsDown className="w-3 h-3" />
        {downs > 0 && <span>{downs}</span>}
      </motion.button>
    </div>
  );
};

export default PlaceVoting;
