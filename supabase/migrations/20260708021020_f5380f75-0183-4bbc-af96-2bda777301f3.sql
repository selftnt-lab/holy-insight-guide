-- has_role: usada em policies RLS; precisa ser executável apenas por authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- match_kb_chunks: usada apenas pela edge function (service_role); revogar de clientes
REVOKE ALL ON FUNCTION public.match_kb_chunks(vector, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_kb_chunks(vector, integer) TO service_role;