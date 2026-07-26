// Admin-only knowledge base ingestion: background chunk + embed + persist
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embeddings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const EMBED_CONCURRENCY = 5;

function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + CHUNK_SIZE);
    let slice = clean.slice(i, end);
    if (end < clean.length) {
      const lastBreak = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
      );
      if (lastBreak > CHUNK_SIZE * 0.5) slice = slice.slice(0, lastBreak + 1);
    }
    chunks.push(slice.trim());
    i += slice.length - CHUNK_OVERLAP;
    if (i <= 0) i = slice.length;
  }
  return chunks.filter((c) => c.length > 0);
}

async function embed(input: string): Promise<number[]> {
  const embedding = await embedText(input, "RETRIEVAL_DOCUMENT");
  if (!embedding) throw new Error("Embedding falhou: GOOGLE_AI_API_KEY ausente ou erro na API do Google.");
  return embedding;
}

async function processJob(
  admin: SupabaseClient,
  jobId: string,
  userId: string,
  title: string,
  source: string | null,
  content: string,
) {
  try {
    const { data: doc, error: docErr } = await admin
      .from("kb_documents")
      .insert({ title, source, content, created_by: userId })
      .select("id")
      .single();
    if (docErr) throw docErr;

    const chunks = chunkText(content);
    await admin
      .from("kb_ingest_jobs")
      .update({
        document_id: doc.id,
        status: "processing",
        total_chunks: chunks.length,
      })
      .eq("id", jobId);

    let processed = 0;
    // Process in parallel batches to stay under CPU/wall time
    for (let i = 0; i < chunks.length; i += EMBED_CONCURRENCY) {
      const batch = chunks.slice(i, i + EMBED_CONCURRENCY);
      const embeddings = await Promise.all(
        batch.map((c) => embed(c)),
      );
      const rows = batch.map((c, k) => ({
        document_id: doc.id,
        chunk_index: i + k,
        content: c,
        embedding: embeddings[k] as unknown as string,
      }));
      const { error: chErr } = await admin.from("kb_chunks").insert(rows);
      if (chErr) throw chErr;
      processed += batch.length;
      await admin
        .from("kb_ingest_jobs")
        .update({
          processed_chunks: processed,
          progress: Math.round((processed / chunks.length) * 100),
        })
        .eq("id", jobId);
    }

    await admin
      .from("kb_ingest_jobs")
      .update({ status: "completed", progress: 100 })
      .eq("id", jobId);
  } catch (e) {
    console.error("kb-ingest job error:", e);
    await admin
      .from("kb_ingest_jobs")
      .update({
        status: "failed",
        error: e instanceof Error ? e.message : "Erro desconhecido",
      })
      .eq("id", jobId);
  }
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

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Acesso restrito a administradores" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const source = body.source ? String(body.source).trim() : null;
    const content = String(body.content ?? "").trim();
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Título e conteúdo são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (content.length > 5_000_000) {
      return new Response(
        JSON.stringify({
          error: "Documento muito grande (máx 5.000.000 caracteres).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create job record and process in background
    const { data: job, error: jobErr } = await admin
      .from("kb_ingest_jobs")
      .insert({ user_id: user.id, title, status: "pending" })
      .select("id")
      .single();
    if (jobErr) throw jobErr;

    // @ts-expect-error EdgeRuntime provided by supabase edge-runtime
    EdgeRuntime.waitUntil(
      processJob(admin, job.id, user.id, title, source, content),
    );

    return new Response(
      JSON.stringify({ job_id: job.id, status: "pending" }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("kb-ingest error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
