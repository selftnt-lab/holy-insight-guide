import { BIBLE_BOOKS, BibleBook } from "@/lib/bible-books";

export interface ParsedReference {
  book: BibleBook;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .trim();

// Common PT abbreviations
const ALIASES: Record<string, string> = {
  gn: "genesis", gen: "genesis",
  ex: "exodus", exo: "exodus",
  lv: "leviticus", lev: "leviticus",
  nm: "numbers", num: "numbers",
  dt: "deuteronomy", deut: "deuteronomy",
  js: "joshua", jos: "joshua", josh: "joshua",
  jz: "judges", juz: "judges", jui: "judges",
  rt: "ruth",
  "1sm": "1 samuel", "1 sm": "1 samuel", "1sam": "1 samuel",
  "2sm": "2 samuel", "2 sm": "2 samuel", "2sam": "2 samuel",
  "1rs": "1 kings", "1 rs": "1 kings", "1reis": "1 kings",
  "2rs": "2 kings", "2 rs": "2 kings", "2reis": "2 kings",
  "1cr": "1 chronicles", "1 cr": "1 chronicles",
  "2cr": "2 chronicles", "2 cr": "2 chronicles",
  ed: "ezra", esd: "ezra",
  ne: "nehemiah", nee: "nehemiah",
  et: "esther", est: "esther",
  jo: "john", "joão": "john", joao: "john",
  jó: "job", job: "job",
  sl: "psalms", sal: "psalms", salmo: "psalms", salmos: "psalms",
  pv: "proverbs", prov: "proverbs",
  ec: "ecclesiastes", ecl: "ecclesiastes",
  ct: "song of solomon", cant: "song of solomon",
  is: "isaiah", isa: "isaiah",
  jr: "jeremiah", jer: "jeremiah",
  lm: "lamentations", lam: "lamentations",
  ez: "ezekiel", eze: "ezekiel",
  dn: "daniel", dan: "daniel",
  os: "hosea", ose: "hosea",
  jl: "joel",
  am: "amos",
  ob: "obadiah", obd: "obadiah",
  jn: "jonah", jon: "jonah", jonas: "jonah",
  mq: "micah", miq: "micah",
  na: "nahum",
  hc: "habakkuk", hab: "habakkuk",
  sf: "zephaniah", sof: "zephaniah",
  ag: "haggai", age: "haggai",
  zc: "zechariah", zac: "zechariah",
  ml: "malachi", mal: "malachi",
  mt: "matthew", mat: "matthew",
  mc: "mark", mar: "mark", marcos: "mark",
  lc: "luke", luc: "luke", lucas: "luke",
  at: "acts", atos: "acts",
  rm: "romans", rom: "romans",
  "1co": "1 corinthians", "1 co": "1 corinthians",
  "2co": "2 corinthians", "2 co": "2 corinthians",
  gl: "galatians", gal: "galatians",
  ef: "ephesians", efe: "ephesians",
  fp: "philippians", flp: "philippians",
  cl: "colossians", col: "colossians",
  "1ts": "1 thessalonians", "1 ts": "1 thessalonians",
  "2ts": "2 thessalonians", "2 ts": "2 thessalonians",
  "1tm": "1 timothy", "1 tm": "1 timothy",
  "2tm": "2 timothy", "2 tm": "2 timothy",
  tt: "titus",
  fm: "philemon", flm: "philemon",
  hb: "hebrews", heb: "hebrews",
  tg: "james", tia: "james", tiago: "james",
  "1pe": "1 peter", "1 pe": "1 peter", "1pd": "1 peter",
  "2pe": "2 peter", "2 pe": "2 peter", "2pd": "2 peter",
  "1jo": "1 john", "1 jo": "1 john",
  "2jo": "2 john", "2 jo": "2 john",
  "3jo": "3 john", "3 jo": "3 john",
  jd: "jude", judas: "jude",
  ap: "revelation", apoc: "revelation", apocalipse: "revelation",
};

const findBook = (raw: string): BibleBook | undefined => {
  const n = norm(raw);
  // direct alias
  if (ALIASES[n]) {
    const slug = ALIASES[n];
    return BIBLE_BOOKS.find((b) => b.slug === slug);
  }
  // name match (start-with)
  return BIBLE_BOOKS.find((b) => norm(b.name).startsWith(n) || norm(b.slug).startsWith(n));
};

/**
 * Try to parse strings like:
 *  - "jo 3:16"
 *  - "joão 3"
 *  - "1 co 13:4-7"
 *  - "salmos 23"
 *  - "gn1:1"
 */
export const parseReference = (input: string): ParsedReference | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern: <book tokens> <chapter>[:verseStart[-verseEnd]]
  const m = trimmed.match(/^([1-3]?\s?[\p{L}\.\s]+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/u);
  if (!m) return null;

  const [, bookPart, chapterStr, vStartStr, vEndStr] = m;
  const book = findBook(bookPart);
  if (!book) return null;
  const chapter = parseInt(chapterStr, 10);
  if (!chapter || chapter < 1 || chapter > book.chapters) return null;
  const verseStart = vStartStr ? parseInt(vStartStr, 10) : undefined;
  const verseEnd = vEndStr ? parseInt(vEndStr, 10) : undefined;
  return { book, chapter, verseStart, verseEnd };
};

export const isStrongCode = (input: string): boolean => /^[GH]\d{1,5}$/i.test(input.trim());
