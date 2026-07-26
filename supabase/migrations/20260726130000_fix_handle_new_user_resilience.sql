-- handle_new_user() não tinha tratamento de erro nem proteção contra duplicidade:
-- qualquer falha (ou nova execução do trigger para o mesmo user_id — retry de rede,
-- reenvio de confirmação de e-mail, etc.) derrubava a transação inteira do signup.
-- Isso deixava contas em auth.users sem profile/reading_progress correspondentes
-- (encontrado em produção: 3 usuários órfãos).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.reading_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca bloquear a criação da conta por causa do profile/progress:
  -- loga o erro e deixa o signup seguir; profile pode ser criado depois.
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
