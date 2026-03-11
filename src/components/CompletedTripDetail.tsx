import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trip } from "@/hooks/useTrips";
import { useTripMemories } from "@/hooks/useTripMemories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles, Camera, PenLine, Upload, X, Loader2, Heart,
  MapPin, Star, Utensils, BookOpen, ChevronRight, Plus,
  Calendar, DollarSign, Clock, Trash2, Image as ImageIcon
} from "lucide-react";

interface Props {
  trip: Trip;
  onStoryGenerated: (tripId: string, story: string) => void;
}

const CompletedTripDetail = ({ trip, onStoryGenerated }: Props) => {
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyHighlights, setStoryHighlights] = useState<any>(null);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [activeSection, setActiveSection] = useState<"story" | "photos" | "journal">("story");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { photos, journals, loading: memoriesLoading, addJournalEntry, uploadPhoto, deleteMemory } = useTripMemories(trip.id);

  const generateStory = async () => {
    setGeneratingStory(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-travel-story", {
        body: { trip },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const narrative = data.narrative || "Your journey was unforgettable.";
      if (data.highlights) setStoryHighlights(data.highlights);

      // Save to DB
      await supabase.from("trips").update({ travel_story: narrative } as any).eq("id", trip.id);
      onStoryGenerated(trip.id, narrative);
      toast.success("Travel story generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate story");
    }
    setGeneratingStory(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      await uploadPhoto(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleJournalSubmit = async () => {
    if (!journalTitle.trim() || !journalContent.trim()) return;
    await addJournalEntry(journalTitle, journalContent);
    setJournalTitle("");
    setJournalContent("");
    setShowJournalForm(false);
  };

  const travelStory = (trip as any).travel_story;

  const sections = [
    { key: "story" as const, label: "AI Story", icon: Sparkles },
    { key: "photos" as const, label: `Photos (${photos.length})`, icon: Camera },
    { key: "journal" as const, label: `Journal (${journals.length})`, icon: PenLine },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === s.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* AI Travel Story */}
        {activeSection === "story" && (
          <motion.div key="story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {travelStory ? (
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-sm text-foreground">AI Travel Story</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{travelStory}</p>
                </div>

                {storyHighlights?.highlights && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Best Moment", value: storyHighlights.highlights.bestMoment, icon: Heart, color: "text-accent" },
                      { label: "Favorite Place", value: storyHighlights.highlights.favoritePlace, icon: MapPin, color: "text-primary" },
                      { label: "Best Food", value: storyHighlights.highlights.bestFood, icon: Utensils, color: "text-accent" },
                      { label: "Most Surprising", value: storyHighlights.highlights.mostSurprising, icon: Star, color: "text-primary" },
                    ].filter(h => h.value).map((h, i) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h.icon className={`w-3 h-3 ${h.color}`} />
                          <span className="text-[10px] text-muted-foreground font-semibold">{h.label}</span>
                        </div>
                        <p className="text-xs text-foreground font-medium">{h.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="ghost" size="sm" className="w-full" onClick={generateStory} disabled={generatingStory}>
                  {generatingStory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Regenerate Story
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-display font-bold text-foreground mb-2">Generate Your Travel Story</h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  Let AI craft a vivid narrative of your journey with personalized highlights.
                </p>
                <Button variant="ocean" onClick={generateStory} disabled={generatingStory}>
                  {generatingStory ? <><Loader2 className="w-4 h-4 animate-spin" /> Crafting story...</> : <><Sparkles className="w-4 h-4" /> Generate Story</>}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Photos */}
        {activeSection === "photos" && (
          <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> Upload Photos
            </Button>

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={photo.image_url!} alt={photo.title || "Trip photo"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button onClick={() => deleteMemory(photo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 text-destructive-foreground p-1.5 rounded-full">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {photo.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-[10px] text-white">{photo.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No photos yet. Upload your travel memories!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Journal */}
        {activeSection === "journal" && (
          <motion.div key="journal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {!showJournalForm ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowJournalForm(true)}>
                <Plus className="w-3.5 h-3.5" /> New Journal Entry
              </Button>
            ) : (
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <Input
                  placeholder="Entry title..."
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  className="bg-background"
                />
                <Textarea
                  placeholder="Write about your experience..."
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  rows={4}
                  className="bg-background"
                />
                <div className="flex gap-2">
                  <Button variant="ocean" size="sm" className="flex-1" onClick={handleJournalSubmit} disabled={!journalTitle.trim() || !journalContent.trim()}>
                    Save Entry
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowJournalForm(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {journals.length > 0 ? (
              <div className="space-y-2">
                {journals.map((entry) => (
                  <div key={entry.id} className="bg-secondary/50 rounded-xl p-4 group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-display font-bold text-sm text-foreground">{entry.title}</h5>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <button onClick={() => deleteMemory(entry.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{entry.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No journal entries yet. Start documenting your memories!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletedTripDetail;
