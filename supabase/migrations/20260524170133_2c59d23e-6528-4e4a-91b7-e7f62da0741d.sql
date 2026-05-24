
CREATE TABLE public.trip_place_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  place_key TEXT NOT NULL,
  place_name TEXT NOT NULL,
  day_num INTEGER,
  voter_id UUID NOT NULL,
  voter_name TEXT NOT NULL,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (trip_id, place_key, voter_id)
);

CREATE INDEX idx_trip_place_votes_trip ON public.trip_place_votes(trip_id);

ALTER TABLE public.trip_place_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip owner can view votes"
  ON public.trip_place_votes FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_place_votes.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip owner can insert votes"
  ON public.trip_place_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = voter_id
    AND EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_place_votes.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Trip owner can update votes"
  ON public.trip_place_votes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_place_votes.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip owner can delete votes"
  ON public.trip_place_votes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_place_votes.trip_id AND trips.user_id = auth.uid()));

CREATE TRIGGER update_trip_place_votes_updated_at
  BEFORE UPDATE ON public.trip_place_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_place_votes;
