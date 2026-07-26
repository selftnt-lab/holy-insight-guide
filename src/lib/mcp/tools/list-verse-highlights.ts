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
  name: "list_verse_highlights",
  title: "List verse highlights",
  description:
    "List the signed-in user's most recent verse highlights (with optional notes and color) in RC Bible.",
  inputSchema: {
    book_slug: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Optional book slug filter (e.g. 'joao', 'romanos')."),
    chapter: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("Optional chapter filter (requires book_slug)."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Maximum highlights to return (1-100, default 30)."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ book_slug, chapter, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const cappedLimit = Math.min(Math.max(limit ?? 30, 1), 100);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("verse_highlights")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(cappedLimit);
    if (book_slug) query = query.eq("book_slug", book_slug);
    if (chapter) query = query.eq("chapter", chapter);
    const { data, error } = await query;
    if (error) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { highlights: data ?? [] },
    };
  },
});
