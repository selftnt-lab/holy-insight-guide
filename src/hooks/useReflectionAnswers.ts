import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ReflectionAnswer {
  id?: string;
  question_index: number;
  question: string;
  answer: string;
}

export const useReflectionAnswers = (
  bookSlug: string,
  chapter: number,
  questions: string[],
) => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, ReflectionAnswer>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !bookSlug || !chapter || questions.length === 0) return;
    setLoading(true);
    supabase
      .from("reflection_answers")
      .select("id, question_index, question, answer")
      .eq("user_id", user.id)
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter)
      .then(({ data }) => {
        const map: Record<number, ReflectionAnswer> = {};
        for (let i = 0; i < questions.length; i++) {
          const row = data?.find((r) => r.question_index === i);
          map[i] = {
            id: row?.id,
            question_index: i,
            question: questions[i],
            answer: row?.answer ?? "",
          };
        }
        setAnswers(map);
        setLoading(false);
      });
  }, [user, bookSlug, chapter, questions]);

  const save = useCallback(
    async (index: number, value: string) => {
      if (!user) return;
      const current = answers[index];
      setAnswers((s) => ({
        ...s,
        [index]: { ...current, answer: value },
      }));
      await supabase.from("reflection_answers").upsert(
        {
          user_id: user.id,
          book_slug: bookSlug,
          chapter,
          question_index: index,
          question: current?.question ?? questions[index],
          answer: value,
        },
        { onConflict: "user_id,book_slug,chapter,question_index" },
      );
    },
    [user, bookSlug, chapter, answers, questions],
  );

  return { answers, save, loading };
};
