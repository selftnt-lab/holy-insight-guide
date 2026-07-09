/**
 * Remove tokens de sessão do Supabase do localStorage sem apagar
 * preferências do app (tema, tradução bíblica, etc.).
 *
 * Passe `{ resetAll: true }` para limpar tudo (último recurso).
 */
export const clearAuthStorage = (opts?: { resetAll?: boolean }) => {
  if (typeof window === "undefined") return;
  try {
    if (opts?.resetAll) {
      window.localStorage.clear();
      return;
    }
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      // Chaves do Supabase auth: sb-<ref>-auth-token, supabase.auth.token
      if (key.startsWith("sb-") || key.startsWith("supabase.auth.")) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* swallow — logout não pode quebrar */
  }
};
