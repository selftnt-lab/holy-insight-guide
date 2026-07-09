import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BIBLE_TRANSLATIONS, DEFAULT_TRANSLATION, getStoredTranslation, setStoredTranslation } from "@/lib/bible-translations";

const LS_IMMERSIVE = "reading.immersive";

const isValidTranslation = (code: string | null | undefined): code is string =>
  !!code && BIBLE_TRANSLATIONS.some((t) => t.code === code);

/**
 * Single source of truth for user preferences.
 * - Signed-in: hydrates from `profiles`, then persists updates to backend (debounced) + localStorage fallback.
 * - Signed-out: pure localStorage.
 */
export const useUserPreferences = () => {
  const { user } = useAuth();
  const [translation, setTranslationState] = useState<string>(() => getStoredTranslation());
  const [immersive, setImmersiveState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LS_IMMERSIVE) === "true";
  });
  const [hydrated, setHydrated] = useState(false);
  const translationTimer = useRef<number | null>(null);
  const immersiveTimer = useRef<number | null>(null);

  // Hydrate from backend when user is available
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setHydrated(true);
      return;
    }
    setHydrated(false);
    supabase
      .from("profiles")
      .select("preferred_translation, reading_immersive_mode")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) {
          setHydrated(true);
          return;
        }
        if (isValidTranslation(data.preferred_translation)) {
          setTranslationState(data.preferred_translation!);
          setStoredTranslation(data.preferred_translation!);
        }
        if (typeof data.reading_immersive_mode === "boolean") {
          setImmersiveState(data.reading_immersive_mode);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(LS_IMMERSIVE, String(data.reading_immersive_mode));
          }
        }
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setTranslation = useCallback(
    (code: string) => {
      if (!isValidTranslation(code)) code = DEFAULT_TRANSLATION;
      setTranslationState(code);
      setStoredTranslation(code);
      if (!user) return;
      if (translationTimer.current) window.clearTimeout(translationTimer.current);
      translationTimer.current = window.setTimeout(() => {
        supabase
          .from("profiles")
          .update({ preferred_translation: code })
          .eq("user_id", user.id)
          .then(() => {});
      }, 400);
    },
    [user],
  );

  const setImmersive = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setImmersiveState((prev) => {
        const next = typeof value === "function" ? (value as (p: boolean) => boolean)(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(LS_IMMERSIVE, String(next));
        }
        if (user) {
          if (immersiveTimer.current) window.clearTimeout(immersiveTimer.current);
          immersiveTimer.current = window.setTimeout(() => {
            supabase
              .from("profiles")
              .update({ reading_immersive_mode: next })
              .eq("user_id", user.id)
              .then(() => {});
          }, 400);
        }
        return next;
      });
    },
    [user],
  );

  return { translation, setTranslation, immersive, setImmersive, hydrated };
};
