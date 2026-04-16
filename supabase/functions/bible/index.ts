import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const cache = new Map<string, { data: any; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const book = (url.searchParams.get("book") || "").trim().toLowerCase();
    const chapter = (url.searchParams.get("chapter") || "1").trim();

    if (!book) {
      return new Response(
        JSON.stringify({ error: "Missing 'book' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const key = `${book}:${chapter}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // bible-api.com supports Portuguese "almeida" translation
    const apiUrl = `https://bible-api.com/${encodeURIComponent(book)}+${encodeURIComponent(chapter)}?translation=almeida`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const t = await res.text();
      console.error("bible-api error:", res.status, t);
      return new Response(
        JSON.stringify({ error: "Não foi possível carregar este capítulo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const result = {
      reference: data.reference,
      translation: data.translation_name || "Almeida",
      verses: (data.verses || []).map((v: any) => ({
        verse: v.verse,
        text: (v.text || "").trim(),
      })),
    };

    cache.set(key, { data: result, ts: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bible function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
