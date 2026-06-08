import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getVerseOfDay } from "@/lib/verse-of-day";

export interface DevotionalContent {
  meditation: string;
  question: string;
  prayer: string;
}

export const useDailyDevotional = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DevotionalContent | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const verse = getVerseOfDay();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: cached } = await supabase
          .from("daily_devotionals")
          .select("content, completed_at")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();
        if (cached?.content) {
          if (!cancelled) {
            setData(cached.content as unknown as DevotionalContent);
            setCompletedAt(cached.completed_at);
            setLoading(false);
          }
          return;
        }
        const { data: gen, error: fnErr } = await supabase.functions.invoke(
          "daily-devotional",
          { body: { verseRef: verse.reference, verseText: verse.text } },
        );
        if (fnErr) throw fnErr;
        if (gen?.error) throw new Error(gen.error);
        const content = gen as DevotionalContent;
        await supabase.from("daily_devotionals").upsert(
          {
            user_id: user.id,
            date: today,
            verse_ref: verse.reference,
            content: content as never,
          },
          { onConflict: "user_id,date" },
        );
        if (!cancelled) setData(content);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao gerar devocional");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, today, verse.reference, verse.text]);

  const markComplete = async () => {
    if (!user || completedAt) return;
    const now = new Date().toISOString();
    setCompletedAt(now);
    await supabase
      .from("daily_devotionals")
      .update({ completed_at: now })
      .eq("user_id", user.id)
      .eq("date", today);
  };

  return { data, verse, loading, error, completedAt, markComplete };
};
