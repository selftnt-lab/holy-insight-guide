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
  name: "create_writer_note",
  title: "Create Writer note",
  description:
    "Create a new document (sermon, devotional, or note) in the signed-in user's Writer library in RC Bible.",
  inputSchema: {
    type: z
      .enum(["sermon", "devotional", "note"])
      .describe("Document category."),
    title: z.string().trim().min(1).describe("Document title."),
    content_md: z
      .string()
      .describe("Markdown body. Bible references like 'João 3:16' are auto-detected on save."),
    tags: z
      .array(z.string().trim().min(1))
      .optional()
      .describe("Optional tag list."),
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  handler: async ({ type, title, content_md, tags }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_documents")
      .insert({
        user_id: ctx.getUserId(),
        type,
        title,
        content_md,
        tags: tags ?? [],
      })
      .select("id, type, title, created_at, updated_at")
      .single();
    if (error) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text", text: `Created ${type} "${title}" (${data.id}).` },
      ],
      structuredContent: { document: data },
    };
  },
});
