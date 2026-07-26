import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { callAI, extractToolCallArgs, jsonResponse } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GRADIENTS = [
  "from-amber-800/80 to-amber-950/90",
  "from-sky-700/80 to-sky-950/90",
  "from-orange-800/80 to-orange-950/90",
  "from-indigo-700/80 to-indigo-950/90",
  "from-teal-700/80 to-teal-950/90",
  "from-emerald-700/80 to-emerald-950/90",
  "from-rose-700/80 to-rose-950/90",
  "from-violet-700/80 to-violet-950/90",
];

interface CardOut {
  type: "lugar" | "personagem" | "tema" | "pergunta";
  title: string;
  description: string;
  prompt: string;
  gradient: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookName, bookSlug, chapter } = await req.json();
    if (!bookName || !bookSlug || !chapter) {
      return jsonResponse({ error: "Parâmetros obrigatórios ausentes." }, 400, corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Cache hit
    const { data: cached } = await supabase
      .from("explore_suggestions")
      .select("cards")
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter)
      .maybeSingle();

    if (cached?.cards) {
      return jsonResponse({ cards: cached.cards, cached: true }, 200, corsHeaders);
    }

    const userPrompt = `Livro: ${bookName}
Capítulo: ${chapter}

Gere 6 cards variando entre estes tipos:
- "lugar": local geográfico ou cidade mencionada/relacionada
- "personagem": pessoa importante que aparece no capítulo
- "tema": tema teológico central do trecho
- "pergunta": pergunta provocativa para reflexão

Distribua de forma equilibrada (idealmente 1-2 de cada tipo, conforme o capítulo permite).
Os cards devem estar diretamente conectados ao conteúdo do capítulo informado e ajudar o leitor a explorar o texto em profundidade. Linguagem clara, acessível, em português brasileiro.`;

    const ai = await callAI({
      model: "claude-sonnet-5",
      fallbackModel: "claude-haiku-4-5-20251001",
      messages: [
        { role: "system", content: CONFESSIONAL_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_cards",
            description: "Retorna 6 cards de exploração contextual",
            parameters: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  minItems: 6,
                  maxItems: 6,
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["lugar", "personagem", "tema", "pergunta"],
                      },
                      title: { type: "string", description: "Título curto, 1-3 palavras" },
                      description: {
                        type: "string",
                        description: "Descrição em 1 frase curta (máx 90 caracteres)",
                      },
                      prompt: {
                        type: "string",
                        description:
                          "Pergunta ou pedido completo que será enviado ao Tutor IA quando o usuário tocar no card",
                      },
                    },
                    required: ["type", "title", "description", "prompt"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["cards"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_cards" } },
    });

    if (!ai.ok) return jsonResponse({ error: ai.error }, ai.status, corsHeaders);

    const aiJson = await ai.response.json();
    const args = extractToolCallArgs<{ cards: Array<Omit<CardOut, "gradient">> }>(aiJson);
    if (!args?.cards) {
      return jsonResponse({ error: "IA não retornou cards estruturados." }, 500, corsHeaders);
    }

    const cards: CardOut[] = args.cards.slice(0, 6).map((c, i) => ({
      ...c,
      gradient: GRADIENTS[i % GRADIENTS.length],
    }));

    await supabase
      .from("explore_suggestions")
      .upsert(
        { book_slug: bookSlug, chapter, cards },
        { onConflict: "book_slug,chapter" },
      );

    return jsonResponse({ cards, cached: false }, 200, corsHeaders);
  } catch (e) {
    console.error("explore-suggestions error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
      corsHeaders,
    );
  }
});
