# E2E — Playwright (RC Bible)

Suíte end-to-end contra **Supabase local** (nunca contra produção).
Cobertura desta etapa: `smoke.spec.ts` + `auth.spec.ts`. Specs de Reading /
Writer / Chat virão em etapas futuras.

## Pré-requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado.
- Docker em execução (o CLI sobe Postgres + GoTrue + PostgREST em containers).
- Node/Bun com dependências do projeto instaladas (`bun install`).
- Chromium do Playwright: `bunx playwright install chromium` (uma vez por
  máquina; no ambiente Lovable o binário já está pré-instalado).

## 1. Subir Supabase local

```bash
supabase start
```

O comando imprime algo como:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOi...
service_role key: eyJhbGciOi...
```

## 2. Exportar variáveis de ambiente do runner

```bash
export E2E_SUPABASE_URL="http://127.0.0.1:54321"
export E2E_SUPABASE_ANON_KEY="<anon key impressa acima>"
export E2E_SUPABASE_SERVICE_ROLE_KEY="<service_role key impressa acima>"
# opcionais (têm defaults sensatos):
export E2E_SEED_EMAIL="e2e-seed@rcbible.test"
export E2E_SEED_PASSWORD="e2e-Seed-Passw0rd!"
```

## 3. Apontar a aplicação Vite para a mesma instância

O client em `src/integrations/supabase/client.ts` lê `import.meta.env`.
Para os testes, o `.env` do projeto (ou um `.env.local` sobreposto) precisa
conter:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key local>
```

> ⚠️ Não commite estas alterações no `.env` da branch principal — use
> `.env.local` (ignorado pelo git) durante execuções E2E.

## 4. Aplicar migrations no Supabase local

```bash
supabase db reset      # aplica supabase/migrations/* do zero
```

Isso garante que RLS, triggers (`handle_new_user`, `cap_chat_history`, etc.)
e RPCs estejam idênticos à produção.

## 5. Rodar

```bash
bun run test:e2e          # headless
bun run test:e2e:ui       # modo UI interativo
```

O `webServer` do Playwright sobe o `bun run dev` automaticamente na porta 8080
se ainda não estiver rodando.

## Resetar o usuário seed entre execuções

`fixtures/seed-user.ts` é **idempotente**: procura o e-mail seed, atualiza a
senha se o usuário já existe, cria se não existe (`email_confirm: true`).

Para uma limpeza mais profunda (dados voláteis do usuário, sem apagar o
usuário em si), a função `resetSeedUserData(userId)` pode ser chamada em um
`globalSetup` no futuro. Para zerar tudo:

```bash
supabase db reset
```

## Estrutura

```
e2e/
├── fixtures/
│   ├── supabase-local.ts   # leitura + validação de env vars E2E_*
│   └── seed-user.ts        # ensureSeedUser() via Admin API
├── smoke.spec.ts           # rotas públicas + redirect quando deslogado
├── auth.spec.ts            # login email/senha → dashboard → logout
└── README.md               # este arquivo
```

## Isolamento vs. Vitest

- Vitest coleta apenas `src/**/*.{test,spec}.{ts,tsx}` e explicitamente
  **exclui** `e2e/**` (ver `vitest.config.ts`).
- Playwright coleta apenas `e2e/**/*.spec.ts` (ver `playwright.config.ts`).
- Não há sobreposição: `bun run test` roda unit, `bun run test:e2e` roda E2E.

## Fora do escopo

- Google OAuth (fluxo com popup externo não é automatizado).
- Reading / Writer / Chat — próximas etapas.
- Integração com `.github/workflows/quality-gate.yml` — próxima etapa.
