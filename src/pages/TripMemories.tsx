import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera, PenLine, Star, Sparkles, MapPin, Heart, Upload,
  X, ChevronDown, ChevronUp, Loader2, Image as ImageIcon,
  Calendar, ThumbsUp, MessageSquare, Trash2
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
              i <= rating ? "fill-sunset text-sunset" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

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

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

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

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const generateSummary = () => {
    setGeneratingSummary(true);
    setTimeout(() => {
      setGeneratingSummary(false);
      setShowAiSummary(true);
    }, 2500);
  };

  const avgRating = (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1);

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-80">
        <img src={tripInfo.heroImage} alt={tripInfo.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sunset/90 text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
              Trip Complete
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            {tripInfo.destination}
          </h1>
          <p className="text-muted-foreground flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{tripInfo.dates}</span>
            <span>·</span>
            <span>{tripInfo.travelers} travelers</span>
            <span>·</span>
            <span>{tripInfo.style}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <Camera className="w-5 h-5 text-ocean mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{photos.length}</p>
            <p className="text-xs text-muted-foreground">Photos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Star className="w-5 h-5 text-sunset mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="glass-card p-4 text-center">
            <PenLine className="w-5 h-5 text-ocean mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{notes.length}</p>
            <p className="text-xs text-muted-foreground">Notes</p>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="glass-card overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("ai")}
            className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-sunset flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <h2 className="font-display text-lg font-semibold text-foreground">AI Trip Summary</h2>
                <p className="text-xs text-muted-foreground">Get an AI-generated overview of your trip</p>
              </div>
            </div>
            {expandedSection === "ai" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {expandedSection === "ai" && (
            <div className="px-5 pb-5 animate-in">
              {!showAiSummary && !generatingSummary && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-3xl gradient-sunset flex items-center justify-center mx-auto mb-4 animate-float">
                    <Sparkles className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Ready to relive your trip?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Our AI will analyze your ratings, notes, and photos to create a personalized trip summary.
                  </p>
                  <Button variant="sunset" size="lg" onClick={generateSummary}>
                    <Sparkles className="w-4 h-4" />
                    Generate Trip Summary
                  </Button>
                </div>
              )}

              {generatingSummary && (
                <div className="text-center py-12 animate-in">
                  <Loader2 className="w-12 h-12 mx-auto text-sunset animate-spin mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    Analyzing your journey...
                  </h3>
                  <p className="text-sm text-muted-foreground">Reviewing {photos.length} photos, {notes.length} notes, and {ratings.length} ratings</p>
                </div>
              )}

              {showAiSummary && (
                <div className="space-y-6 animate-in">
                  <div className="bg-sunset-glow rounded-2xl p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-4">
                      ✨ {aiSummary.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {aiSummary.highlights.map((h, i) => (
                        <div key={i} className="bg-card/60 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2">
                          <span className="text-lg">{h.emoji}</span>
                          <span className="text-sm text-foreground">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-5">
                      <h4 className="font-medium text-sm text-ocean mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Best Memory
                      </h4>
                      <p className="text-sm text-foreground">{aiSummary.bestMemory}</p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-5">
                      <h4 className="font-medium text-sm text-sunset mb-2 flex items-center gap-2">
                        🍜 Culinary Highlights
                      </h4>
                      <p className="text-sm text-foreground">{aiSummary.favoriteFood}</p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-5">
                      <h4 className="font-medium text-sm text-ocean mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" /> Trip Mood
                      </h4>
                      <p className="text-sm text-foreground">{aiSummary.mood}</p>
                    </div>

                    <div className="gradient-ocean rounded-xl p-5">
                      <h4 className="font-medium text-sm text-primary-foreground/80 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> AI Recommendation
                      </h4>
                      <p className="text-sm text-primary-foreground">{aiSummary.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div className="glass-card overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("photos")}
            className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h2 className="font-display text-lg font-semibold text-foreground">Trip Photos</h2>
                <p className="text-xs text-muted-foreground">{photos.length} photos uploaded</p>
              </div>
            </div>
            {expandedSection === "photos" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {expandedSection === "photos" && (
            <div className="px-5 pb-5 animate-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-end">
                      <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <span className="text-xs text-primary-foreground font-medium truncate">{photo.caption}</span>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="p-1 bg-destructive/80 rounded-lg hover:bg-destructive transition-colors"
                        >
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-ocean/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-ocean transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Place Ratings Section */}
        <div className="glass-card overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("ratings")}
            className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-sunset flex items-center justify-center">
                <Star className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <h2 className="font-display text-lg font-semibold text-foreground">Rate Places</h2>
                <p className="text-xs text-muted-foreground">{ratings.length} places to rate</p>
              </div>
            </div>
            {expandedSection === "ratings" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {expandedSection === "ratings" && (
            <div className="px-5 pb-5 animate-in space-y-3">
              {ratings.map((place) => (
                <div key={place.id} className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-ocean" />
                        {place.name}
                      </h4>
                      <span className="text-xs text-muted-foreground capitalize">{place.type}</span>
                    </div>
                    <StarRating
                      rating={place.rating}
                      onRate={(r) => updateRating(place.id, r)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{place.note}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Travel Notes Section */}
        <div className="glass-card overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("notes")}
            className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                <PenLine className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h2 className="font-display text-lg font-semibold text-foreground">Travel Notes</h2>
                <p className="text-xs text-muted-foreground">{notes.length} journal entries</p>
              </div>
            </div>
            {expandedSection === "notes" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {expandedSection === "notes" && (
            <div className="px-5 pb-5 animate-in">
              {/* Add note button */}
              {!showNoteForm && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  onClick={() => setShowNoteForm(true)}
                >
                  <PenLine className="w-4 h-4" /> Write a Note
                </Button>
              )}

              {/* Note form */}
              {showNoteForm && (
                <div className="bg-secondary/50 rounded-xl p-4 mb-4 animate-in space-y-3">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean text-sm font-body"
                  />
                  <textarea
                    placeholder="Write about your experience..."
                    value={newNote.content}
                    onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean text-sm font-body resize-none"
                  />
                  <div className="flex gap-2">
                    <Button variant="ocean" size="sm" onClick={addNote}>
                      Save Note
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowNoteForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Notes list */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="group bg-secondary/50 rounded-xl p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-ocean-lighter text-ocean rounded-full px-2 py-0.5 font-medium">
                        {note.date}
                      </span>
                      <h4 className="font-medium text-sm text-foreground">{note.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripMemories;
