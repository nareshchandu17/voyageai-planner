import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Heart, AlertTriangle, Sparkles, MessageCircle, Send, Loader2, Split, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GroupTraveler {
  id: string;
  name: string;
  preferences: {
    interests?: string[];
    dietary?: string[];
    energy_level?: "low" | "medium" | "high";
    mobility?: string;
    budget_preference?: "budget" | "moderate" | "luxury";
  };
  compatibility_score?: number;
}

interface SplitSuggestion {
  day: number;
  rationale: string;
  groupA: { members: string[]; activity: string; time: string; location: string };
  groupB: { members: string[]; activity: string; time: string; location: string };
  reunionPlan: string;
}

interface AISuggestions {
  compatibilityScore: number;
  conflicts: { type: string; description: string; affected: string[] }[];
  splitSuggestions: SplitSuggestion[];
  groupActivities: { activity: string; why: string }[];
}

interface ChatMessage {
  id: string;
  trip_id: string;
  user_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

const interestOptions = ["Museums", "Food", "Nature", "Shopping", "Nightlife", "Adventure", "Photography", "History", "Beach", "Architecture"];

interface GroupOrchestratorProps {
  travelers: GroupTraveler[];
  onTravelersChange: (travelers: GroupTraveler[]) => void;
  tripId?: string | null;
  destination?: string;
  days?: any[];
}

export const GroupOrchestrator = ({ travelers, onTravelersChange, tripId, destination, days }: GroupOrchestratorProps) => {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInterests, setNewInterests] = useState<string[]>([]);
  const [newEnergy, setNewEnergy] = useState<"low" | "medium" | "high">("medium");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persist travelers to trip_travelers
  const persistedRef = useRef(false);
  useEffect(() => {
    if (!tripId || !user || travelers.length === 0) return;
    // Save each new traveler to DB (idempotent-ish by id check)
    const sync = async () => {
      const { data: existing } = await supabase.from("trip_travelers").select("id").eq("trip_id", tripId);
      const existingIds = new Set((existing || []).map((r: any) => r.id));
      const toInsert = travelers.filter(t => !existingIds.has(t.id));
      if (toInsert.length > 0) {
        await supabase.from("trip_travelers").insert(toInsert.map(t => ({
          id: t.id,
          trip_id: tripId,
          name: t.name,
          preferences: t.preferences as any,
        })) as any);
      }
    };
    sync();
  }, [travelers, tripId, user]);

