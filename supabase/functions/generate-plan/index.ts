import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";
import { callAI, extractJsonContent } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, days, level } = await req.json();
    if (!topic || !days) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Crie um plano de leitura bíblica sobre **${topic}** com duração de **${days} dias**, nível **${level ?? "intermediário"}**.

Responda APENAS JSON:
{
  "title": "Título curto e atraente do plano",
  "description": "Descrição de 2-3 frases do que o leitor vai aprender",
  "days": [
    { "day": 1, "reference": "Salmos 23", "reflection": "Reflexão curta (2-3 frases) conectando a leitura ao tema." }
    // ... ${days} entradas no total
  ]
}

Use referências bíblicas reais e variadas (AT e NT). Reflexões pastorais e bíblicas, sem nomear tradições, denominações ou autores.`;

    const ai = await callAI({
      model: "gemini-3.6-flash",
      fallbackModel: "gemini-3.5-flash-lite",
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
