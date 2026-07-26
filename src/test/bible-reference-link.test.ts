import { describe, it, expect } from "vitest";
import { buildReadingHref, findBibleReferences } from "@/lib/bible-reference-scan";

const href = (text: string) => {
  const [m] = findBibleReferences(text);
  return buildReadingHref(m.parsed);
};

describe("buildReadingHref", () => {
  it("Jo 3:16 → /reading?book=john&chapter=3&verse=16", () => {
    expect(href("Jo 3:16")).toBe("/reading?book=john&chapter=3&verse=16");
  });

  it("Sl 23 → /reading?book=psalms&chapter=23 (no verse)", () => {
    const h = href("Sl 23");
    expect(h).toBe("/reading?book=psalms&chapter=23");
    expect(h).not.toContain("verse=");
  });

  it("1 Co 13:4-7 → verse=4", () => {
    const h = href("1 Co 13:4-7");
    expect(h).toContain("book=1+corinthians");
    expect(h).toContain("chapter=13");
    expect(h).toContain("verse=4");
  });
});