  // Load travelers from DB on mount
  useEffect(() => {
    if (!tripId || persistedRef.current) return;
    persistedRef.current = true;
    supabase
      .from("trip_travelers")
      .select("*")
      .eq("trip_id", tripId)
      .then(({ data }) => {
        if (data && data.length > 0 && travelers.length === 0) {
          onTravelersChange(data.map((r: any) => ({
            id: r.id, name: r.name, preferences: r.preferences || {}, compatibility_score: r.compatibility_score,
          })));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // Realtime chat subscription
  useEffect(() => {
    if (!tripId || !showChat) return;
    supabase
      .from("trip_messages")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as any[]) || []));

    const channel = supabase
      .channel(`trip-messages-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` }, (payload) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === (payload.new as any).id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId, showChat]);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const addTraveler = () => {
    if (!newName.trim()) return;
    const traveler: GroupTraveler = {
      id: crypto.randomUUID(),
      name: newName.trim().slice(0, 80),
      preferences: { interests: newInterests, energy_level: newEnergy },
    };
    onTravelersChange([...travelers, traveler]);
    setNewName("");
    setNewInterests([]);
    setShowAdd(false);
  };

  const removeTraveler = async (id: string) => {
    onTravelersChange(travelers.filter(t => t.id !== id));
    if (tripId) await supabase.from("trip_travelers").delete().eq("id", id);
  };

  const fetchAISuggestions = useCallback(async () => {
    if (travelers.length < 2) return;
    setAiLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-group-suggestions`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ travelers, days: days || [], destination: destination || "" }),
      });
      if (!res.ok) throw new Error(`AI suggestions failed (${res.status})`);
      const data = await res.json();
      setAiSuggestions(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch group suggestions");
    } finally {
      setAiLoading(false);
    }
  }, [travelers, days, destination]);

  const sendMessage = async () => {
    if (!tripId || !user || !draft.trim()) return;
    const content = draft.trim().slice(0, 1000);
    setDraft("");
    setSending(true);
    const senderName = (user.user_metadata?.full_name as string | undefined) || (user.email?.split("@")[0]) || "You";
    const { error } = await supabase.from("trip_messages").insert([{
      trip_id: tripId, user_id: user.id, sender_name: senderName, content,
    }] as any);
    if (error) toast.error("Failed to send message");
    setSending(false);
  };

  // Local quick conflict view
  const allInterests = travelers.flatMap(t => t.preferences.interests || []);
  const interestCounts: Record<string, number> = {};
  allInterests.forEach(i => { interestCounts[i] = (interestCounts[i] || 0) + 1; });
  const overlaps = Object.entries(interestCounts).filter(([, c]) => c > 1).sort(([, a], [, b]) => b - a);
  const energyMismatch = travelers.length > 1 && new Set(travelers.map(t => t.preferences.energy_level || "medium")).size > 1;

  const localScore = travelers.length > 1 ? Math.min(100, overlaps.length > 0 ? 60 + overlaps.length * 10 : 40) : 100;
  const displayScore = aiSuggestions?.compatibilityScore ?? localScore;

  if (travelers.length === 0 && !showAdd) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Group Travel</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Travelers
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Add co-travelers to get AI compatibility insights, split-day suggestions, and group chat.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Group Dynamic Orchestration</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{travelers.length} travelers</span>
        </div>
        <div className="flex items-center gap-2">
          {tripId && (
            <Button variant="outline" size="sm" onClick={() => setShowChat(s => !s)} className="gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {showChat ? "Hide" : "Chat"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Traveler cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {travelers.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-secondary/50 rounded-xl p-3">
            <button onClick={() => removeTraveler(t.id)} className="absolute top-2 right-2 p-0.5 hover:bg-destructive/10 rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground",
                i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-accent" : "bg-purple-500")}>{t.name[0]?.toUpperCase()}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{t.preferences.energy_level} energy</p>
              </div>
            </div>
            {t.preferences.interests?.length ? (
              <div className="flex flex-wrap gap-1">
                {t.preferences.interests.slice(0, 4).map(int => (
                  <span key={int} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{int}</span>
                ))}
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Compatibility insights */}
      {travelers.length > 1 && (
        <div className="space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Group Compatibility</span>
              {aiSuggestions && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">AI</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${displayScore}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
              <span className="text-sm font-bold text-foreground">{displayScore}%</span>
            </div>
          </div>

          {overlaps.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-foreground">Shared Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {overlaps.map(([interest, count]) => (
                  <span key={interest} className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">{interest} ({count}/{travelers.length})</span>
                ))}
              </div>
            </div>
          )}

          {(energyMismatch || aiSuggestions?.conflicts?.length) && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold text-foreground">Conflicts Detected</span>
              </div>
              {aiSuggestions?.conflicts?.length ? aiSuggestions.conflicts.map((c, i) => (
                <div key={i} className="text-[11px] text-foreground/80">
                  <span className="font-medium capitalize text-yellow-600">{c.type}:</span> {c.description}
                  {c.affected?.length ? <span className="text-muted-foreground"> — {c.affected.join(", ")}</span> : null}
                </div>
              )) : (
                <p className="text-[10px] text-muted-foreground">Energy levels differ. Run AI analysis for tailored split-day suggestions.</p>
              )}
            </div>
          )}

          {/* AI suggestions trigger */}
          <Button onClick={fetchAISuggestions} disabled={aiLoading} variant="default" size="sm" className="w-full gap-2">
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {aiLoading ? "Analyzing group dynamic…" : aiSuggestions ? "Refresh AI Suggestions" : "Get AI Split-Day Suggestions"}
          </Button>

          {/* Split-day suggestions */}
          <AnimatePresence>
            {aiSuggestions?.splitSuggestions?.length ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Split className="w-3.5 h-3.5 text-primary" /> Split-Day Plans</h6>
                {aiSuggestions.splitSuggestions.map((s, i) => (
                  <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">Day {s.day}</span>
                      <span className="text-[10px] text-muted-foreground italic">{s.rationale}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[s.groupA, s.groupB].map((g, gi) => (
                        <div key={gi} className={cn("rounded-lg p-2.5", gi === 0 ? "bg-primary/5 border border-primary/20" : "bg-accent/5 border border-accent/20")}>
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">{g.members.join(" & ")} • {g.time}</p>
                          <p className="text-xs font-medium text-foreground">{g.activity}</p>
                          <p className="text-[10px] text-muted-foreground">{g.location}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-foreground/70"><span className="font-semibold">Reunite:</span> {s.reunionPlan}</p>
                  </div>
                ))}

                {aiSuggestions.groupActivities?.length ? (
                  <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3">
                    <p className="text-[11px] font-semibold text-foreground mb-2">Whole-Group Activities</p>
                    <ul className="space-y-1">
                      {aiSuggestions.groupActivities.map((a, i) => (
                        <li key={i} className="text-[11px] text-foreground/80">
                          <span className="font-medium text-green-600">{a.activity}:</span> {a.why}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && tripId && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Group Chat</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Realtime · synced across devices</span>
              </div>
              <div className="h-56 overflow-y-auto bg-secondary/30 rounded-lg p-3 space-y-2 mb-2">
                {messages.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground text-center py-8">No messages yet — start the conversation.</p>
                ) : messages.map(m => (
                  <div key={m.id} className={cn("flex flex-col", m.user_id === user?.id ? "items-end" : "items-start")}>
                    <span className="text-[9px] text-muted-foreground mb-0.5">{m.sender_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <div className={cn("max-w-[80%] rounded-xl px-3 py-1.5 text-xs", m.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground")}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Message your group…"
                  maxLength={1000}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm" onClick={sendMessage} disabled={sending || !draft.trim()} className="gap-1">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border pt-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Traveler name"
              maxLength={80}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground mb-3"
            />
            <p className="text-xs text-muted-foreground mb-2">Interests:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {interestOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setNewInterests(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])}
                  className={cn("text-[10px] px-2 py-1 rounded-full border transition-colors",
                    newInterests.includes(opt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary")}
                >{opt}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-2">Energy level:</p>
            <div className="flex gap-2 mb-3">
              {(["low", "medium", "high"] as const).map(e => (
                <button
                  key={e}
                  onClick={() => setNewEnergy(e)}
                  className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors capitalize",
                    newEnergy === e ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary")}
                >{e}</button>
              ))}
            </div>
            <Button size="sm" onClick={addTraveler} disabled={!newName.trim()} className="w-full">Add Traveler</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
