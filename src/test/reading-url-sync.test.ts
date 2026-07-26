import { describe, it, expect } from "vitest";
import { parseReadingParams, hasReadingOverride } from "@/lib/reading-params";

describe("parseReadingParams", () => {
  it("no params → no override", () => {
    const p = parseReadingParams("");
    expect(p.book).toBeUndefined();
    expect(p.chapter).toBeUndefined();
    expect(p.verse).toBeUndefined();
    expect(hasReadingOverride(p)).toBe(false);
  });

  it("full deep link", () => {
    const p = parseReadingParams("book=john&chapter=3&verse=16");
    expect(p.book).toBe("john");
    expect(p.chapter).toBe(3);
    expect(p.verse).toBe(16);
    expect(hasReadingOverride(p)).toBe(true);
  });

  it("book+chapter only (no verse)", () => {
    const p = parseReadingParams("book=psalms&chapter=23");
    expect(p.book).toBe("psalms");
    expect(p.chapter).toBe(23);
    expect(p.verse).toBeUndefined();
  });

  it("rejects zero/negative numeric values", () => {
    const p = parseReadingParams("book=john&chapter=0&verse=-1");
    expect(p.chapter).toBeUndefined();
    expect(p.verse).toBeUndefined();
  });
});
