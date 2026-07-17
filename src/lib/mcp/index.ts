import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listWriterDocuments from "./tools/list-writer-documents";
import getWriterDocument from "./tools/get-writer-document";
import createWriterNote from "./tools/create-writer-note";
import listVerseHighlights from "./tools/list-verse-highlights";
import searchWriter from "./tools/search-writer";

// The OAuth issuer MUST be the direct Supabase host derived from the project
// ref that Vite inlines at build time. Using SUPABASE_URL (which may be the
// `.lovable.cloud` proxy on Lovable Cloud) would make mcp-js reject valid
// tokens because the issuer in the discovery document wouldn't match.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "rc-bible-mcp",
  title: "RC Bible",
  version: "0.1.0",
  instructions:
    "Access the signed-in user's RC Bible study workspace. Use `list_writer_documents` and `get_writer_document` to read their sermons, devotionals, and notes; `create_writer_note` to add a new document; `list_verse_highlights` to see highlighted verses; and `search_writer` to search across their library by text, tag, or bible reference (book/chapter/verse).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listWriterDocuments,
    getWriterDocument,
    createWriterNote,
    listVerseHighlights,
    searchWriter,
  ],
});
