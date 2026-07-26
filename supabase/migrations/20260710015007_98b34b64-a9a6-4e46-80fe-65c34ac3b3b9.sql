
-- Switch has_role to SECURITY INVOKER. All callers use auth.uid() and the
-- "Users can view their own roles" policy on public.user_roles lets an
-- authenticated caller read their own row, so the function returns correctly
-- without needing DEFINER privileges.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS
  'SECURITY INVOKER. Callers pass auth.uid(); RLS on user_roles ("Users can view their own roles") permits the self-read that this check depends on.';
