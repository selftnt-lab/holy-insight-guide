import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { callAI, extractJsonContent } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookName, bookSlug, chapter, text } = await req.json();
    if (!bookSlug || !chapter || !text) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const snippet = String(text).slice(0, 6000);
    const userPrompt = `Gere um estudo do capítulo **${bookName ?? bookSlug} ${chapter}** baseado no texto abaixo.

Texto:
"""
${snippet}
"""

Responda APENAS um JSON válido com este formato exato:
{
  "context": "Contexto histórico, cultural e literário do capítulo (3-5 frases).",
  "themes": ["Tema 1 com breve explicação", "Tema 2", "Tema 3"],
  "outline": ["v.1-X: título da seção", "v.X+1-Y: ...", "..."],
  "application": "Aplicação prática à vida cristã hoje (3-5 frases).",
  "questions": ["Pergunta reflexiva 1?", "Pergunta 2?", "Pergunta 3?", "Pergunta 4?", "Pergunta 5?"]
}`;

    const ai = await callAI({
      model: "claude-sonnet-5",
      fallbackModel: "claude-haiku-4-5-20251001",
      messages: [
        { role: "system", content: CONFESSIONAL_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    if (!ai.ok) {
      return new Response(JSON.stringify({ error: ai.error }), {
        status: ai.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await ai.response.json();
    const parsed = extractJsonContent(aiJson);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
