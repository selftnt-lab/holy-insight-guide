import { describe, it, expect } from "vitest";
import { findBibleReferences } from "@/lib/bible-reference-scan";

describe("findBibleReferences", () => {
  it("detects Jo 3:16", () => {
    const r = findBibleReferences("veja Jo 3:16 hoje");
    expect(r).toHaveLength(1);
    expect(r[0].parsed.book.slug).toBe("john");
    expect(r[0].parsed.chapter).toBe(3);
    expect(r[0].parsed.verseStart).toBe(16);
  });

  it("detects Sl 23 without verse", () => {
    const r = findBibleReferences("leia Sl 23 agora");
    expect(r).toHaveLength(1);
    expect(r[0].parsed.book.slug).toBe("psalms");
    expect(r[0].parsed.chapter).toBe(23);
    expect(r[0].parsed.verseStart).toBeUndefined();
  });

  it("detects 1 Co 13:4-7 range", () => {
    const r = findBibleReferences("1 Co 13:4-7 é bonito");
    expect(r).toHaveLength(1);
    expect(r[0].parsed.book.slug).toBe("1 corinthians");
    expect(r[0].parsed.verseStart).toBe(4);
    expect(r[0].parsed.verseEnd).toBe(7);
  });

  it("detects 1Co 13:4-7 without space", () => {
    const r = findBibleReferences("veja 1Co 13:4-7 amor");
    expect(r).toHaveLength(1);
    expect(r[0].parsed.verseStart).toBe(4);
  });

  it("detects Mt 1:1", () => {
    const r = findBibleReferences("Mt 1:1 é o começo");
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0].parsed.book.slug).toBe("matthew");
  });

  it("rejects invalid chapter Jo 999:1", () => {
    const r = findBibleReferences("texto Jo 999:1 fim");
    expect(r).toHaveLength(0);
  });

  it("rejects Ab 0:0", () => {
    const r = findBibleReferences("Ab 0:0");
    expect(r).toHaveLength(0);
  });

  it("returns empty for random text", () => {
    expect(findBibleReferences("olá mundo bonito")).toHaveLength(0);
  });
});
