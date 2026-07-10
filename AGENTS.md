# AGENTS.md — Política para PRs gerados por agentes

Aplica-se a qualquer contribuição automatizada (Lovable, Copilot, scripts, etc.).

## Comandos obrigatórios antes de marcar como "done"

```bash
bun run lint          # ESLint
bun run test          # Vitest (unit/integration)
bun run build         # Vite build (typecheck implícito)
supabase test db      # pgTAP: RLS + grants (local, requer Supabase CLI + Docker)
```

Falhou qualquer um → não é "done".

## Áreas sensíveis (revisão humana obrigatória)

- **Auth / sessão** — `src/hooks/useAuth.tsx`, `src/lib/clear-auth-storage.ts`
- **RLS e migrations** — `supabase/migrations/*`, qualquer `CREATE POLICY` / `GRANT`
- **Edge Functions** — `supabase/functions/*` (especialmente `delete-account`, `purge-client-error-logs`)
- **Papéis/admin** — `public.user_roles`, `has_role()`, gates `useIsAdmin`
- **Segurança do frontend** — nada de `service_role`, secrets ou tokens no client
- **Base de conhecimento (RAG)** — `kb_*`, threshold/k
- **Preferências do usuário** — `profiles.preferred_translation`, `theme_preference`

Toda mudança nessas áreas deve incluir teste (Vitest ou pgTAP) que cubra a regressão.

## Formato mínimo do relatório em cada PR

```
### O que mudou
- <arquivos + intenção em 1-2 linhas>

### Como validei
- [ ] bun run test  → OK
- [ ] bun run build → OK
- [ ] supabase test db → OK (ou N/A se não tocou schema/RLS)
- [ ] Fluxo manual: <passos>

### Risco residual
- <cenário não coberto por teste, feature flag, dado de produção sensível, etc.>
```

## Rodando pgTAP localmente

Pré-requisitos: [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker.

```bash
supabase start        # sobe Postgres local com migrations aplicadas
supabase test db      # roda supabase/tests/database/*.test.sql
supabase stop
```

Os testes vivem em `supabase/tests/database/` e usam helpers em `_helpers.sql`
para simular `auth.uid()` e alternar entre roles `anon` / `authenticated` / admin.
