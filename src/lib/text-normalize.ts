/**
 * Text normalization utilities to eliminate hidden/garbage characters that
 * leak into the Writer editor when users paste from web pages, WhatsApp,
 * Notes, PDFs, etc.
 *
 * Design goals:
 *  - Deterministic (pure functions, no I/O).
 *  - Conservative: never strip legitimate PT-BR letters, accents, digits,
 *    punctuation used in bible refs (":" and "-"), or Markdown structure
 *    (newlines).
 *  - Idempotent: normalize(normalize(x)) === normalize(x).
 */

/** Characters we strip entirely because they are invisible or control-only. */
// eslint-disable-next-line no-control-regex
const INVISIBLES_RE = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD]/g;
// eslint-disable-next-line no-control-regex
const CONTROLS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normalize any user-authored text. Safe to run on save AND on paste.
 */
export const normalizeUserText = (input: string): string => {
  if (!input) return "";
  let out = input.normalize("NFC");

  // NBSP and other unicode spaces → regular space (keep \n and \t).
  out = out.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ");

  // Strip zero-width, BOM, soft hyphen.
  out = out.replace(INVISIBLES_RE, "");

  // Strip control chars (keep \n=\u000A and \t=\u0009).
  out = out.replace(CONTROLS_RE, "");

  // Collapse runs of spaces/tabs on the same line (do NOT touch newlines).
  out = out.replace(/[ \t]{2,}/g, " ");

  // Trim trailing spaces on each line.
  out = out.replace(/[ \t]+\n/g, "\n");

  // Collapse 3+ blank lines to 2.
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
};

/**
 * Extra cleanup for pasted content coming from unknown sources.
 * Runs normalizeUserText first, then removes typical "footnote noise"
 * glued to words (superscript markers, © § ¶ ° ² ³ ¹) when they don't
 * appear as legitimate content.
 */
export const sanitizePastedText = (input: string): string => {
  let out = normalizeUserText(input);

  // Superscript digits and common footnote glyphs.
  out = out.replace(/[\u00B2\u00B3\u00B9\u2070-\u2079\u2080-\u2089]/g, "");
  // ©, §, ¶, † and stray degree signs that show up as note markers.
  out = out.replace(/[©§¶†‡°]/g, "");

  // Cleanup any double-spaces introduced by removals.
  out = out.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+\n/g, "\n");

  return out.trim();
};
