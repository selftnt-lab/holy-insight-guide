import { describe, it, expect } from "vitest";
import { normalizeUserText, sanitizePastedText } from "@/lib/text-normalize";

describe("normalizeUserText", () => {
  it("removes NBSP, zero-width and BOM characters", () => {
    const dirty = "Foo\u00A0bar\u200Bbaz\uFEFF!";
    expect(normalizeUserText(dirty)).toBe("Foo barbaz!");
  });

  it("preserves PT-BR accents and punctuation", () => {
    const s = "João disse: “ame-vos uns aos outros” — coração.";
    expect(normalizeUserText(s)).toBe(s.normalize("NFC"));
  });

  it("preserves newlines and bible refs untouched", () => {
    const s = "Veja 1 Co 13:4-7\ne também Jo 3:16.";
    expect(normalizeUserText(s)).toContain("1 Co 13:4-7");
    expect(normalizeUserText(s)).toContain("Jo 3:16");
    expect(normalizeUserText(s).split("\n").length).toBe(2);
  });

  it("collapses multiple spaces but keeps single ones", () => {
    expect(normalizeUserText("a    b   c")).toBe("a b c");
  });

  it("strips control characters but keeps \\n and \\t", () => {
    expect(normalizeUserText("a\u0001b\tc\nd")).toBe("ab\tc\nd");
  });

  it("is idempotent", () => {
    const s = "Foo\u00A0bar\u200B  baz";
    expect(normalizeUserText(normalizeUserText(s))).toBe(normalizeUserText(s));
  });
});

describe("sanitizePastedText", () => {
  it("removes footnote noise like ² ³ © §", () => {
    expect(sanitizePastedText("palavra²© texto°§")).toBe("palavra texto");
  });

  it("does not destroy bible references", () => {
    const ref = "1 Co 13:4-7";
    expect(sanitizePastedText(ref)).toBe(ref);
  });

  it("keeps normal text intact", () => {
    const s = "No princípio criou Deus os céus e a terra.";
    expect(sanitizePastedText(s)).toBe(s.normalize("NFC"));
  });
});
