# Holy Insight Guide — Estado e Roadmap

## Fase 6 — Auditoria e Ajustes Finais (concluída)

### Auditoria realizada
- Frontend, edge functions, RLS, prompts de IA, fontes de dados e fluxo de auth revisados.
- Nenhum mock ou dado fabricado: texto bíblico via bible-api.com (Almeida domínio público + 3 EN), IA via Lovable AI Gateway com schemas estruturados, léxico em tabela própria.
- Identificadas e corrigidas as inconsistências doutrinárias remanescentes (prompt de exploração ainda nomeava escola teológica).

### Traduções bíblicas
Mantemos exclusivamente traduções em **domínio público** para distribuição legal sem necessidade de licenciamento:
- Almeida (João Ferreira de Almeida — clássica)
- King James Version
- World English Bible
- American Standard Version (1901)

Versões como ARA, ARC moderna, NVI, NVT e NAA exigem licenciamento comercial das respectivas detentoras e **não** foram incluídas. Decisão registrada em `src/pages/legal/Licenses.tsx`.

### Entregas
1. **Sanitização completa do tutor IA**: `explore-suggestions`, `cross-references`, `word-study`, `chat`, `chapter-study`, `daily-devotional`, `generate-plan` usam o mesmo `CONFESSIONAL_SYSTEM_PROMPT` neutro (sem nomear confissões, denominações ou autores) e/ou instruções técnicas específicas sem rótulos.
2. **Helper unificado de IA**: `supabase/functions/_shared/ai.ts` centraliza chamada ao gateway, fallback de modelo em 5xx, mapeamento 429/402, timeout e extração de JSON/tool-call.
3. **Cache persistente de capítulos**: nova tabela `bible_chapter_cache` (RLS, leitura pública) + retry com backoff em `bible/index.ts`. Reduz custo e latência entre cold starts.
4. **Política de planos**: `reading_plans` agora retorna planos curados publicamente, mas planos gerados por IA ficam visíveis apenas para o criador.
5. **Páginas legais**: `/legal/termos`, `/legal/privacidade`, `/legal/licencas`, com links no rodapé.
6. **Tutor sem menções nominais**: regra explícita no prompt e nas instruções por função.

### Arquivos alterados/criados
- `supabase/functions/_shared/ai.ts` (novo)
- `supabase/functions/explore-suggestions/index.ts` (sanitizado + helper)
- `supabase/functions/cross-references/index.ts` (sanitizado + helper)
- `supabase/functions/bible/index.ts` (DB cache + retry + timeout)
- `src/pages/legal/Terms.tsx`, `Privacy.tsx`, `Licenses.tsx` (novos)
- `src/App.tsx` (rotas /legal/*)
- `src/components/AppFooter.tsx` (links legais)
- migração: `bible_chapter_cache` + ajuste de policy em `reading_plans`

### Próximos passos sugeridos
- Smoke tests Deno cobrindo `chat`, `chapter-study`, `bible`.
- Lazy-load (`React.lazy`) dos sheets pesados em `Reading.tsx`.
- og:image dedicada para compartilhamento social.
