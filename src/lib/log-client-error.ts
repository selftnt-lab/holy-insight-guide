import { supabase } from "@/integrations/supabase/client";

/**
 * Best-effort logger for client-side errors. Never throws.
 * Falls back silently when the network / RLS / auth is not available.
 */
export const logClientError = async (input: {
  message: string;
  stack?: string | null;
  route?: string | null;
  build?: string | null;
}) => {
  try {
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : null;
    const route =
      input.route ??
      (typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : null);

    await supabase.from("client_error_logs").insert({
      message: input.message.slice(0, 4000),
      stack: input.stack ? input.stack.slice(0, 8000) : null,
      route,
      user_agent: userAgent,
      build: input.build ?? import.meta.env.MODE ?? null,
    });
  } catch {
    /* swallow — logging must never break the app */
  }
};
