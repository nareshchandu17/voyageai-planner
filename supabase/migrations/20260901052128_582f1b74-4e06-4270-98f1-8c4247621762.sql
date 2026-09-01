CREATE TABLE public.place_image_cache (
  query_key TEXT PRIMARY KEY,
  search_query TEXT NOT NULL,
  image_url TEXT NOT NULL,
  small_url TEXT,
  thumb_url TEXT,
  alt_text TEXT,
  credit TEXT,
  credit_link TEXT,
  source TEXT NOT NULL,
  relevance_score NUMERIC NOT NULL DEFAULT 0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.place_image_cache TO anon;
GRANT SELECT, INSERT, UPDATE ON public.place_image_cache TO authenticated;
GRANT ALL ON public.place_image_cache TO service_role;

ALTER TABLE public.place_image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached place images"
  ON public.place_image_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Signed-in users can add cached place images"
  ON public.place_image_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in users can refresh cached place images"
  ON public.place_image_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_place_image_cache_updated_at
  BEFORE UPDATE ON public.place_image_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();