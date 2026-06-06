import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// bible-api.com's "almeida" translation requires Portuguese book names.
const SLUG_TO_PT: Record<string, string> = {
  "genesis": "gênesis",
  "exodus": "êxodo",
  "leviticus": "levítico",
  "numbers": "números",
  "deuteronomy": "deuteronômio",
  "joshua": "josué",
  "judges": "juízes",
  "ruth": "rute",
  "1 samuel": "1 samuel",
  "2 samuel": "2 samuel",
  "1 kings": "1 reis",
  "2 kings": "2 reis",
  "1 chronicles": "1 crônicas",
  "2 chronicles": "2 crônicas",
  "ezra": "esdras",
  "nehemiah": "neemias",
  "esther": "ester",
  "job": "jó",
  "psalms": "salmos",
  "proverbs": "provérbios",
  "ecclesiastes": "eclesiastes",
  "song of solomon": "cânticos",
  "isaiah": "isaías",
  "jeremiah": "jeremias",
  "lamentations": "lamentações",
  "ezekiel": "ezequiel",
  "daniel": "daniel",
  "hosea": "oséias",
  "joel": "joel",
  "amos": "amós",
  "obadiah": "obadias",
  "jonah": "jonas",
  "micah": "miquéias",
  "nahum": "naum",
  "habakkuk": "habacuque",
  "zephaniah": "sofonias",
  "haggai": "ageu",
  "zechariah": "zacarias",
  "malachi": "malaquias",
  "matthew": "mateus",
  "mark": "marcos",
  "luke": "lucas",
  "john": "joão",
  "acts": "atos",
  "romans": "romanos",
  "1 corinthians": "1 coríntios",
  "2 corinthians": "2 coríntios",
  "galatians": "gálatas",
  "ephesians": "efésios",
  "philippians": "filipenses",
  "colossians": "colossenses",
  "1 thessalonians": "1 tessalonicenses",
  "2 thessalonians": "2 tessalonicenses",
  "1 timothy": "1 timóteo",
  "2 timothy": "2 timóteo",
  "titus": "tito",
  "philemon": "filemom",
  "hebrews": "hebreus",
  "james": "tiago",
  "1 peter": "1 pedro",
  "2 peter": "2 pedro",
  "1 john": "1 joão",
  "2 john": "2 joão",
  "3 john": "3 joão",
  "jude": "judas",
  "revelation": "apocalipse",
};

const ALLOWED_TRANSLATIONS = new Set(["almeida", "kjv", "web", "asv"]);

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const book = (url.searchParams.get("book") || "").trim().toLowerCase();
    const chapter = (url.searchParams.get("chapter") || "1").trim();
    let translation = (url.searchParams.get("translation") || "almeida").trim().toLowerCase();
    if (!ALLOWED_TRANSLATIONS.has(translation)) translation = "almeida";

    if (!book) {
      return new Response(
        JSON.stringify({ error: "Missing 'book' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const key = `${book}:${chapter}:${translation}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Almeida needs PT names; English translations accept the English slug as-is.
    const bookName = translation === "almeida" ? (SLUG_TO_PT[book] || book) : book;
    const apiUrl = `https://bible-api.com/${encodeURIComponent(bookName)}+${encodeURIComponent(chapter)}?translation=${translation}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const t = await res.text();
      console.error("bible-api error:", res.status, t, "url:", apiUrl);
      return new Response(
        JSON.stringify({ error: "Não foi possível carregar este capítulo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const result = {
      reference: data.reference,
      translation: data.translation_name || translation,
      verses: (data.verses || []).map((v: { verse: number; text?: string }) => ({
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
