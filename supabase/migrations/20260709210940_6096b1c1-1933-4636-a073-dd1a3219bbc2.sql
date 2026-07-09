ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_translation text,
  ADD COLUMN IF NOT EXISTS theme_preference text
    CHECK (theme_preference IS NULL OR theme_preference IN ('light','dark','system'));