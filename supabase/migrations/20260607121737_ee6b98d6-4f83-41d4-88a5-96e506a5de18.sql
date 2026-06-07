ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reading_immersive_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_voice_uri text;