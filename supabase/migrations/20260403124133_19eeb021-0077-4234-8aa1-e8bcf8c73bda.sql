
-- Traveler profiles for companion context memory
CREATE TABLE public.traveler_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pace_preference TEXT DEFAULT 'moderate',
  energy_tolerance INTEGER DEFAULT 3,
  cuisine_preferences TEXT[] DEFAULT '{}',
  travel_style TEXT[] DEFAULT '{}',
  past_patterns JSONB DEFAULT '{}',
  trip_count INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traveler_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.traveler_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.traveler_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.traveler_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trip travelers for group dynamic orchestration
CREATE TABLE public.trip_travelers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  compatibility_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trip travelers" ON public.trip_travelers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_travelers.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can insert trip travelers" ON public.trip_travelers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_travelers.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can update trip travelers" ON public.trip_travelers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_travelers.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can delete trip travelers" ON public.trip_travelers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_travelers.trip_id AND trips.user_id = auth.uid())
);
