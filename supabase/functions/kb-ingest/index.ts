// Admin-only knowledge base ingestion: chunk + embed + persist
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMBED_MODEL = "google/gemini-embedding-001";
const CHUNK_SIZE = 1200; // chars
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + CHUNK_SIZE);
    let slice = clean.slice(i, end);
    // try to break on paragraph or sentence boundary
    if (end < clean.length) {
      const lastBreak = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
      );
      if (lastBreak > CHUNK_SIZE * 0.5) {
        slice = slice.slice(0, lastBreak + 1);
      }
    }
    chunks.push(slice.trim());
    i += slice.length - CHUNK_OVERLAP;
    if (i <= 0) i = slice.length;
  }
  return chunks.filter((c) => c.length > 0);
}

async function embed(input: string, apiKey: string): Promise<number[]> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Embedding falhou (${resp.status}): ${t}`);
  }
  const json = await resp.json();
  return json.data[0].embedding;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Identify user via their JWT
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Verify admin role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const source = body.source ? String(body.source).trim() : null;
    const content = String(body.content ?? "").trim();
    if (!title || !content) {
      return new Response(JSON.stringify({ error: "Título e conteúdo são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (content.length > 5_000_000) {
      return new Response(JSON.stringify({ error: "Documento muito grande (máx 5.000.000 caracteres). Divida em partes menores." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert document
    const { data: doc, error: docErr } = await admin
      .from("kb_documents")
      .insert({ title, source, content, created_by: user.id })
      .select("id")
      .single();
    if (docErr) throw docErr;

    const chunks = chunkText(content);
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 0; i < chunks.length; i++) {
      const vec = await embed(chunks[i], LOVABLE_API_KEY);
      rows.push({
        document_id: doc.id,
        chunk_index: i,
        content: chunks[i],
        embedding: vec as unknown as string,
      });
    }

    // Insert in batches of 20
    for (let i = 0; i < rows.length; i += 20) {
      const batch = rows.slice(i, i + 20);
      const { error: chErr } = await admin.from("kb_chunks").insert(batch);
      if (chErr) throw chErr;
    }

    return new Response(
      JSON.stringify({ id: doc.id, chunks: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("kb-ingest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
