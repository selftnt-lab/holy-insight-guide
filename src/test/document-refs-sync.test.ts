import { describe, it, expect } from "vitest";
import { extractRefsFromContent, bookOrderIndex } from "@/lib/document-refs";

describe("extractRefsFromContent", () => {
  it("dedupes repeated references", () => {
    const refs = extractRefsFromContent("Jo 3:16 e depois Jo 3:16 outra vez");
    expect(refs).toHaveLength(1);
    expect(refs[0].book_slug).toBe("john");
    expect(refs[0].verse_start).toBe(16);
  });

  it("returns empty when content has no refs", () => {
    expect(extractRefsFromContent("nenhuma referência aqui")).toHaveLength(0);
    expect(extractRefsFromContent("")).toHaveLength(0);
  });

  it("normalizes range refs", () => {
    const [r] = extractRefsFromContent("estudo em 1 Co 13:4-7 amor");
    expect(r.verse_start).toBe(4);
    expect(r.verse_end).toBe(7);
    expect(r.chapter).toBe(13);
  });

  it("keeps distinct refs separate", () => {
    const refs = extractRefsFromContent("Jo 3:16 e também Sl 23 no dia");
    expect(refs).toHaveLength(2);
    const slugs = refs.map((r) => r.book_slug).sort();
    expect(slugs).toEqual(["john", "psalms"]);
  });
});

describe("bookOrderIndex (canonical sort)", () => {
  it("Genesis comes before Revelation", () => {
    expect(bookOrderIndex("genesis")).toBeLessThan(bookOrderIndex("revelation"));
  });

  it("John (NT) comes after Psalms (OT)", () => {
    expect(bookOrderIndex("psalms")).toBeLessThan(bookOrderIndex("john"));
  });

  it("unknown slug goes to the end", () => {
    expect(bookOrderIndex("not-a-book")).toBeGreaterThan(bookOrderIndex("revelation"));
  });
});
