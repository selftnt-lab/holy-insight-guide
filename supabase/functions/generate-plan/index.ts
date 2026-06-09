import { CONFESSIONAL_SYSTEM_PROMPT } from "../_shared/system-prompt.ts";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

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
      const t = await response.text();
      console.error("AI error", response.status, t);
      return new Response(JSON.stringify({ error: `AI error ${response.status}` }), {
        status: response.status === 429 || response.status === 402 ? response.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
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
