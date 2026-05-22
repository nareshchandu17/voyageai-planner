CREATE TABLE public.trip_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  user_id uuid NOT NULL,
  sender_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_messages_trip ON public.trip_messages(trip_id, created_at);

ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip owner can view messages"
ON public.trip_messages FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_messages.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip owner can insert messages"
ON public.trip_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_messages.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip owner can update messages"
ON public.trip_messages FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_messages.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip owner can delete messages"
ON public.trip_messages FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_messages.trip_id AND trips.user_id = auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;
ALTER TABLE public.trip_messages REPLICA IDENTITY FULL;