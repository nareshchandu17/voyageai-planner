
-- Add share_token for public sharing
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Allow public access to shared trips by token
CREATE POLICY "Anyone can view shared trips" ON public.trips
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);
