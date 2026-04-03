## Plan: 5 AI Intelligence Layers for Trip Planning

### Feature 1: Trip Energy Profiling
- Assign an "energy cost" (1-5) to every activity based on type, pace, walking intensity
- Show an **energy bar per day** in the itinerary (visual meter)
- Flag days that are "overloaded" (burnout risk) with a warning badge
- Add a **one-click auto-rebalance** button that redistributes high-energy activities across days
- Integrate into the AI itinerary generation prompt so the LLM assigns energy scores

### Feature 2: Serendipity Engine
- Reserve 15-20% of each day as "open slots" (grey blocks in the timeline)
- Show a **"Surprise Me"** button on open slots that fetches hyper-local suggestions via Google Maps nearby search
- Open slots glow/pulse subtly to invite interaction
- Suggestions based on current location context, time of day, and weather

### Feature 3: Companion Context Memory
- Create a `traveler_profile` table storing: completion rates, skipped activities, energy preferences, pace preferences, past trip ratings
- After each completed trip, auto-generate a profile update
- Show a **"Travel Self" profile card** on the dashboard
- During planning, surface insights like "Based on your past trips, we've softened Day 2 mornings"
- Use AI to compare planned vs actual trip patterns

### Feature 4: Group Dynamic Orchestration
- Add `group_size` and `travelers` support to trips (already have group_size column)
- Create a `trip_travelers` table with individual preference profiles per person
- Show a **Venn-style preference overlap view** on activity cards with "compatibility score"
- Flag conflicts (e.g., "Alice wants museums, Ben wants beaches") and propose split-day options
- Add a **group chat** placeholder embedded in the plan

### Feature 5: Narrative Intelligence Layer
- Structure the itinerary as a **story arc**: orientation days → build → peak day → wind-down → close
- Show an **arc visualization** (low → build → peak → close) above the day navigation
- AI assigns narrative labels to each day ("Arrival & Discovery", "The Peak Experience", "Farewell Day")
- Drag-to-reshape the arc, AI warns when structure feels flat
- Add emotional pacing metadata to each day

### Database Changes
- New `traveler_profiles` table (user_id, pace_preference, energy_tolerance, cuisine_prefs, past_patterns JSONB)
- New `trip_travelers` table (trip_id, name, preferences JSONB)
- Extend `itinerary_data` JSONB to include energy_scores, narrative_arc, open_slots

### No New Edge Functions Needed
- Energy profiling, narrative arc, and serendipity slots are computed client-side or via existing AI planner prompt enhancements
- Group orchestration uses existing data structures
- Companion memory uses existing trip history queries

### UI Components
- `EnergyBar` - per-day energy meter with burnout warning
- `SerendipitySlot` - glowing open slot with "Surprise Me" button
- `TravelerProfile` - "Travel Self" card on dashboard
- `GroupOverlapView` - Venn-style compatibility display
- `NarrativeArc` - story arc visualization above day nav
- All integrated into existing `AIItineraryResult.tsx` and `Dashboard.tsx`
