
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Conversa',
  context JSONB,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own chat history"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own chat history"
  ON public.chat_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_chat_history_user_created
  ON public.chat_history (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.cap_chat_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.chat_history
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.chat_history
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 10
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cap_chat_history
AFTER INSERT ON public.chat_history
FOR EACH ROW EXECUTE FUNCTION public.cap_chat_history();
