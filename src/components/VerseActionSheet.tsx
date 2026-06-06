import { useEffect, useState } from "react";
import { Copy, Share2, Trash2, BookOpenCheck, StickyNote } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/lib/highlight-colors";
import type { VerseHighlight } from "@/hooks/useChapterHighlights";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  existing?: VerseHighlight;
  onUpsert: (patch: { color?: HighlightColor; note?: string | null; tags?: string[] }) => Promise<void>;
  onRemove: () => Promise<void>;
  onCompareTranslations: () => void;
}

const VerseActionSheet = ({
  open,
  onClose,
  bookName,
  chapter,
  verse,
  text,
  existing,
  onUpsert,
  onRemove,
  onCompareTranslations,
}: Props) => {
  const [note, setNote] = useState(existing?.note ?? "");
  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    setNote(existing?.note ?? "");
    setTagsInput((existing?.tags ?? []).join(", "));
    setShowNote(false);
  }, [existing, open]);

  const reference = `${bookName} ${chapter}:${verse}`;

  const handleColor = async (color: HighlightColor) => {
    await onUpsert({ color });
    toast.success("Versículo destacado");
  };

  const handleSaveNote = async () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onUpsert({ note: note.trim() || null, tags });
    toast.success("Anotação salva");
    setShowNote(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`"${text}" — ${reference}`);
    toast.success("Copiado para a área de transferência");
  };

  const handleShare = async () => {
    const payload = { title: reference, text: `"${text}" — ${reference}` };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(payload.text);
      toast.success("Texto copiado para compartilhar");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-left">{reference}</SheetTitle>
        </SheetHeader>

        <p className="mt-2 text-sm italic text-muted-foreground line-clamp-3">"{text}"</p>

        {/* Color palette */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Destacar
          </p>
          <div className="flex items-center gap-3">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleColor(c.id)}
                className={`h-10 w-10 rounded-full transition-transform active:scale-95 ${c.bg} ${
                  existing?.color === c.id ? `ring-2 ring-offset-2 ring-offset-background ${c.ring}` : ""
                }`}
                aria-label={c.label}
              />
            ))}
            {existing && (
              <button
                onClick={async () => {
                  await onRemove();
                  toast.success("Destaque removido");
                  onClose();
                }}
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-destructive hover:bg-destructive/10"
                aria-label="Remover destaque"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="mt-5">
          {!showNote ? (
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={() => setShowNote(true)}
            >
              <StickyNote size={16} className="mr-2" />
              {existing?.note ? "Editar anotação" : "Adicionar anotação"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Sua reflexão sobre este versículo..."
                rows={3}
                maxLength={1000}
              />
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags separadas por vírgula (ex: fé, graça)"
                maxLength={200}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNote} className="flex-1">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowNote(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={handleCopy} className="flex-col h-auto py-3 rounded-xl">
            <Copy size={18} />
            <span className="text-[11px] mt-1">Copiar</span>
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex-col h-auto py-3 rounded-xl">
            <Share2 size={18} />
            <span className="text-[11px] mt-1">Compartilhar</span>
          </Button>
          <Button variant="outline" onClick={onCompareTranslations} className="flex-col h-auto py-3 rounded-xl">
            <BookOpenCheck size={18} />
            <span className="text-[11px] mt-1">Comparar</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VerseActionSheet;
