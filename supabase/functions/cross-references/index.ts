import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { callAI, extractToolCallArgs, jsonResponse } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookName, chapter, verse, verseText } = await req.json();

    if (!bookName || !chapter || !verse) {
      return jsonResponse(
        { error: "Parâmetros obrigatórios: bookName, chapter, verse" },
        400,
        corsHeaders,
      );
    }

    const technicalRules = `\n\n---\nINSTRUÇÃO TÉCNICA (esta tarefa):
- Forneça apenas referências REAIS e VERIFICÁVEIS da Bíblia (livro, capítulo, versículo existentes).
- Use SEMPRE os nomes dos livros em português, como na tradução Almeida (ex.: "Gênesis", "Salmos", "1 Coríntios", "Apocalipse").
- NÃO invente versículos. Se não houver paralelo claro, retorne menos referências.
- Identifique 1 tema bíblico central do versículo e liste de 4 a 8 referências cruzadas reais que tratam do mesmo tema.
- Para cada referência, escreva 1 frase curta explicando a conexão temática.`;

    const userPrompt = `Versículo de origem: **${bookName} ${chapter}:${verse}**
${verseText ? `Texto: "${verseText}"` : ""}

Liste referências cruzadas bíblicas reais sobre o mesmo tema.`;

    const ai = await callAI({
      model: "claude-sonnet-5",
      fallbackModel: "claude-haiku-4-5-20251001",
      messages: [
        { role: "system", content: CONFESSIONAL_SYSTEM_PROMPT + technicalRules },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_cross_references",
            description: "Retorna o tema bíblico e as referências cruzadas.",
            parameters: {
              type: "object",
              properties: {
                theme: {
                  type: "string",
                  description: "Tema bíblico central do versículo (1 frase).",
                },
                references: {
                  type: "array",
                  minItems: 3,
                  maxItems: 8,
                  items: {
                    type: "object",
                    properties: {
                      book: {
                        type: "string",
                        description: "Nome do livro em português (Almeida).",
                      },
                      chapter: { type: "integer", minimum: 1 },
                      verse_start: { type: "integer", minimum: 1 },
                      verse_end: { type: "integer", minimum: 1 },
                      connection: {
                        type: "string",
                        description: "Conexão temática em 1 frase.",
                      },
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
    });

    if (!ai.ok) return jsonResponse({ error: ai.error }, ai.status, corsHeaders);

    const aiJson = await ai.response.json();
    const parsed = extractToolCallArgs(aiJson);
    if (!parsed) {
      return jsonResponse({ error: "Resposta inválida do modelo." }, 500, corsHeaders);
    }
    return jsonResponse(parsed, 200, corsHeaders);
  } catch (e) {
    console.error("cross-references error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
      corsHeaders,
    );
  }
});
