import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WordStudyPayload {
  strong_code: string;
  language: "hebrew" | "greek" | "aramaic";
  original: string;
  transliteration: string;
  pronunciation: string;
  short_definition: string;
  full_definition: string;
  part_of_speech: string;
  context_meaning: string;
  secondary_meanings: string[];
  contextual_explanation: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { bookSlug, chapter, verse, verseText, wordPt, wordIndex } =
      await req.json();

    if (!bookSlug || !chapter || !verse || !verseText || !wordPt) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios ausentes." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const wordPtNorm = String(wordPt).toLowerCase();

    // 1) cache hit
    const { data: cached } = await supabase
      .from("word_study_cache")
      .select("payload")
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter)
      .eq("verse", verse)
      .ilike("word_pt", wordPtNorm)
      .maybeSingle();

    if (cached?.payload) {
      return new Response(
        JSON.stringify({ study: cached.payload, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    // Determine testament for language hint
    const ntBooks = new Set([
      "matthew","mark","luke","john","acts","romans",
      "1 corinthians","2 corinthians","galatians","ephesians","philippians",
      "colossians","1 thessalonians","2 thessalonians","1 timothy","2 timothy",
      "titus","philemon","hebrews","james","1 peter","2 peter",
      "1 john","2 john","3 john","jude","revelation",
    ]);
    const isNT = ntBooks.has(String(bookSlug).toLowerCase());
    const expectedLang = isNT ? "grego (koiné)" : "hebraico (ou aramaico em alguns trechos)";

    const systemPrompt = `Você é um assistente linguístico bíblico. Forneça dados técnicos sobre a palavra original (hebraico/grego/aramaico) por trás de uma palavra em português da tradução Almeida, baseando-se em léxicos clássicos: Strong, BDB, Thayer, BDAG.

REGRAS:
- NUNCA insira interpretações denominacionais ou doutrinárias.
- Foco em morfologia, semântica, raiz, e uso no contexto literário/histórico.
- Se houver dúvida sobre o código Strong correto, escolha o mais provável e reduza o campo "confidence".
- Português brasileiro claro.
- Não invente: se a palavra em PT for um conectivo sem equivalente direto, indique a partícula/preposição original mais próxima.`;

    const userPrompt = `Versículo: ${verseText}
Referência: ${bookSlug} ${chapter}:${verse}
Idioma esperado da palavra original: ${expectedLang}
Palavra em português a estudar: "${wordPt}"

Identifique a palavra original correspondente e retorne o estudo via tool calling.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              name: "return_word_study",
              description: "Retorna o estudo linguístico da palavra original.",
              parameters: {
                type: "object",
                properties: {
                  strong_code: {
                    type: "string",
                    description: "Código Strong (ex: G3056, H7225). Use H para hebraico/aramaico, G para grego.",
                  },
                  language: {
                    type: "string",
                    enum: ["hebrew", "greek", "aramaic"],
                  },
                  original: {
                    type: "string",
                    description: "Palavra no script original (ex: λόγος, רֵאשִׁית).",
                  },
                  transliteration: { type: "string" },
                  pronunciation: {
                    type: "string",
                    description: "Pronúncia aproximada (ex: LO-gos).",
                  },
                  short_definition: {
                    type: "string",
                    description: "Definição principal em 1 frase curta.",
                  },
                  full_definition: {
                    type: "string",
                    description: "Definição mais completa baseada em léxicos clássicos (2-4 frases).",
                  },
                  part_of_speech: {
                    type: "string",
                    description: "Classe gramatical (substantivo masc., verbo qal, etc.)",
                  },
                  context_meaning: {
                    type: "string",
                    description: "Como a palavra funciona NESTE versículo específico.",
                  },
                  secondary_meanings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Outros significados/usos (até 5).",
                  },
                  contextual_explanation: {
                    type: "string",
                    description: "Explicação linguística/literária mais profunda em markdown (3-6 frases). Sem viés doutrinário.",
                  },
                  confidence: {
                    type: "number",
                    description: "0 a 1. Quão certo você está do código Strong correto.",
                  },
                },
                required: [
                  "strong_code","language","original","transliteration","pronunciation",
                  "short_definition","full_definition","part_of_speech",
                  "context_meaning","secondary_meanings","contextual_explanation","confidence"
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_word_study" } },
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
        JSON.stringify({ error: "Erro ao gerar estudo da palavra." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou estudo estruturado.");

    const study = JSON.parse(toolCall.function.arguments) as WordStudyPayload;

    // 2) persist strong_entries
    await supabase.from("strong_entries").upsert(
      {
        strong_code: study.strong_code,
        language: study.language,
        original: study.original,
        transliteration: study.transliteration,
        pronunciation: study.pronunciation,
        short_definition: study.short_definition,
        full_definition: study.full_definition,
        part_of_speech: study.part_of_speech,
      },
      { onConflict: "strong_code" }
    );

    // 3) persist verse_word_map
    await supabase.from("verse_word_map").upsert(
      {
        book_slug: bookSlug,
        chapter,
        verse,
        word_index: wordIndex ?? 0,
        word_pt: wordPt,
        strong_code: study.strong_code,
        context_meaning: study.context_meaning,
      },
      { onConflict: "book_slug,chapter,verse,word_index" }
    );

    // 4) persist full payload cache
    await supabase.from("word_study_cache").insert({
      book_slug: bookSlug,
      chapter,
      verse,
      word_pt: wordPtNorm,
      payload: study,
    });

    return new Response(
      JSON.stringify({ study, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("word-study error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
