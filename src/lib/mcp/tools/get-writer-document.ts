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
  name: "get_writer_document",
  title: "Get Writer document",
  description:
    "Read the full markdown content of one of the signed-in user's Writer documents in RC Bible.",
  inputSchema: {
    document_id: z
      .string()
      .uuid()
      .describe("UUID of the document to fetch. Get IDs via list_writer_documents."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ document_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated." }],
        isError: true,
      };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_documents")
      .select(
        "id, type, title, content_md, tags, is_archived, created_at, updated_at",
      )
      .eq("id", document_id)
      .maybeSingle();
    if (error) {
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    if (!data) {
      return {
        content: [{ type: "text", text: "Document not found." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { document: data },
    };
  },
});
