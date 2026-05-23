import { useState, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Camera, PenLine, Star, Sparkles, MapPin, Heart, Upload,
  X, ChevronDown, ChevronUp, Loader2, Calendar, ThumbsUp,
  Trash2, BookOpen, Image as ImageIcon, Compass, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrips, Trip } from "@/hooks/useTrips";
import { useTripMemories } from "@/hooks/useTripMemories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Section Wrapper ── */
const SectionPanel = ({
  icon: Icon, gradient, title, subtitle, expanded, onToggle, children,
}: {
  icon: React.ElementType; gradient: string; title: string; subtitle: string;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-left">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-body">{subtitle}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>
    </button>
    {expanded && (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.4, ease: "easeOut" }} className="px-5 sm:px-6 pb-6">
        {children}
      </motion.div>
    )}
  </motion.div>
);

/* ── Trip Selector when no tripId is provided ── */
const TripSelector = ({ trips }: { trips: Trip[] }) => (
  <div className="min-h-screen bg-background pt-24 pb-20">
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Heart className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Trip Memories</h1>
        <p className="text-muted-foreground font-body">Pick a completed trip to view photos, journals, and AI highlights.</p>
      </div>

      {trips.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Compass className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No completed trips yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Mark a trip as complete from your dashboard to start building memories.</p>
          <Link to="/dashboard"><Button variant="ocean">Go to Dashboard</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((t) => (
            <Link key={t.id} to={`/memories?tripId=${t.id}`} className="group glass-card overflow-hidden hover-lift">
              <div className="h-32 relative overflow-hidden">
                <img src={t.image_url || (t.destination_photos as any)?.[0]?.url || "/placeholder.svg"} alt={t.destination} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display font-bold text-white text-lg">{t.title}</h3>
                  <p className="text-white/70 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.destination}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.start_date ? new Date(t.start_date).toLocaleDateString("en", { month: "short", year: "numeric" }) : "—"}</span>
                <ChevronRight className="w-4 h-4 text-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
);

const TripMemoriesView = ({ trip }: { trip: Trip }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, journals, uploadPhoto, addJournalEntry, deleteMemory, loading } = useTripMemories(trip.id);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("photos");

  const toggle = (s: string) => setExpandedSection((p) => (p === s ? null : s));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) await uploadPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    await addJournalEntry(newNote.title, newNote.content);
    setNewNote({ title: "", content: "" });
    setShowNoteForm(false);
  };

  const generateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-travel-story", { body: { trip } });
      if (error) throw error;
      setAiSummary(data);
      setShowAiSummary(true);
      if (data?.narrative) {
        await supabase.from("trips").update({ travel_story: data.narrative } as any).eq("id", trip.id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate summary");
    }
    setGeneratingSummary(false);
  };

  const dateRange = useMemo(() => {
    if (!trip.start_date) return "";
    const s = new Date(trip.start_date);
    const e = trip.end_date ? new Date(trip.end_date) : null;
    const fmt = (d: Date) => d.toLocaleDateString("en", { month: "short", day: "numeric" });
    return e ? `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}` : fmt(s);
  }, [trip.start_date, trip.end_date]);

  const heroImage = trip.image_url || (trip.destination_photos as any)?.[0]?.url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative h-[380px] sm:h-[440px] overflow-hidden">
        <motion.img src={heroImage} alt={trip.destination} className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-background" />
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 sm:px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <Link to="/memories" className="inline-flex items-center gap-1.5 text-white/70 text-xs hover:text-white mb-4 transition-colors">
              ← All memories
            </Link>
            <span className="inline-flex items-center gap-1.5 gradient-sunset text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-4 shadow-md">
              <Star className="w-3 h-3" /> {trip.status === "completed" ? "Trip Complete" : "In Progress"}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">{trip.destination}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/60 text-sm font-body">
              {dateRange && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{dateRange}</span>}
              {dateRange && <span className="w-1 h-1 rounded-full bg-white/30" />}
              <span>{trip.group_size} travelers</span>
              {trip.styles?.length > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
              {trip.styles?.length > 0 && <span>{trip.styles.join(" · ")}</span>}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20 max-w-4xl">
        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          {[
            { icon: Camera, label: "Photos", value: photos.length, gradient: "gradient-ocean" },
            { icon: PenLine, label: "Notes", value: journals.length, gradient: "gradient-sunset" },
            { icon: MapPin, label: "Days", value: (trip.itinerary_data as any)?.days?.length || 0, gradient: "gradient-ocean" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 sm:p-5 text-center hover-lift">
              <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                <stat.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <div className="space-y-5">
          {/* AI Summary */}
          <SectionPanel icon={Sparkles} gradient="gradient-sunset" title="AI Trip Summary" subtitle="Get an AI-generated overview" expanded={expandedSection === "ai"} onToggle={() => toggle("ai")}>
            {!showAiSummary && !generatingSummary && !trip.travel_story && (
              <div className="text-center py-10">
                <div className="w-20 h-20 rounded-3xl gradient-sunset flex items-center justify-center mx-auto mb-5 animate-float shadow-lg">
                  <Sparkles className="w-9 h-9 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Ready to relive your trip?</h3>
                <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
                  AI will craft a personalized narrative of your journey using your itinerary.
                </p>
                <Button variant="sunset" size="lg" className="shadow-lg" onClick={generateSummary}>
                  <Sparkles className="w-4 h-4" /> Generate Trip Summary
                </Button>
              </div>
            )}

            {generatingSummary && (
              <div className="text-center py-14">
                <Loader2 className="w-14 h-14 mx-auto text-[hsl(var(--sunset))] animate-spin mb-5" />
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Crafting your story…</h3>
              </div>
            )}

            {(showAiSummary || trip.travel_story) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-[hsl(var(--sunset-glow))] rounded-2xl p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">✨ Your Journey</h3>
                  <p className="text-sm text-foreground font-body leading-relaxed whitespace-pre-line">
                    {aiSummary?.narrative || trip.travel_story}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={generateSummary} disabled={generatingSummary}>
                  <Sparkles className="w-3.5 h-3.5" /> Regenerate
                </Button>
              </motion.div>
            )}
          </SectionPanel>

          {/* Photos */}
          <SectionPanel icon={Camera} gradient="gradient-ocean" title="Trip Photos" subtitle={`${photos.length} photo${photos.length === 1 ? "" : "s"}`} expanded={expandedSection === "photos"} onToggle={() => toggle("photos")}>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {photos.map((photo, i) => (
                  <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md">
                    <img src={photo.image_url!} alt={photo.title || "Trip photo"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-end">
                      <div className="w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <span className="text-xs text-primary-foreground font-medium truncate font-body">{photo.title || "Photo"}</span>
                        <button onClick={() => deleteMemory(photo.id)} className="p-1.5 bg-destructive/80 rounded-lg hover:bg-destructive transition-colors">
                          <X className="w-3 h-3 text-primary-foreground" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-[hsl(var(--ocean))]/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-[hsl(var(--ocean))] transition-colors">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium font-body">Upload</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground font-body mb-6 max-w-xs mx-auto">Upload your favorite moments from the trip.</p>
                <Button variant="ocean" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Upload Photos
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </SectionPanel>

          {/* Notes */}
          <SectionPanel icon={PenLine} gradient="gradient-ocean" title="Travel Notes" subtitle={`${journals.length} journal entries`} expanded={expandedSection === "notes"} onToggle={() => toggle("notes")}>
            {!showNoteForm && (
              <Button variant="outline" size="sm" className="mb-4" onClick={() => setShowNoteForm(true)}>
                <PenLine className="w-4 h-4" /> Write a Note
              </Button>
            )}

            {showNoteForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/50 rounded-2xl p-5 mb-4 space-y-3">
                <input type="text" placeholder="Note title…" value={newNote.title} onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ocean))] text-sm font-body" />
                <textarea placeholder="Write about your experience…" value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))} rows={4} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ocean))] text-sm font-body resize-none" />
                <div className="flex gap-2">
                  <Button variant="ocean" size="sm" onClick={addNote}>Save Note</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowNoteForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}

            {journals.length > 0 ? (
              <div className="space-y-3">
                {journals.map((note, i) => (
                  <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="group bg-secondary/50 rounded-2xl p-5 relative hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[hsl(var(--ocean-lighter))] text-[hsl(var(--ocean))] rounded-full px-2.5 py-0.5 font-medium font-body">
                        {new Date(note.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </span>
                      <h4 className="font-medium text-sm text-foreground">{note.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-body whitespace-pre-line">{note.content}</p>
                    <button onClick={() => deleteMemory(note.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">No notes yet</h3>
                <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">Capture your thoughts and favorite moments.</p>
              </div>
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
};

const TripMemories = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { user } = useAuth();
  const { trips, completed, active, loading } = useTrips();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center glass-card p-12 max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Sign in to view memories</h2>
          <p className="text-muted-foreground mb-6">Your trip photos and journal entries are private to you.</p>
          <Link to="/auth"><Button variant="ocean" size="lg">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tripId) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center glass-card p-10 max-w-md">
            <Compass className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Trip not found</h2>
            <Link to="/memories"><Button variant="ocean" className="mt-4">View all memories</Button></Link>
          </div>
        </div>
      );
    }
    return <TripMemoriesView trip={trip} />;
  }

  // No tripId — show selector of completed + active trips
  const eligible = [...completed, ...active];
  return <TripSelector trips={eligible} />;
};

export default TripMemories;
