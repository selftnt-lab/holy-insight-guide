import { describe, it, expect } from "vitest";
import { sanitizeBibleText, containsSuspectChars } from "@/lib/sanitize-bible-text";

describe("sanitizeBibleText", () => {
  it("removes the screenshot case (³© glued to verse start)", () => {
    const raw = "³© Esta, tendo sido anunciada primeiramente pelo Senhor";
    expect(sanitizeBibleText(raw)).toBe(
      "Esta, tendo sido anunciada primeiramente pelo Senhor",
    );
  });

  it("removes ?© / ?§ orphan sequences after punctuation", () => {
    const raw = "grande salvação?© Esta, tendo sido";
    expect(sanitizeBibleText(raw)).toBe("grande salvação? Esta, tendo sido");
  });

  it("strips zero-width, BOM and format chars", () => {
    const raw = "Deus\u200Bcriou\uFEFF os céus";
    expect(sanitizeBibleText(raw)).toBe("Deuscriou os céus");
  });

  it("strips embedded HTML tags (e.g. <S>) but keeps text", () => {
    const raw = "meio de anjos se tornou firme,<S>r</S> e toda";
    expect(sanitizeBibleText(raw)).toBe("meio de anjos se tornou firme,r e toda");
  });

  it("preserves accents, digits, colon and hyphens (refs untouched)", () => {
    const raw = "Ver João 3:16-17, coração e mente.";
    expect(sanitizeBibleText(raw)).toBe("Ver João 3:16-17, coração e mente.");
  });

  it("is idempotent", () => {
    const raw = "³© Esta salvação\u200B primeiramente";
    const once = sanitizeBibleText(raw);
    expect(sanitizeBibleText(once)).toBe(once);
  });
});

describe("containsSuspectChars", () => {
  it("detects footnote markers", () => {
    expect(containsSuspectChars("³© Esta")).toBe(true);
  });
  it("returns false for clean PT-BR text", () => {
    expect(containsSuspectChars("No princípio criou Deus os céus.")).toBe(false);
  });
});
