import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { callAI, extractJsonContent } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { verseRef, verseText } = await req.json();
    if (!verseRef || !verseText) {
      return new Response(JSON.stringify({ error: "Missing verse" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Crie um devocional curto baseado em ${verseRef}: "${verseText}".

Responda APENAS JSON:
{
  "meditation": "Meditação pastoral de 3-4 frases sobre o versículo.",
  "question": "Uma pergunta reflexiva pessoal.",
  "prayer": "Uma oração curta (2-3 frases) baseada no versículo."
}`;

    const ai = await callAI({
      model: "gemini-3.5-flash-lite",
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
