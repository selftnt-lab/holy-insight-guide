import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SLUG_TO_PT: Record<string, string> = {
  "genesis": "gênesis", "exodus": "êxodo", "leviticus": "levítico", "numbers": "números",
  "deuteronomy": "deuteronômio", "joshua": "josué", "judges": "juízes", "ruth": "rute",
  "1 samuel": "1 samuel", "2 samuel": "2 samuel", "1 kings": "1 reis", "2 kings": "2 reis",
  "1 chronicles": "1 crônicas", "2 chronicles": "2 crônicas", "ezra": "esdras",
  "nehemiah": "neemias", "esther": "ester", "job": "jó", "psalms": "salmos",
  "proverbs": "provérbios", "ecclesiastes": "eclesiastes", "song of solomon": "cânticos",
  "isaiah": "isaías", "jeremiah": "jeremias", "lamentations": "lamentações",
  "ezekiel": "ezequiel", "daniel": "daniel", "hosea": "oséias", "joel": "joel",
  "amos": "amós", "obadiah": "obadias", "jonah": "jonas", "micah": "miquéias",
  "nahum": "naum", "habakkuk": "habacuque", "zephaniah": "sofonias", "haggai": "ageu",
  "zechariah": "zacarias", "malachi": "malaquias", "matthew": "mateus", "mark": "marcos",
  "luke": "lucas", "john": "joão", "acts": "atos", "romans": "romanos",
  "1 corinthians": "1 coríntios", "2 corinthians": "2 coríntios", "galatians": "gálatas",
  "ephesians": "efésios", "philippians": "filipenses", "colossians": "colossenses",
  "1 thessalonians": "1 tessalonicenses", "2 thessalonians": "2 tessalonicenses",
  "1 timothy": "1 timóteo", "2 timothy": "2 timóteo", "titus": "tito",
  "philemon": "filemom", "hebrews": "hebreus", "james": "tiago", "1 peter": "1 pedro",
  "2 peter": "2 pedro", "1 john": "1 joão", "2 john": "2 joão", "3 john": "3 joão",
  "jude": "judas", "revelation": "apocalipse",
};

const cache = new Map<string, { verses: { verse: number; text: string }[]; ts: number }>();
const TTL = 1000 * 60 * 60 * 24;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function fetchChapter(book: string, chapter: number) {
  const key = `${book}:${chapter}`;
  const c = cache.get(key);
  if (c && Date.now() - c.ts < TTL) return c.verses;
  const ptName = SLUG_TO_PT[book] || book;
  const apiUrl = `https://bible-api.com/${encodeURIComponent(ptName)}+${chapter}?translation=almeida`;
  const res = await fetch(apiUrl);
  if (!res.ok) return [];
  const data = await res.json();
  const verses = (data.verses || []).map((v: { verse: number; text?: string }) => ({
    verse: v.verse,
    text: (v.text || "").trim(),
  }));
  cache.set(key, { verses, ts: Date.now() });
  return verses;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const book = (url.searchParams.get("book") || "").trim().toLowerCase();
    const totalChapters = parseInt(url.searchParams.get("chapters") || "0", 10);

    if (!q || q.length < 3) {
      return new Response(
        JSON.stringify({ error: "Digite ao menos 3 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!book || !totalChapters) {
      return new Response(
        JSON.stringify({ error: "Selecione um livro." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const needle = norm(q);
    const results: { chapter: number; verse: number; text: string }[] = [];
    const maxResults = 50;

    for (let ch = 1; ch <= totalChapters; ch++) {
      const verses = await fetchChapter(book, ch);
      for (const v of verses) {
        if (norm(v.text).includes(needle)) {
          results.push({ chapter: ch, verse: v.verse, text: v.text });
          if (results.length >= maxResults) break;
        }
      }
      if (results.length >= maxResults) break;
    }

    return new Response(JSON.stringify({ results, truncated: results.length >= maxResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bible-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
