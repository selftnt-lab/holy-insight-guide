import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/lib/bible-books";

// Short PT abbreviations by book slug (matches parser aliases).
const SHORT: Record<string, string> = {
  genesis: "Gn", exodus: "Êx", leviticus: "Lv", numbers: "Nm", deuteronomy: "Dt",
  joshua: "Js", judges: "Jz", ruth: "Rt",
  "1 samuel": "1Sm", "2 samuel": "2Sm", "1 kings": "1Rs", "2 kings": "2Rs",
  "1 chronicles": "1Cr", "2 chronicles": "2Cr",
  ezra: "Ed", nehemiah: "Ne", esther: "Et", job: "Jó",
  psalms: "Sl", proverbs: "Pv", ecclesiastes: "Ec", "song of solomon": "Ct",
  isaiah: "Is", jeremiah: "Jr", lamentations: "Lm", ezekiel: "Ez", daniel: "Dn",
  hosea: "Os", joel: "Jl", amos: "Am", obadiah: "Ob", jonah: "Jn", micah: "Mq",
  nahum: "Na", habakkuk: "Hc", zephaniah: "Sf", haggai: "Ag", zechariah: "Zc", malachi: "Ml",
  matthew: "Mt", mark: "Mc", luke: "Lc", john: "Jo", acts: "At", romans: "Rm",
  "1 corinthians": "1 Co", "2 corinthians": "2 Co",
  galatians: "Gl", ephesians: "Ef", philippians: "Fp", colossians: "Cl",
  "1 thessalonians": "1 Ts", "2 thessalonians": "2 Ts",
  "1 timothy": "1 Tm", "2 timothy": "2 Tm",
  titus: "Tt", philemon: "Fm", hebrews: "Hb", james: "Tg",
  "1 peter": "1 Pe", "2 peter": "2 Pe",
  "1 john": "1 Jo", "2 john": "2 Jo", "3 john": "3 Jo",
  jude: "Jd", revelation: "Ap",
};

interface Props {
  onInsert: (text: string) => void;
  children: React.ReactNode;
}

const InsertReferenceDialog = ({ onInsert, children }: Props) => {
  const [open, setOpen] = useState(false);
  const [bookSlug, setBookSlug] = useState<string>("john");
  const [chapter, setChapter] = useState<string>("3");
  const [vStart, setVStart] = useState<string>("");
  const [vEnd, setVEnd] = useState<string>("");

  const book = useMemo(
    () => BIBLE_BOOKS.find((b) => b.slug === bookSlug),
    [bookSlug]
  );

  const chapters = useMemo(
    () => (book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : []),
    [book]
  );

  const handleConfirm = () => {
    if (!book) return;
    const abbr = SHORT[book.slug] ?? book.name;
    let ref = `${abbr} ${chapter}`;
    if (vStart) {
      ref += `:${vStart}`;
      if (vEnd && Number(vEnd) > Number(vStart)) ref += `-${vEnd}`;
    }
    onInsert(ref);
    setOpen(false);
    setVStart("");
    setVEnd("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Inserir referência</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Livro</Label>
            <Select value={bookSlug} onValueChange={(v) => { setBookSlug(v); setChapter("1"); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {BIBLE_BOOKS.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.name} <span className="text-muted-foreground text-xs">({b.testament})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Capítulo</Label>
            <Select value={chapter} onValueChange={setChapter}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {chapters.map((c) => (
                  <SelectItem key={c} value={String(c)}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Verso inicial</Label>
              <Input
                type="number"
                min={1}
                value={vStart}
                onChange={(e) => setVStart(e.target.value)}
                placeholder="opcional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Verso final</Label>
              <Input
                type="number"
                min={1}
                value={vEnd}
                disabled={!vStart}
                onChange={(e) => setVEnd(e.target.value)}
                placeholder="opcional"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Inserir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsertReferenceDialog;
