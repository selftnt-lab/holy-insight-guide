import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";


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
    const memCached = cache.get(key);
    if (memCached && Date.now() - memCached.ts < TTL) {
      return new Response(JSON.stringify(memCached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DB cache (cross-user, persistent)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const chapterNum = parseInt(chapter, 10);
    if (Number.isFinite(chapterNum) && chapterNum > 0) {
      const { data: dbCached } = await supabase
        .from("bible_chapter_cache")
        .select("payload")
        .eq("translation", translation)
        .eq("book_slug", book)
        .eq("chapter", chapterNum)
        .maybeSingle();
      if (dbCached?.payload) {
        cache.set(key, { data: dbCached.payload, ts: Date.now() });
        return new Response(JSON.stringify(dbCached.payload), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Almeida needs PT names; English translations accept the English slug as-is.
    const bookName = translation === "almeida" ? (SLUG_TO_PT[book] || book) : book;
    const apiUrl = `https://bible-api.com/${encodeURIComponent(bookName)}+${encodeURIComponent(chapter)}?translation=${translation}`;

    // Fetch com 1 retry e timeout
    const fetchWithTimeout = async (): Promise<Response> => {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 15000);
      try {
        return await fetch(apiUrl, { signal: ctrl.signal });
      } finally {
        clearTimeout(to);
      }
    };

    let res: Response;
    try {
      res = await fetchWithTimeout();
      if (!res.ok && res.status >= 500) {
        await new Promise((r) => setTimeout(r, 600));
        res = await fetchWithTimeout();
      }
    } catch (e) {
      console.error("bible-api network error:", e, "url:", apiUrl);
      return new Response(
        JSON.stringify({
          error:
            "Não foi possível carregar este capítulo no momento. Tente novamente em instantes.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("bible-api error:", res.status, t, "url:", apiUrl);
      return new Response(
        JSON.stringify({ error: "Não foi possível carregar este capítulo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    // Persiste em DB (best-effort)
    if (Number.isFinite(chapterNum) && chapterNum > 0) {
      supabase
        .from("bible_chapter_cache")
        .upsert(
          {
            translation,
            book_slug: book,
            chapter: chapterNum,
            payload: result,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "translation,book_slug,chapter" },
        )
        .then(({ error }) => {
          if (error) console.warn("bible cache upsert error:", error.message);
        });
    }

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
