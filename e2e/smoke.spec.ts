import { expect, test } from "@playwright/test";

/**
 * Smoke tests — sem dependência de autenticação nem de Supabase local.
 * Validam apenas que o Vite dev server serve as rotas públicas corretamente.
 */

test.describe("smoke", () => {
  test("home redireciona para /auth quando deslogado", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/auth$/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByTestId("auth-login-email")).toBeVisible();
  });

  test("rota pública /legal/termos carrega e renderiza conteúdo", async ({ page }) => {
    const response = await page.goto("/legal/termos");
    expect(response?.status(), "status HTTP da rota pública").toBeLessThan(400);
    // Página de Termos tem heading — não depende de auth.
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Não deve redirecionar para /auth.
    await expect(page).not.toHaveURL(/\/auth$/);
  });
});
