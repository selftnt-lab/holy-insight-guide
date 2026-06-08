import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: CONFESSIONAL_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Muitas requisições." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(JSON.stringify({ error: "Créditos esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await response.text();
      console.error("AI error", response.status, t);
      return new Response(JSON.stringify({ error: `AI error ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

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
