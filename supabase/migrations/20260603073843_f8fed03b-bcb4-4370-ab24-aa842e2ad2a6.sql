-- 1. Extend items with productivity fields
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS queue_bucket text CHECK (queue_bucket IN ('today','tomorrow','this_week','someday')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','reading','completed')),
  ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Daily activity table for streaks + weekly review
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  items_saved integer NOT NULL DEFAULT 0,
  items_read integer NOT NULL DEFAULT 0,
  items_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activity TO authenticated;
GRANT ALL ON public.user_activity TO service_role;

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON public.user_activity FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON public.user_activity FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_activity_updated_at
  BEFORE UPDATE ON public.user_activity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_items_queue_bucket ON public.items(user_id, queue_bucket);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON public.user_activity(user_id, activity_date DESC);