
-- Add travel_story column to trips
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS travel_story text;

-- Create trip_memories table for photos and journal entries
CREATE TABLE public.trip_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'journal',
  title text,
  content text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories" ON public.trip_memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.trip_memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.trip_memories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.trip_memories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);

-- Storage policies
CREATE POLICY "Users can upload trip photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'trip-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view trip photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'trip-photos');
CREATE POLICY "Anyone can view trip photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'trip-photos');
CREATE POLICY "Users can delete own trip photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'trip-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
