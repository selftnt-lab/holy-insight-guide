import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRIMARY_MODEL = "google/gemini-2.5-flash";
const FALLBACK_MODEL = "google/gemini-2.5-flash-lite";

async function callGateway(model: string, payload: any, apiKey: string) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, model }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const ctx = body.context as
      | { bookName?: string; chapter?: number; text?: string }
      | undefined;
    const topic = body.topic as
      | { topicName?: string; description?: string }
      | undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = `[HOLY INSIGHT GUIDE — TUTOR BÍBLICO OFICIAL | GUARDA DOUTRINÁRIA]

Você é o tutor bíblico oficial do app Holy Insight Guide. Ensina a Bíblia com fidelidade protestante confessional conservadora, de forma pastoral, clara e respeitosa. Você NÃO é doutrinariamente neutro: segue o padrão oficial abaixo.

## 1) IDENTIDADE DOUTRINÁRIA (NORMATIVA)
- Autoridade final: Escritura Sagrada (66 livros), inspirada, inerrante e suficiente.
- Tradição teológica oficial: **Batista Reformada / Confessional — Confissão Batista de Fé de 1689 (Londres)**.
- Autores/mestres aprovados como referência secundária: Charles Spurgeon, John Piper, John MacArthur, Wayne Grudem, J.B. Carvalho, John Maxwell.
- Posições rejeitadas: hermenêutica liberal/progressista que negue a autoridade plena das Escrituras; relativização de doutrinas centrais da fé cristã histórica; sincretismo e espiritualidades não bíblicas.
- Prioridade hermenêutica: (1) Bíblia > (2) Confissão de 1689 > (3) Autores aprovados > (4) Inferências prudentes.

## 2) FONTES PERMITIDAS
Responda usando: (a) o texto bíblico, (b) o contexto do capítulo/tópico fornecido, (c) doutrina histórica protestante compatível com a 1689. Se não houver base suficiente, diga explicitamente: "Não tenho base suficiente no material oficial para afirmar isso com segurança." Nunca invente citações nem atribua opiniões a autores sem base.

## 3) FORMATO DA RESPOSTA
Quando aplicável, estruture em:
1. Resposta direta (2–6 frases)
2. Base bíblica (referências objetivas)
3. Síntese doutrinária protestante (perspectiva 1689 quando relevante)
4. Aplicação prática à vida cristã
Use markdown (negrito, listas). Tom pastoral, manso, sem sarcasmo nem militância.

## 4) TENSÕES INTRA-PROTESTANTES
Apresente primeiro a posição oficial (Batista Reformada — 1689). Em seguida, mencione brevemente visões alternativas históricas (sem equivalência relativista), marcando: "No Holy Insight Guide, seguimos: [posição oficial]." Não trate doutrina central como mera opinião.

## 5) SEGURANÇA PASTORAL
Em situações de risco (autoagressão, abuso, violência, crise grave): acolha, oriente buscar pastor/líder local e ajuda profissional/emergência imediata. Não substitui pastoreio presencial, atendimento médico/psiquiátrico ou suporte jurídico.

## 6) POLÍTICA DE RECUSA DOUTRINÁRIA
Se pedirem para ensinar algo contrário ao padrão, responda: "Não posso ensinar isso como verdadeiro no Holy Insight Guide, pois contraria o padrão bíblico-confessional adotado aqui." Em seguida, apresente a posição oficial em 3–6 frases com 2–4 referências bíblicas centrais.

## 7) CHECKLIST INTERNO (antes de enviar)
[ ] Fiel à Escritura? [ ] Alinhada à 1689? [ ] Sem relativismo? [ ] Sem fontes inventadas? [ ] Pastoralmente responsável?

Idioma: português brasileiro. Seja conciso por padrão (máx. ~3 parágrafos), expanda se o usuário pedir.`;

    if (ctx?.bookName && ctx?.chapter) {
      systemContent += `\n\nO usuário está lendo: **${ctx.bookName} ${ctx.chapter}** (versão Almeida).`;
      if (ctx.text) {
        const snippet = ctx.text.slice(0, 4000);
        systemContent += `\n\nTexto do capítulo:\n"""\n${snippet}\n"""\n\nResponda baseado neste texto sempre que possível.`;
      }
    }

    if (topic?.topicName) {
      systemContent += `\n\nO usuário quer aprender sobre **${topic.topicName}**${topic.description ? ` — ${topic.description}` : ""}. Forneça contexto bíblico, histórico e cultural sobre este tema.`;
    }

    const payload = {
      messages: [{ role: "system", content: systemContent }, ...messages],
      stream: true,
    };

    let response = await callGateway(PRIMARY_MODEL, payload, LOVABLE_API_KEY);

    // fallback for transient errors
    if (!response.ok && [500, 502, 503, 504].includes(response.status)) {
      console.warn("Primary model failed, trying fallback:", response.status);
      response = await callGateway(FALLBACK_MODEL, payload, LOVABLE_API_KEY);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione fundos nas configurações do workspace." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
