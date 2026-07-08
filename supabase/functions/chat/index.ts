import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";

const EMBED_MODEL = "google/gemini-embedding-001";

async function retrieveKnowledge(query: string, apiKey: string): Promise<string> {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE) return "";

    const embResp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: query.slice(0, 4000) }),
    });
    if (!embResp.ok) return "";
    const embJson = await embResp.json();
    const embedding = embJson.data?.[0]?.embedding;
    if (!embedding) return "";

    const client = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await client.rpc("match_kb_chunks", {
      query_embedding: embedding as unknown as string,
      match_count: 5,
    });
    if (error || !data || data.length === 0) return "";

    const relevant = (data as Array<{ content: string; title: string; source: string | null; similarity: number }>)
      .filter((r) => r.similarity > 0.35);
    if (relevant.length === 0) return "";

    return relevant
      .map((r, i) => `[Trecho ${i + 1} — ${r.title}${r.source ? ` (${r.source})` : ""}]\n${r.content}`)
      .join("\n\n---\n\n");
  } catch (e) {
    console.error("retrieveKnowledge error:", e);
    return "";
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRIMARY_MODEL = "google/gemini-2.5-flash";
const FALLBACK_MODEL = "google/gemini-2.5-flash-lite";

async function callGateway(model: string, payload: any, apiKey: string) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, model }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const ctx = body.context as
      | { bookName?: string; chapter?: number; text?: string }
      | undefined;
    const topic = body.topic as
      | { topicName?: string; description?: string }
      | undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = CONFESSIONAL_SYSTEM_PROMPT;

    if (ctx?.bookName && ctx?.chapter) {
      systemContent += `\n\nO usuário está lendo: **${ctx.bookName} ${ctx.chapter}** (versão Almeida).`;
      if (ctx.text) {
        const snippet = ctx.text.slice(0, 4000);
        systemContent += `\n\nTexto do capítulo:\n"""\n${snippet}\n"""\n\nResponda baseado neste texto sempre que possível.`;
      }
    }

    if (topic?.topicName) {
      systemContent += `\n\nO usuário quer aprender sobre **${topic.topicName}**${topic.description ? ` — ${topic.description}` : ""}. Forneça contexto bíblico, histórico e cultural sobre este tema.`;
    }

    // RAG: retrieve grounded material from admin-curated knowledge base
    const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const queryText = [
      topic?.topicName,
      ctx?.bookName ? `${ctx.bookName} ${ctx.chapter ?? ""}` : "",
      typeof lastUser?.content === "string" ? lastUser.content : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (queryText) {
      const kb = await retrieveKnowledge(queryText, LOVABLE_API_KEY);
      if (kb) {
        systemContent += `\n\n## BASE DE CONHECIMENTO APROVADA (fonte primária)\nUse OBRIGATORIAMENTE os trechos abaixo como base doutrinária e material de apoio quando forem relevantes à pergunta. Se contradisserem seu conhecimento genérico, os trechos abaixo prevalecem. Não cite os trechos como "documento X" — integre o conteúdo na resposta com naturalidade pastoral.\n\n"""\n${kb}\n"""`;
      }
    }

    const payload = {
      messages: [{ role: "system", content: systemContent }, ...messages],
      stream: true,
    };

    let response = await callGateway(PRIMARY_MODEL, payload, LOVABLE_API_KEY);

    // fallback for transient errors
    if (!response.ok && [500, 502, 503, 504].includes(response.status)) {
      console.warn("Primary model failed, trying fallback:", response.status);
      response = await callGateway(FALLBACK_MODEL, payload, LOVABLE_API_KEY);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione fundos nas configurações do workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: `Erro no serviço de IA (${response.status})` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
