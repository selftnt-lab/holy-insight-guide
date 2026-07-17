import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "search_writer",
  title: "Search Writer",
  description:
    "Search the signed-in user's Writer documents by free text, tag, and/or bible reference (book_slug + optional chapter/verse).",
  inputSchema: {
    query: z
      .string()
      .trim()
      .optional()
      .describe("Free-text search across title, content, and tags."),
    tag: z.string().trim().optional().describe("Exact tag filter."),
    book_slug: z
      .string()
      .trim()
      .optional()
      .describe("Bible reference book slug filter (e.g. 'joao')."),
    chapter: z.number().int().min(1).optional(),
    verse: z.number().int().min(1).optional(),
    include_archived: z.boolean().optional(),
    limit: z.number().int().optional().describe("Max results (1-50, default 20)."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("search_user_documents", {
      p_query: input.query ?? null,
      p_archived: input.include_archived ?? false,
      p_tag: input.tag ?? null,
      p_book_slug: input.book_slug ?? null,
      p_chapter: input.chapter ?? null,
      p_verse: input.verse ?? null,
      p_limit: Math.min(Math.max(input.limit ?? 20, 1), 50),
      p_offset: 0,
    });
    if (error) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});
