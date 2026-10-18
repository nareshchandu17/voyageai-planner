CREATE TABLE public.notification_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  href text,
  dedupe_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  UNIQUE (user_id, dedupe_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_inbox TO authenticated;
GRANT ALL ON public.notification_inbox TO service_role;
ALTER TABLE public.notification_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notification_inbox FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notification_inbox FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notification_inbox FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notification_inbox FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_notification_inbox_user_created ON public.notification_inbox (user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_inbox;
ALTER TABLE public.notification_inbox REPLICA IDENTITY FULL;

CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  booking_reminders_enabled boolean NOT NULL DEFAULT true,
  last_booking_reminder_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.notify_trip_message_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  trip_owner uuid;
BEGIN
  SELECT user_id INTO trip_owner FROM public.trips WHERE id = NEW.trip_id;
  IF trip_owner IS NULL OR trip_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notification_inbox (user_id, trip_id, kind, title, body, href, dedupe_key)
  VALUES (
    trip_owner,
    NEW.trip_id,
    'chat',
    'New trip message',
    NEW.sender_name || ': ' || left(NEW.content, 160),
    '/itinerary?id=' || NEW.trip_id::text,
    'chat:' || NEW.id::text
  )
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_trip_message_owner_after_insert
AFTER INSERT ON public.trip_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_trip_message_owner();

CREATE OR REPLACE FUNCTION public.notify_trip_vote_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  trip_owner uuid;
BEGIN
  SELECT user_id INTO trip_owner FROM public.trips WHERE id = NEW.trip_id;
  IF trip_owner IS NULL OR trip_owner = NEW.voter_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notification_inbox (user_id, trip_id, kind, title, body, href, dedupe_key)
  VALUES (
    trip_owner,
    NEW.trip_id,
    'vote',
    'A traveler voted on a place',
    NEW.voter_name || ' ' || CASE WHEN NEW.vote = 1 THEN 'liked ' ELSE 'passed on ' END || NEW.place_name,
    '/itinerary?id=' || NEW.trip_id::text,
    'vote:' || NEW.id::text
  )
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notify_trip_vote_owner_after_insert
AFTER INSERT ON public.trip_place_votes
FOR EACH ROW EXECUTE FUNCTION public.notify_trip_vote_owner();