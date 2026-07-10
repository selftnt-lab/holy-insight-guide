
-- Parte B: substituir WITH CHECK(true) por validações mínimas em client_error_logs
DROP POLICY IF EXISTS "anyone can insert error logs" ON public.client_error_logs;

CREATE POLICY "anyone can insert error logs"
ON public.client_error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  message IS NOT NULL
  AND length(message) BETWEEN 1 AND 2000
  AND (route IS NULL OR length(route) <= 500)
  AND (stack IS NULL OR length(stack) <= 8000)
  AND (user_agent IS NULL OR length(user_agent) <= 1000)
  AND (build IS NULL OR length(build) <= 200)
);

-- Defesa em profundidade: CHECK constraints equivalentes
ALTER TABLE public.client_error_logs
  DROP CONSTRAINT IF EXISTS client_error_logs_message_len,
  DROP CONSTRAINT IF EXISTS client_error_logs_route_len,
  DROP CONSTRAINT IF EXISTS client_error_logs_stack_len,
  DROP CONSTRAINT IF EXISTS client_error_logs_user_agent_len,
  DROP CONSTRAINT IF EXISTS client_error_logs_build_len;

ALTER TABLE public.client_error_logs
  ADD CONSTRAINT client_error_logs_message_len   CHECK (length(message) BETWEEN 1 AND 2000),
  ADD CONSTRAINT client_error_logs_route_len     CHECK (route IS NULL OR length(route) <= 500),
  ADD CONSTRAINT client_error_logs_stack_len     CHECK (stack IS NULL OR length(stack) <= 8000),
  ADD CONSTRAINT client_error_logs_user_agent_len CHECK (user_agent IS NULL OR length(user_agent) <= 1000),
  ADD CONSTRAINT client_error_logs_build_len     CHECK (build IS NULL OR length(build) <= 200);

-- Parte A: has_role é SECURITY DEFINER por design (padrão canônico Supabase para
-- evitar recursão de RLS em user_roles quando policies chamam a função). Ela:
--   - é STABLE, com search_path fixo em 'public'
--   - só devolve boolean para (user_id, role) explícitos
--   - não permite escalada: retornar true exige linha prévia em user_roles
-- EXECUTE precisa continuar em authenticated porque policies referenciam a
-- função e o motor de policies exige EXECUTE do papel chamador.
COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS
  'SECURITY DEFINER por design: usada em RLS para checar papéis sem recursão. '
  'search_path fixo, STABLE, sem SQL dinâmico. EXECUTE em authenticated é '
  'necessário para as policies funcionarem — não revogar.';
