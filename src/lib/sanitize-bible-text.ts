/**
 * Aggressive sanitizer for BIBLE VERSE text only.
 *
 * The bolls.life datasets (and others) occasionally include footnote markers
 * ("³", "©", "§") glued to the verse text with no space. This helper is the
 * single source of truth: applied once at the fetch layer so the Reading UI,
 * the TTS engine and any Writer-insert path all consume identical strings.
 *
 * IMPORTANT: this is stricter than `text-normalize` because we know the
 * input domain (verse content, no Markdown, no user typography), so we can
 * remove ornament/note glyphs unconditionally.
 */

// Format & control characters, ZWSP/ZWNJ/ZWJ/BOM, soft hyphen.
// eslint-disable-next-line no-control-regex
const INVISIBLES_RE = /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g;
// eslint-disable-next-line no-control-regex
const CONTROLS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// Superscript/subscript digits + common footnote glyphs.
const NOTE_MARKERS_RE = /[\u00B2\u00B3\u00B9\u2070-\u2079\u2080-\u2089©®™§¶†‡°]/g;

/** Strips HTML tags (bolls.life sometimes wraps notes in <S>/<i>/<sup>). */
const stripTags = (s: string) => s.replace(/<[^>]*>/g, "");

export const sanitizeBibleText = (input: string): string => {
  if (!input) return "";
  let out = input.normalize("NFC");
  out = stripTags(out);
  out = out.replace(/&nbsp;/gi, " ");
  out = out.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ");
  out = out.replace(INVISIBLES_RE, "");
  out = out.replace(CONTROLS_RE, "");
  out = out.replace(NOTE_MARKERS_RE, "");
  // Clean punctuation orphans left by removed markers ("?© Esta" -> "? Esta").
  out = out.replace(/([?!.,;:])\s*(?=[A-ZÀ-Ú])/g, "$1 ");
  // Collapse whitespace on the line (keep newlines).
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/^\s+/, "").replace(/\s+$/, "");
  return out;
};

/** Guard: flags suspect chars still present so we can trace regressions. */
export const containsSuspectChars = (text: string): boolean => {
  if (!text) return false;
  return /[\u200B-\u200F\uFEFF©®™§¶\u00B2\u00B3\u00B9\u2070-\u2079]/.test(text) ||
    /\p{Cf}/u.test(text);
};

/** Dev-only diagnostic: logs codepoints when suspect chars leak through. */
export const warnIfSuspect = (text: string, context: string): void => {
  if (!import.meta.env.DEV) return;
  if (!containsSuspectChars(text)) return;
  const points = Array.from(text)
    .filter((c) => /[\u200B-\u200F\uFEFF©®™§¶\u00B2\u00B3\u00B9\u2070-\u2079]/.test(c) || /\p{Cf}/u.test(c))
    .map((c) => "U+" + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0"));
  // eslint-disable-next-line no-console
  console.warn(`[sanitizeBibleText] suspect chars @ ${context}:`, points, JSON.stringify(text.slice(0, 120)));
};
