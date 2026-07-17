/**
 * Env helpers para apontar a app + fixtures E2E ao Supabase local.
 *
 * Fluxo esperado (ver e2e/README.md):
 *   1. `supabase start` sobe stack local em http://127.0.0.1:54321
 *   2. Copie as chaves impressas para `.env.e2e` (não versionado) OU exporte:
 *        E2E_SUPABASE_URL=http://127.0.0.1:54321
 *        E2E_SUPABASE_ANON_KEY=<anon key local>
 *        E2E_SUPABASE_SERVICE_ROLE_KEY=<service_role key local>
 *   3. `bun run test:e2e`
 *
 * Este módulo é usado apenas pelo runner Playwright / fixtures — nunca
 * importado pelo bundle da aplicação.
 */

export interface E2EEnv {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  baseURL: string;
  seedEmail: string;
  seedPassword: string;
}

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `[e2e] Variável de ambiente ${name} não definida. ` +
        `Rode \`supabase start\` e exporte E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY ` +
        `e E2E_SUPABASE_SERVICE_ROLE_KEY antes de executar bun run test:e2e.`,
    );
  }
  return value;
}

export function getE2EEnv(): E2EEnv {
  return {
    supabaseUrl: required("E2E_SUPABASE_URL", process.env.E2E_SUPABASE_URL),
    anonKey: required("E2E_SUPABASE_ANON_KEY", process.env.E2E_SUPABASE_ANON_KEY),
    serviceRoleKey: required(
      "E2E_SUPABASE_SERVICE_ROLE_KEY",
      process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,
    ),
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    seedEmail: process.env.E2E_SEED_EMAIL ?? "e2e-seed@rcbible.test",
    seedPassword: process.env.E2E_SEED_PASSWORD ?? "e2e-Seed-Passw0rd!",
  };
}
