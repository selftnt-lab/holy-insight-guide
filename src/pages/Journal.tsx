import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen, Loader2, NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getBookBySlug } from "@/lib/bible-books";
import SacredDivider from "@/components/SacredDivider";

interface Row {
  book_slug: string;
  chapter: number;
  question_index: number;
  question: string;
  answer: string;
  updated_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reflection_answers")
      .select("book_slug, chapter, question_index, question, answer, updated_at")
      .eq("user_id", user.id)
      .neq("answer", "")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [user]);

  const grouped = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const key = `${r.book_slug}::${r.chapter}`;
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="mb-3 -ml-2 text-muted-foreground"
        >
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Reflexões</p>
          <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-semibold text-foreground">
            <NotebookText size={26} className="text-accent" />
            Meu diário
          </h1>
          <SacredDivider className="mt-5" />
        </motion.div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Você ainda não respondeu nenhuma reflexão.
            <br />
            Abra o estudo de um capítulo na aba <strong>Reflexão</strong> para começar.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {Object.entries(grouped).map(([key, items]) => {
              const [slug, ch] = key.split("::");
              const book = getBookBySlug(slug);
              return (
                <Card key={key} className="rounded-2xl border p-5">
                  <button
                    onClick={() => navigate(`/reading?book=${slug}&chapter=${ch}`)}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent"
                  >
                    <BookOpen size={14} />
                    {book?.name ?? slug} {ch}
                  </button>
                  <div className="mt-3 space-y-3">
                    {items
                      .sort((a, b) => a.question_index - b.question_index)
                      .map((it, i) => (
                        <div key={i} className="border-l-2 border-accent/40 pl-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            {it.question}
                          </p>
                          <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                            {it.answer}
                          </p>
                        </div>
                      ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
