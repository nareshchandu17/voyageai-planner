
-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  duration TEXT,
  budget NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  group_size INTEGER DEFAULT 1,
  styles TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  itinerary_data JSONB,
  weather_data JSONB,
  nearby_places JSONB,
  upcoming_events JSONB,
  destination_photos JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own trips
CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE TO authenticated USING (auth.uid() = user_id);
