
CREATE TABLE public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  route text NULL,
  message text NOT NULL,
  stack text NULL,
  user_agent text NULL,
  build text NULL
);

GRANT INSERT ON public.client_error_logs TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.client_error_logs TO authenticated;
GRANT ALL ON public.client_error_logs TO service_role;

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert error logs"
  ON public.client_error_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins can read error logs"
  ON public.client_error_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can update error logs"
  ON public.client_error_logs
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete error logs"
  ON public.client_error_logs
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_client_error_logs_created_at ON public.client_error_logs (created_at DESC);
CREATE INDEX idx_client_error_logs_user_id ON public.client_error_logs (user_id);
