import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Lists the signed-in user's Writer documents (sermons, devotionals, notes)
 * stored in RC Bible. RLS on public.user_documents ensures the caller only
 * ever sees rows where user_id = auth.uid().
 */
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
  name: "list_writer_documents",
  title: "List Writer documents",
  description:
    "List the signed-in user's Writer documents (sermons, devotionals, notes) in RC Bible, most recently updated first.",
  inputSchema: {
    type: z
      .enum(["sermon", "devotional", "note"])
      .optional()
      .describe("Optional document type filter."),
    include_archived: z
      .boolean()
      .optional()
      .describe("Include archived documents (default false)."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Maximum number of documents to return (1-50, default 20)."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ type, include_archived, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const cappedLimit = Math.min(Math.max(limit ?? 20, 1), 50);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("user_documents")
      .select("id, type, title, tags, is_archived, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(cappedLimit);
    if (type) query = query.eq("type", type);
    if (!include_archived) query = query.eq("is_archived", false);
    const { data, error } = await query;
    if (error) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { documents: data ?? [] },
    };
  },
});
