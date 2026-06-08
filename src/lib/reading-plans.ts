import { supabase } from "@/integrations/supabase/client";
import { BIBLE_BOOKS, getBookBySlug, type BibleBook } from "@/lib/bible-books";

export interface PlanRef {
  book: string; // slug
  name: string; // pt-BR name
  chapter: number;
}
export interface PlanDay {
  day: number;
  refs: PlanRef[];
}
export interface CustomPlanDay {
  day: number;
  reference: string;
  reflection?: string;
}
export interface ReadingPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_days: number;
  category: string;
  books_filter: string; // "all" | "NT" | "AT" | "<bookSlug>"
  ai_generated?: boolean;
  created_by?: string | null;
  custom_days?: CustomPlanDay[] | null;
}
export interface UserPlanProgress {
  id: string;
  plan_id: string;
  started_at: string;
  current_day: number;
  completed_days: number[];
  is_active: boolean;
  completed_at: string | null;
}

const filterBooks = (filter: string): BibleBook[] => {
  if (filter === "all") return BIBLE_BOOKS;
  if (filter === "NT") return BIBLE_BOOKS.filter((b) => b.testament === "NT");
  if (filter === "AT") return BIBLE_BOOKS.filter((b) => b.testament === "AT");
  const book = getBookBySlug(filter);
  return book ? [book] : BIBLE_BOOKS;
};

// Parse a free-form reference like "João 3:16-18" or "Salmos 23" into a PlanRef
const parseReference = (ref: string): PlanRef | null => {
  const m = ref.match(/^([1-3]?\s*[\p{L}áéíóúãõâêôç\s]+?)\s+(\d+)/iu);
  if (!m) return null;
  const name = m[1].trim();
  const chapter = Number(m[2]);
  const slug = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === name.toLowerCase() || b.slug === name.toLowerCase(),
  )?.slug ?? BIBLE_BOOKS.find((b) => b.name.toLowerCase().startsWith(name.toLowerCase()))?.slug;
  if (!slug) return null;
  const book = getBookBySlug(slug);
  if (!book) return null;
  return { book: book.slug, name: book.name, chapter };
};

/** Build day-by-day refs deterministically from plan metadata. */
export const buildPlanDays = (plan: ReadingPlan): PlanDay[] => {
  // AI-generated plans carry their own day-by-day refs.
  if (plan.custom_days && plan.custom_days.length > 0) {
    return plan.custom_days.map((d) => {
      const ref = parseReference(d.reference);
      return { day: d.day, refs: ref ? [ref] : [] };
    });
  }

  const books = filterBooks(plan.books_filter);
  // Flatten ordered chapter list
  const chapters: PlanRef[] = [];
  for (const b of books) {
    for (let ch = 1; ch <= b.chapters; ch++) {
      chapters.push({ book: b.slug, name: b.name, chapter: ch });
    }
  }
  const days: PlanDay[] = [];
  const total = chapters.length;
  const duration = plan.duration_days;

  if (books.length === 1 && total >= duration) {
    for (let d = 1; d <= duration; d++) {
      if (d < duration) days.push({ day: d, refs: [chapters[d - 1]] });
      else days.push({ day: d, refs: chapters.slice(d - 1) });
    }
    return days;
  }

  let idx = 0;
  for (let d = 1; d <= duration; d++) {
    const end = Math.round((d * total) / duration);
    days.push({ day: d, refs: chapters.slice(idx, end) });
    idx = end;
  }
  return days;
};

export const fetchPlans = async (userId?: string): Promise<ReadingPlan[]> => {
  const { data, error } = await supabase
    .from("reading_plans")
    .select("id, slug, name, description, duration_days, category, books_filter, ai_generated, created_by, custom_days")
    .order("duration_days", { ascending: true });
  if (error) {
    console.error("fetchPlans", error);
    return [];
  }
  // Hide other users' AI plans (defense in depth; RLS reads are public)
  const all = (data ?? []) as unknown as ReadingPlan[];
  return all.filter((p) => !p.ai_generated || !p.created_by || p.created_by === userId);
};

export const fetchUserPlans = async (userId: string): Promise<UserPlanProgress[]> => {
  const { data, error } = await supabase
    .from("user_plan_progress")
    .select("id, plan_id, started_at, current_day, completed_days, is_active, completed_at")
    .eq("user_id", userId);
  if (error) {
    console.error("fetchUserPlans", error);
    return [];
  }
  return data as UserPlanProgress[];
};

export const enrollInPlan = async (userId: string, planId: string) => {
  const { error } = await supabase.from("user_plan_progress").upsert(
    {
      user_id: userId,
      plan_id: planId,
      current_day: 1,
      completed_days: [],
      is_active: true,
      completed_at: null,
    },
    { onConflict: "user_id,plan_id" }
  );
  if (error) console.error("enrollInPlan", error);
};

export const markDayComplete = async (
  userId: string,
  progress: UserPlanProgress,
  day: number,
  totalDays: number
) => {
  if (progress.completed_days.includes(day)) return progress;
  const completed = [...progress.completed_days, day].sort((a, b) => a - b);
  const nextDay = Math.min(day + 1, totalDays);
  const isDone = completed.length >= totalDays;
  const { error } = await supabase
    .from("user_plan_progress")
    .update({
      completed_days: completed,
      current_day: nextDay,
      completed_at: isDone ? new Date().toISOString() : null,
      is_active: !isDone,
    })
    .eq("id", progress.id);
  if (error) console.error("markDayComplete", error);
  return { ...progress, completed_days: completed, current_day: nextDay, is_active: !isDone };
};

export const unenroll = async (progressId: string) => {
  const { error } = await supabase.from("user_plan_progress").delete().eq("id", progressId);
  if (error) console.error("unenroll", error);
};
