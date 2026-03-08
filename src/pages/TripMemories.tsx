import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Camera, PenLine, Star, Sparkles, MapPin, Heart, Upload,
  X, ChevronDown, ChevronUp, Loader2, Calendar, ThumbsUp,
  Trash2, BookOpen, Image as ImageIcon
} from "lucide-react";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";

// --- Types ---
interface PlaceRating {
  id: string;
  name: string;
  type: string;
  rating: number;
  note: string;
}

interface TravelNote {
  id: string;
  date: string;
  title: string;
  content: string;
}

interface UploadedPhoto {
  id: string;
  url: string;
  caption: string;
}

// --- Mock data ---
const tripInfo = {
  destination: "Tokyo, Japan",
  dates: "Mar 15–22, 2026",
  travelers: 2,
  style: "Culture & Food",
  heroImage: tokyoImg,
};

const initialRatings: PlaceRating[] = [
  { id: "1", name: "Senso-ji Temple", type: "visit", rating: 5, note: "Breathtaking at sunrise, less crowded early morning" },
  { id: "2", name: "Ichiran Ramen", type: "food", rating: 5, note: "Best tonkotsu ramen I've ever had" },
  { id: "3", name: "teamLab Borderless", type: "activity", rating: 4, note: "Mind-blowing digital art, book tickets in advance" },
  { id: "4", name: "Shibuya Crossing", type: "activity", rating: 4, note: "Iconic, but very crowded during rush hour" },
  { id: "5", name: "Tsukiji Outer Market", type: "food", rating: 5, note: "Fresh sushi for breakfast — a must-do" },
  { id: "6", name: "Meiji Shrine", type: "visit", rating: 4, note: "Peaceful oasis in the heart of Harajuku" },
];

const initialNotes: TravelNote[] = [
  { id: "1", date: "Mar 15", title: "First impressions", content: "Tokyo is overwhelming in the best way. The train system is incredibly efficient, and everyone is so polite. Got lost in Shinjuku station for 20 minutes but it was an adventure!" },
  { id: "2", date: "Mar 17", title: "Hidden gem discovered", content: "Found a tiny ramen shop in a back alley of Golden Gai with only 6 seats. The owner has been making ramen for 40 years. No English menu — just pointed and got the best meal of the trip." },
  { id: "3", date: "Mar 20", title: "Day trip to Kamakura", content: "The Great Buddha was majestic but Hokoku-ji bamboo grove stole the show. Had matcha tea while overlooking the bamboo — pure serenity." },
];

const aiSummary = {
  title: "Your Tokyo Trip Highlights",
  highlights: [
    { emoji: "🏯", text: "Visited 12 unique locations across 3 districts" },
    { emoji: "🍜", text: "Tried 8 different Japanese cuisines" },
    { emoji: "🚃", text: "Traveled 147km on the metro system" },
    { emoji: "📸", text: "Captured memories at 6 iconic landmarks" },
  ],
  bestMemory: "Your visit to the hidden ramen shop in Golden Gai — a truly authentic experience that most tourists never discover.",
  favoriteFood: "Ichiran Ramen and Tsukiji Market fresh sushi topped your culinary adventure.",
  recommendation: "Based on your love for culture and food, we recommend **Kyoto** for your next trip — ancient temples, kaiseki dining, and geisha districts await.",
  mood: "Your trip had a perfect balance of cultural immersion and culinary exploration. You rated 83% of places 4+ stars!",
};

const mockPhotos: UploadedPhoto[] = [
  { id: "p1", url: tokyoImg, caption: "Tokyo Tower at sunset" },
  { id: "p2", url: baliImg, caption: "Morning at the market" },
  { id: "p3", url: parisImg, caption: "Evening vibes" },
];

