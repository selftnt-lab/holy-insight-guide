import { expect, test } from "@playwright/test";
import { ensureSeedUser } from "./fixtures/seed-user";

/**
 * Fluxo de autenticação end-to-end contra Supabase local.
 *
 * Pré-requisitos:
 *   - `supabase start` ativo
 *   - env vars E2E_SUPABASE_URL / _ANON_KEY / _SERVICE_ROLE_KEY exportadas
 *   - `.env` do app apontando para a mesma instância local
 *     (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY)
 *
 * NÃO cobre Google OAuth (fora do escopo de E2E automatizado).
 */

test.describe("auth", () => {
  test("login com email/senha → dashboard → logout", async ({ page }) => {
    const seed = await ensureSeedUser();

    // 1. Ir para /auth (deslogado → home redireciona).
    await page.goto("/");
    await page.waitForURL(/\/auth$/, { timeout: 10_000 });

    // 2. Preencher formulário de login.
    await page.getByTestId("auth-login-email").fill(seed.email);
    await page.getByTestId("auth-login-password").fill(seed.password);
    await page.getByTestId("auth-login-submit").click();

    // 3. Chegou no Dashboard.
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
    await expect(page.getByTestId("dashboard-greeting")).toBeVisible({
      timeout: 15_000,
    });

    // 4. Ir para /profile e fazer logout.
    await page.goto("/profile");
    await page.getByTestId("profile-signout").click();

    // 5. Volta para /auth.
    await page.waitForURL(/\/auth$/, { timeout: 10_000 });
    await expect(page.getByTestId("auth-login-email")).toBeVisible();
  });
});
