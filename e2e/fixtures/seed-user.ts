/**
 * Seed idempotente de usuário de teste no Supabase local.
 *
 * Cria (ou reaproveita) o usuário definido em E2E_SEED_EMAIL / E2E_SEED_PASSWORD
 * via Admin API do Supabase, usando a service_role key da instância local.
 *
 * Uso (auth.spec.ts):
 *   const { email, password } = await ensureSeedUser();
 *
 * O usuário é criado com email_confirm=true para que signInWithPassword funcione
 * sem confirmação de e-mail.
 */

import { createClient } from "@supabase/supabase-js";
import { getE2EEnv } from "./supabase-local";

export interface SeedUser {
  id: string;
  email: string;
  password: string;
}

let cached: SeedUser | null = null;

export async function ensureSeedUser(): Promise<SeedUser> {
  if (cached) return cached;

  const env = getE2EEnv();
  const admin = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Procurar usuário existente por e-mail.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    throw new Error(`[e2e] Falha ao listar usuários: ${listErr.message}`);
  }
  const existing = list.users.find((u) => u.email === env.seedEmail);

  if (existing) {
    // Garante senha conhecida (idempotência entre execuções).
    const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
      password: env.seedPassword,
      email_confirm: true,
    });
    if (updErr) {
      throw new Error(`[e2e] Falha ao atualizar seed user: ${updErr.message}`);
    }
    cached = { id: existing.id, email: env.seedEmail, password: env.seedPassword };
    return cached;
  }

  // 2. Criar novo.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: env.seedEmail,
    password: env.seedPassword,
    email_confirm: true,
    user_metadata: { display_name: "E2E Seed" },
  });
  if (createErr || !created.user) {
    throw new Error(`[e2e] Falha ao criar seed user: ${createErr?.message ?? "sem user"}`);
  }
  cached = { id: created.user.id, email: env.seedEmail, password: env.seedPassword };
  return cached;
}

/**
 * Limpa dados voláteis do usuário seed entre execuções (opcional, chamado em
 * globalSetup no futuro). Nesta Etapa 1 não é usado — mantido como referência.
 */
export async function resetSeedUserData(userId: string): Promise<void> {
  const env = getE2EEnv();
  const admin = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  // Tabelas que crescem com o uso do app; ajuste conforme necessário.
  await admin.from("chat_history").delete().eq("user_id", userId);
  await admin.from("user_documents").delete().eq("user_id", userId);
}
