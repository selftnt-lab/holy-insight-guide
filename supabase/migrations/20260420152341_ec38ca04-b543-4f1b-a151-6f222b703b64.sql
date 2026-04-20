-- Expand profiles with personal + church fields
ALTER TABLE public.profiles
  ADD COLUMN full_name TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN birth_date DATE,
  ADD COLUMN gender TEXT,
  ADD COLUMN bible_level TEXT,
  ADD COLUMN tradition TEXT,
  ADD COLUMN interests TEXT[] DEFAULT '{}',
  ADD COLUMN church_name TEXT,
  ADD COLUMN church_denomination TEXT,
  ADD COLUMN church_city TEXT,
  ADD COLUMN church_role TEXT,
  ADD COLUMN church_years INTEGER;

-- Avatars bucket (public for easy display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can view, only owner can write (files go under {user_id}/...)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );