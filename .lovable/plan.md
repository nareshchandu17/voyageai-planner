

## Plan: Premium Itinerary Generation with Per-Day Images & Advanced Features

### Problem
The current itinerary display is functional but plain. Day cards use recycled destination photos (or gradient fallbacks), activities are text-only, and the overall layout doesn't match a production travel app. Users need visual recognition of places through images.

### Architecture

**1. Per-Day & Per-Activity Unsplash Images**
- Update the AI planner edge function prompt to include `imageQuery` fields on each day and key activities (e.g., `"Senso-ji Temple Tokyo"`)
- After itinerary generation, batch-fetch Unsplash images for each day's theme and top activities using the existing `unsplash` edge function
- Store fetched image URLs in the itinerary JSON so they persist in the database

**2. New Edge Function: `unsplash-batch`**
- Accepts an array of queries (one per day + key activities)
- Returns a map of `query → photo` to minimize API calls
- Called once after itinerary JSON is parsed, before saving to DB

**3. Redesigned `AIItineraryResult` Component**
Replace the current flat card list with a premium immersive layout:

- **Trip Hero**: Full-width cinematic banner with destination photo, trip title, dates, and key stats (days, budget, travelers)
- **Sticky Day Navigation**: Horizontal scrollable day pills that highlight the current day and scroll to sections
- **Day Sections**: Each day gets a full-width hero image (from Unsplash), weather badge, and theme title
- **Activity Cards**: Each activity rendered as a visual card with:
  - Activity-specific image (Unsplash or Google Maps photo)
  - Time, duration, cost badges
  - Location tag
  - Insider tip callout
  - Type icon overlay
- **Meal Cards**: Visual restaurant cards with cuisine badges
- **Daily Summary Footer**: Budget spent, travel tip, weather advisory

**4. Enhanced Day Card Component (`DaySection`)**
```text
┌─────────────────────────────────────────┐
│  [Full-width Day Hero Image]            │
│  Day 1 · Arrival & Exploration          │
│  🌤 28°C · Sunny                        │
├─────────────────────────────────────────┤
│  Morning                                │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ img  │ │ img  │ │ img  │  ← cards   │
│  │ name │ │ name │ │ name │             │
│  │ time │ │ time │ │ time │             │
│  └──────┘ └──────┘ └──────┘            │
│  Afternoon                              │
│  ...                                    │
│  Dining                                 │
│  [Breakfast] [Lunch] [Dinner]           │
│  💡 Daily tip                           │
│  Budget: $45                            │
└─────────────────────────────────────────┘
```

**5. Image Strategy**
- Update AI planner prompt: add `imageQuery` field to each day object and each activity
- After parsing itinerary JSON, extract all unique imageQuery strings
- Call `unsplash-batch` edge function with all queries
- Merge returned URLs back into itinerary data before saving to DB
- Fallback chain: Unsplash → Google Maps photo (if `photoReference` exists) → gradient placeholder

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/unsplash-batch/index.ts` | Create — batch image fetcher |
| `src/components/AIItineraryResult.tsx` | Rewrite — premium layout with per-day heroes, sticky nav, visual activity cards |
| `src/pages/PlanTrip.tsx` | Update — call batch image fetch after generation, merge images into data |
| `supabase/functions/ai-travel-planner/index.ts` | Update — add `imageQuery` fields to JSON schema in prompt |
| `src/lib/streamChat.ts` | Add `fetchUnsplashBatch` helper |

### Key Features Added
- Per-day hero images fetched from Unsplash based on day theme
- Per-activity thumbnail images for visual place recognition
- Sticky horizontal day navigation bar
- Activity cards displayed as visual grid (not plain text list)
- Morning/Afternoon/Evening sections with image-rich cards
- Meal cards with visual styling
- Daily budget tracker per day
- Smooth scroll-to-day animations
- Weather badge on each day hero
- Framer Motion stagger animations on card reveals

### No Database Changes Required
Images are stored within the existing `itinerary_data` JSONB column.

