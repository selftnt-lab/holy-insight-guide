import { supabase } from "@/integrations/supabase/client";

export interface StreakInfo {
  streakCount: number;
  longestStreak: number;
  lastReadDate: string | null; // ISO date (YYYY-MM-DD)
  readToday: boolean;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const diffDays = (aIso: string, bIso: string) => {
  const a = new Date(aIso + "T00:00:00Z").getTime();
  const b = new Date(bIso + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
};

export const fetchStreak = async (userId: string): Promise<StreakInfo> => {
  const { data } = await supabase
    .from("reading_progress")
    .select("streak_count, longest_streak, last_read_date")
    .eq("user_id", userId)
    .maybeSingle();
  const last = data?.last_read_date ?? null;
  return {
    streakCount: data?.streak_count ?? 0,
    longestStreak: data?.longest_streak ?? 0,
    lastReadDate: last,
    readToday: last === todayIso(),
  };
};

/** Call after the user opens/reads a chapter. Idempotent on same day. */
export const touchStreak = async (userId: string): Promise<StreakInfo> => {
  const current = await fetchStreak(userId);
  const today = todayIso();
  if (current.lastReadDate === today) return current;

  let next = 1;
  if (current.lastReadDate) {
    const d = diffDays(current.lastReadDate, today);
    if (d === 1) next = current.streakCount + 1;
    else if (d <= 0) next = current.streakCount; // clock skew safety
    else next = 1;
  }
  const longest = Math.max(current.longestStreak, next);

  const { error } = await supabase
    .from("reading_progress")
    .update({ streak_count: next, longest_streak: longest, last_read_date: today })
    .eq("user_id", userId);
  if (error) console.error("touchStreak error", error);

  return { streakCount: next, longestStreak: longest, lastReadDate: today, readToday: true };
};
