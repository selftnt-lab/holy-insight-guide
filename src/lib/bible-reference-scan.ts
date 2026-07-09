import { parseReference, ParsedReference } from "@/lib/reference-parser";

export interface RefMatch {
  start: number;
  end: number;
  raw: string;
  parsed: ParsedReference;
}

// Broad candidate matcher: optional ordinal (1/2/3), one book token (letters + optional dot),
// optional second word for compound names ("song of solomon" won't hit here — we rely on
// aliases/short forms which cover PT usage: Ct, Sl, Ap, 1Co, etc.), then chapter[:verse[-verse]].
// We match candidates and validate each with parseReference — anything invalid stays as text.
const CANDIDATE = /(?<![\p{L}\d])((?:[1-3]\s*)?[\p{L}]{2,}\.?)\s+(\d{1,3})(?::(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?(?![\p{L}\d])/giu;

export const findBibleReferences = (text: string): RefMatch[] => {
  const out: RefMatch[] = [];
  if (!text) return out;
  CANDIDATE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CANDIDATE.exec(text)) !== null) {
    const raw = m[0];
    const parsed = parseReference(raw);
    if (parsed) {
      out.push({ start: m.index, end: m.index + raw.length, raw, parsed });
    }
  }
  return out;
};

export const buildReadingHref = (parsed: ParsedReference): string => {
  const params = new URLSearchParams();
  params.set("book", parsed.book.slug);
  params.set("chapter", String(parsed.chapter));
  if (parsed.verseStart) params.set("verse", String(parsed.verseStart));
  return `/reading?${params.toString()}`;
};
