ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS key_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer;