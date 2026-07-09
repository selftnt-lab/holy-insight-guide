/**
 * Remove tokens de sessão do Supabase de localStorage e sessionStorage
 * sem apagar preferências do app (tema, tradução bíblica, etc.).
 *
 * Passe `{ resetAll: true }` para limpar tudo (último recurso).
 */
const AUTH_PREFIXES = ["sb-", "supabase.auth."];

const purge = (storage: Storage) => {
  const toRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    if (AUTH_PREFIXES.some((p) => key.startsWith(p))) toRemove.push(key);
  }
  toRemove.forEach((k) => storage.removeItem(k));
};

export const clearAuthStorage = (opts?: { resetAll?: boolean }) => {
  if (typeof window === "undefined") return;
  try {
    if (opts?.resetAll) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      return;
    }
    purge(window.localStorage);
    purge(window.sessionStorage);
  } catch {
    /* swallow — logout não pode quebrar */
  }
};
