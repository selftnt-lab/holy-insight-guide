import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TRANSLATIONS, getTranslationLabel } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChapterData {
  reference: string;
  translation: string;
  verses: { verse: number; text: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  bookSlug: string;
  bookName: string;
  chapter: number;
  /** If set, only show this verse across translations */
  focusVerse?: number;
}

const BIBLE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible`;

const fetchTranslation = async (book: string, chapter: number, translation: string): Promise<ChapterData> => {
  const url = `${BIBLE_URL}?book=${encodeURIComponent(book)}&chapter=${chapter}&translation=${translation}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
  });
  if (!r.ok) throw new Error("Falha");
  return r.json();
};

const TranslationComparison = ({ open, onClose, bookSlug, bookName, chapter, focusVerse }: Props) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(["almeida", "kjv"]);
  const [data, setData] = useState<Record<string, ChapterData | null>>({});
  const [loading, setLoading] = useState(false);

  // Load user preference
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferred_translations")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const pref = (data?.preferred_translations as string[] | null) ?? null;
        if (pref && pref.length) setSelected(pref);
      });
  }, [user]);

  // Fetch when opened or selection changes
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all(
      selected.map(async (id) => {
        try {
          const d = await fetchTranslation(bookSlug, chapter, id);
          return [id, d] as const;
        } catch {
          return [id, null] as const;
        }
      })
    ).then((entries) => {
      setData(Object.fromEntries(entries));
      setLoading(false);
    });
  }, [open, selected, bookSlug, chapter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const savePreference = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ preferred_translations: selected })
      .eq("user_id", user.id);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {bookName} {chapter}
            {focusVerse ? `:${focusVerse}` : ""}
          </SheetTitle>
        </SheetHeader>

        {/* Translation picker */}
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Traduções (até 3)
          </p>
          <div className="flex flex-wrap gap-2">
            {TRANSLATIONS.map((t) => {
              const active = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                  }`}
                >
                  {active && <Check size={12} />}
                  {t.label}
                </button>
              );
            })}
          </div>
          {user && (
            <Button variant="ghost" size="sm" onClick={savePreference} className="mt-2 text-xs">
              Salvar como padrão
            </Button>
          )}
        </div>

        {/* Comparison grid */}
        <div className={`mt-5 grid gap-4 ${selected.length === 1 ? "grid-cols-1" : selected.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
          {selected.map((id) => {
            const chap = data[id];
            return (
              <div key={id} className="rounded-xl border p-3">
                <Badge variant="secondary" className="mb-2 text-[10px]">
                  {getTranslationLabel(id)}
                </Badge>
                {loading || !chap ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chap.verses
                      .filter((v) => !focusVerse || v.verse === focusVerse)
                      .map((v) => (
                        <p key={v.verse} className="font-serif text-sm leading-relaxed">
                          <span className="mr-1 align-super text-[10px] font-sans font-bold text-accent">
                            {v.verse}
                          </span>
                          {v.text}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationComparison;
