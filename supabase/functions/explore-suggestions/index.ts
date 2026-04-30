import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { bookName, bookSlug, chapter } = await req.json();

    if (!bookName || !bookSlug || !chapter) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios ausentes." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1) Cache hit?
    const { data: cached } = await supabase
      .from("explore_suggestions")
      .select("cards")
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter)
      .maybeSingle();

    if (cached?.cards) {
      return new Response(JSON.stringify({ cards: cached.cards, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Generate via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const systemPrompt = `Você é um teólogo cristão protestante que prepara material de estudo bíblico devocional. Dado um livro e capítulo, gere 6 cards interativos para um app de leitura bíblica. Os cards devem estar DIRETAMENTE conectados ao conteúdo do capítulo informado e ajudar o leitor a explorar o texto em profundidade. Use linguagem clara, acessível, em português brasileiro. Mantenha a teologia em padrão protestante histórico (sola scriptura, sola fide).`;

    const userPrompt = `Livro: ${bookName}\nCapítulo: ${chapter}\n\nGere 6 cards variando entre estes tipos:\n- "lugar": local geográfico ou cidade mencionada/relacionada\n- "personagem": pessoa importante que aparece no capítulo\n- "tema": tema teológico central do trecho\n- "pergunta": pergunta provocativa para reflexão\n\nDistribua de forma equilibrada (idealmente 1-2 de cada tipo, conforme o capítulo permite).`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
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
                        title: {
                          type: "string",
                          description: "Título curto, 1-3 palavras",
                        },
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
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar sugestões." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou cards estruturados");

    const args = JSON.parse(toolCall.function.arguments);
    const rawCards: Array<Omit<CardOut, "gradient">> = args.cards;

    const cards: CardOut[] = rawCards.slice(0, 6).map((c, i) => ({
      ...c,
      gradient: GRADIENTS[i % GRADIENTS.length],
    }));

    // 3) Cache (best-effort)
    await supabase
      .from("explore_suggestions")
      .upsert(
        { book_slug: bookSlug, chapter, cards },
        { onConflict: "book_slug,chapter" }
      );

    return new Response(JSON.stringify({ cards, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explore-suggestions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