// --- Star Rating Component ---
const StarRating = ({
  rating,
  onRate,
  size = "sm",
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: "sm" | "lg";
}) => {
  const s = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onRate?.(i)}
          className={onRate ? "cursor-pointer" : "cursor-default"}
          disabled={!onRate}
        >
          <Star
            className={`${s} transition-colors ${
              i <= rating ? "fill-[hsl(var(--sunset))] text-[hsl(var(--sunset))]" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ── Section Wrapper ── */
const SectionPanel = ({
  icon: Icon,
  gradient,
  title,
  subtitle,
  id,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  gradient: string;
  title: string;
  subtitle: string;
  id: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="glass-card overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-secondary/30 transition-colors"
    >
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
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </button>
    {expanded && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-5 sm:px-6 pb-6"
      >
        {children}
      </motion.div>
    )}
  </motion.div>
);

// --- Main Page ---
const TripMemories = () => {
  const [ratings, setRatings] = useState(initialRatings);
  const [notes, setNotes] = useState(initialNotes);
  const [photos, setPhotos] = useState(mockPhotos);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("photos");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateRating = (id: string, newRating: number) => {
    setRatings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rating: newRating } : r))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [
        ...prev,
        { id: `p${Date.now()}-${Math.random()}`, url, caption: file.name.replace(/\.[^.]+$/, "") },
      ]);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const today = new Date();
    setNotes((prev) => [
      {
        id: `n${Date.now()}`,
        date: today.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        title: newNote.title,
        content: newNote.content,
      },
      ...prev,
    ]);
    setNewNote({ title: "", content: "" });
    setShowNoteForm(false);
  };

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const generateSummary = () => {
    setGeneratingSummary(true);
    setTimeout(() => {
      setGeneratingSummary(false);
      setShowAiSummary(true);
    }, 2500);
  };

  const avgRating = (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1);
  const toggle = (section: string) => setExpandedSection((prev) => (prev === section ? null : section));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative h-[380px] sm:h-[440px] overflow-hidden">
        <motion.img
          src={tripInfo.heroImage}
          alt={tripInfo.destination}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-background" />

        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 sm:px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-1.5 gradient-sunset text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-4 shadow-md">
              <Star className="w-3 h-3" /> Trip Complete
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              {tripInfo.destination}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/60 text-sm font-body">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{tripInfo.dates}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{tripInfo.travelers} travelers</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{tripInfo.style}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20 max-w-4xl">
        {/* ── Stats ── */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {[
            { icon: Camera, label: "Photos", value: photos.length, gradient: "gradient-ocean" },
            { icon: Star, label: "Avg Rating", value: avgRating, gradient: "gradient-sunset" },
            { icon: PenLine, label: "Notes", value: notes.length, gradient: "gradient-ocean" },
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

        <div className="space-y-5">
          {/* ── AI Summary ── */}
          <SectionPanel
            icon={Sparkles}
            gradient="gradient-sunset"
            title="AI Trip Summary"
            subtitle="Get an AI-generated overview of your trip"
            id="ai"
            expanded={expandedSection === "ai"}
            onToggle={() => toggle("ai")}
          >
            {!showAiSummary && !generatingSummary && (
              <div className="text-center py-10">
                <div className="w-20 h-20 rounded-3xl gradient-sunset flex items-center justify-center mx-auto mb-5 animate-float shadow-lg">
                  <Sparkles className="w-9 h-9 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Ready to relive your trip?</h3>
                <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
                  Our AI will analyze your ratings, notes, and photos to create a personalized trip summary.
                </p>
                <Button variant="sunset" size="lg" className="shadow-lg" onClick={generateSummary}>
                  <Sparkles className="w-4 h-4" /> Generate Trip Summary
                </Button>
              </div>
            )}

            {generatingSummary && (
              <div className="text-center py-14">
                <Loader2 className="w-14 h-14 mx-auto text-[hsl(var(--sunset))] animate-spin mb-5" />
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Analyzing your journey...</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Reviewing {photos.length} photos, {notes.length} notes, and {ratings.length} ratings
                </p>
              </div>
            )}

            {showAiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <div className="bg-[hsl(var(--sunset-glow))] rounded-2xl p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">✨ {aiSummary.title}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {aiSummary.highlights.map((h, i) => (
                      <div key={i} className="bg-card/60 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2 shadow-sm">
                        <span className="text-lg">{h.emoji}</span>
                        <span className="text-sm text-foreground font-body">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {[
                  { icon: Heart, color: "text-[hsl(var(--ocean))]", title: "Best Memory", text: aiSummary.bestMemory },
                  { icon: null, color: "text-[hsl(var(--sunset))]", title: "🍜 Culinary Highlights", text: aiSummary.favoriteFood },
                  { icon: ThumbsUp, color: "text-[hsl(var(--ocean))]", title: "Trip Mood", text: aiSummary.mood },
                ].map((item, i) => (
                  <div key={i} className="bg-secondary/50 rounded-2xl p-5">
                    <h4 className={`font-medium text-sm ${item.color} mb-2 flex items-center gap-2`}>
                      {item.icon && <item.icon className="w-4 h-4" />} {item.title}
                    </h4>
                    <p className="text-sm text-foreground font-body">{item.text}</p>
                  </div>
                ))}

                <div className="gradient-ocean rounded-2xl p-5">
                  <h4 className="font-medium text-sm text-primary-foreground/80 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> AI Recommendation
                  </h4>
                  <p className="text-sm text-primary-foreground font-body">{aiSummary.recommendation}</p>
                </div>
              </motion.div>
            )}
          </SectionPanel>

          {/* ── Photos ── */}
          <SectionPanel
            icon={Camera}
            gradient="gradient-ocean"
            title="Trip Photos"
            subtitle={`${photos.length} photos uploaded`}
            id="photos"
            expanded={expandedSection === "photos"}
            onToggle={() => toggle("photos")}
          >
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-md"
                  >
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-end">
                      <div className="w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <span className="text-xs text-primary-foreground font-medium truncate font-body">{photo.caption}</span>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="p-1.5 bg-destructive/80 rounded-lg hover:bg-destructive transition-colors"
                        >
                          <X className="w-3 h-3 text-primary-foreground" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-[hsl(var(--ocean))]/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-[hsl(var(--ocean))] transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium font-body">Upload</span>
                </button>
              </div>
            ) : (
              /* Empty state for photos */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground font-body mb-6 max-w-xs mx-auto">
                  Upload your favorite moments from the trip to build your photo gallery.
                </p>
                <Button variant="ocean" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Upload Photos
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </SectionPanel>

          {/* ── Ratings ── */}
          <SectionPanel
            icon={Star}
            gradient="gradient-sunset"
            title="Rate Places"
            subtitle={`${ratings.length} places to rate`}
            id="ratings"
            expanded={expandedSection === "ratings"}
            onToggle={() => toggle("ratings")}
          >
            {ratings.length > 0 ? (
              <div className="space-y-3">
                {ratings.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-secondary/50 rounded-2xl p-4 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[hsl(var(--ocean))]" />
                          {place.name}
                        </h4>
                        <span className="text-xs text-muted-foreground capitalize font-body">{place.type}</span>
                      </div>
                      <StarRating rating={place.rating} onRate={(r) => updateRating(place.id, r)} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic font-body">"{place.note}"</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">No ratings yet</h3>
                <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
                  Rate the places you visited to help us personalize your future recommendations.
                </p>
              </div>
            )}
          </SectionPanel>

          {/* ── Notes ── */}
          <SectionPanel
            icon={PenLine}
            gradient="gradient-ocean"
            title="Travel Notes"
            subtitle={`${notes.length} journal entries`}
            id="notes"
            expanded={expandedSection === "notes"}
            onToggle={() => toggle("notes")}
          >
            {!showNoteForm && (
              <Button variant="outline" size="sm" className="mb-4" onClick={() => setShowNoteForm(true)}>
                <PenLine className="w-4 h-4" /> Write a Note
              </Button>
            )}

            {showNoteForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/50 rounded-2xl p-5 mb-4 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ocean))] text-sm font-body"
                />
                <textarea
                  placeholder="Write about your experience..."
                  value={newNote.content}
                  onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ocean))] text-sm font-body resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="ocean" size="sm" onClick={addNote}>Save Note</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowNoteForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}

            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group bg-secondary/50 rounded-2xl p-5 relative hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[hsl(var(--ocean-lighter))] text-[hsl(var(--ocean))] rounded-full px-2.5 py-0.5 font-medium font-body">
                        {note.date}
                      </span>
                      <h4 className="font-medium text-sm text-foreground">{note.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-body">{note.content}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-lg"
                    >
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
                <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
                  Capture your thoughts, discoveries, and favorite moments from the trip.
                </p>
              </div>
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
};

export default TripMemories;
