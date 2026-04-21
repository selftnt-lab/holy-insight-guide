import type { User } from "@supabase/supabase-js";

export interface ProfileNameSource {
  full_name?: string | null;
  display_name?: string | null;
}

interface UserMetaName {
  full_name?: string;
  name?: string;
  given_name?: string;
  first_name?: string;
}

/** Returns the first whitespace-separated token of a string, or undefined. */
export const firstNameOf = (value?: string | null): string | undefined =>
  value?.trim().split(/\s+/).filter(Boolean)[0];

/**
 * Resolves the user's first name with a consistent fallback chain used
 * across the app. Never returns the email. Falls back to the provided
 * default (defaults to "leitor").
 */
export const resolveFirstName = (
  user: User | null | undefined,
  profile: ProfileNameSource | null | undefined,
  fallback = "leitor"
): string => {
  const meta = (user?.user_metadata ?? {}) as UserMetaName;
  return (
    firstNameOf(profile?.full_name) ||
    meta.given_name ||
    meta.first_name ||
    firstNameOf(meta.full_name) ||
    firstNameOf(meta.name) ||
    firstNameOf(profile?.display_name) ||
    fallback
  );
};