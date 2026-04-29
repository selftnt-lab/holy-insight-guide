import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { bookName, chapter, verse, verseText } = await req.json();

    if (!bookName || !chapter || !verse) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios: bookName, chapter, verse" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um teólogo bíblico protestante (tradição reformada / evangélica clássica), especialista em referências cruzadas (cross-references) da Bíblia.

REGRAS RÍGIDAS:
- Forneça apenas referências REAIS e VERIFICÁVEIS da Bíblia (livro, capítulo, versículo existentes).
- Use SEMPRE os nomes dos livros em português, como na Almeida Revista e Corrigida (ex.: "Gênesis", "Salmos", "1 Coríntios", "Apocalipse").
- Siga padrões clássicos protestantes (ex.: Treasury of Scripture Knowledge, Bíblia de Estudo de Genebra, Scofield).
- NÃO invente versículos. Se não houver paralelo claro, retorne menos referências.
- Identifique 1 tema teológico central do versículo e liste de 4 a 8 referências cruzadas reais que tratam do mesmo tema.
- Para cada referência, escreva 1 frase curta explicando a conexão temática.`;

    const userPrompt = `Versículo de origem: **${bookName} ${chapter}:${verse}**
${verseText ? `Texto: "${verseText}"` : ""}

Liste referências cruzadas protestantes reais sobre o mesmo tema teológico.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_cross_references",
              description: "Retorna o tema teológico e as referências cruzadas.",
              parameters: {
                type: "object",
                properties: {
                  theme: {
                    type: "string",
                    description: "Tema teológico central do versículo (1 frase).",
                  },
                  references: {
                    type: "array",
                    minItems: 3,
                    maxItems: 8,
                    items: {
                      type: "object",
                      properties: {
                        book: { type: "string", description: "Nome do livro em português (Almeida)." },
                        chapter: { type: "integer", minimum: 1 },
                        verse_start: { type: "integer", minimum: 1 },
                        verse_end: { type: "integer", minimum: 1 },
                        connection: { type: "string", description: "Conexão temática em 1 frase." },
                      },
                      required: ["book", "chapter", "verse_start", "connection"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["theme", "references"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_cross_references" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione fundos nas configurações." }),
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "Resposta inválida do modelo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cross-references error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
