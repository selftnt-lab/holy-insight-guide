-- Etapa 1: Conter redistribuição pública de traduções licenciadas via cache
-- Adiciona classe de licença, restringe leitura anônima a domínio público e prepara expiração para purga.

-- 1. Coluna license_class com CHECK
ALTER TABLE public.bible_chapter_cache
  ADD COLUMN IF NOT EXISTS license_class text NOT NULL DEFAULT 'restricted'
    CHECK (license_class IN ('public_domain', 'restricted'));

-- 2. Backfill: apenas ACF é considerado domínio público no Brasil.
-- ARC tratada como 'restricted' por precaução (revisão editorial SBB).
UPDATE public.bible_chapter_cache
  SET license_class = 'public_domain'
  WHERE translation IN ('ACF');

-- 3. Coluna expires_at (nullable) — preenchida por trigger apenas em restricted
ALTER TABLE public.bible_chapter_cache
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 4. Trigger que ajusta expires_at conforme license_class
CREATE OR REPLACE FUNCTION public.set_bible_cache_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.license_class = 'restricted' THEN
    IF NEW.expires_at IS NULL THEN
      NEW.expires_at := now() + interval '24 hours';
    END IF;
  ELSE
    NEW.expires_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bible_cache_expiry ON public.bible_chapter_cache;
CREATE TRIGGER trg_bible_cache_expiry
  BEFORE INSERT OR UPDATE ON public.bible_chapter_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_bible_cache_expiry();

-- 5. Backfill expires_at para linhas restricted existentes
UPDATE public.bible_chapter_cache
  SET expires_at = COALESCE(expires_at, now() + interval '24 hours')
  WHERE license_class = 'restricted';

-- 6. Revogar grant amplo de SELECT para anon e reconstituir apenas com RLS restritiva.
-- (RLS é o gate efetivo; mantemos GRANT SELECT para anon para que a policy possa filtrar,
--  mas trocamos a policy "Public read bible cache" por regras por classe de licença.)
REVOKE SELECT ON public.bible_chapter_cache FROM anon;
GRANT SELECT ON public.bible_chapter_cache TO anon;

-- 7. Substituir policy antiga
DROP POLICY IF EXISTS "Public read bible cache" ON public.bible_chapter_cache;

-- anon: apenas domínio público
CREATE POLICY "Anon reads public_domain cache"
  ON public.bible_chapter_cache
  FOR SELECT
  TO anon
  USING (license_class = 'public_domain');

-- authenticated: acesso total de leitura (decisão de produto pendente)
CREATE POLICY "Authenticated reads all cache"
  ON public.bible_chapter_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- service_role já tem GRANT ALL; nenhuma policy adicional necessária (bypassrls).

-- 8. Índice para a próxima etapa (purga por expiração)
CREATE INDEX IF NOT EXISTS idx_bible_chapter_cache_expires_at
  ON public.bible_chapter_cache (expires_at)
  WHERE expires_at IS NOT NULL;