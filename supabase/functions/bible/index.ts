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

const ALLOWED_TRANSLATIONS = new Set([
  "almeida", "kjv", "web", "asv",
  "arc", "acf", "ara", "naa", "nvi", "ntlh", "nvt", "kja",
]);

// Book order 1..66 matches the standard Protestant canon (same order as BIBLE_BOOKS).
const SLUG_TO_BOOK_ID: Record<string, number> = {
  "genesis": 1, "exodus": 2, "leviticus": 3, "numbers": 4, "deuteronomy": 5,
  "joshua": 6, "judges": 7, "ruth": 8, "1 samuel": 9, "2 samuel": 10,
  "1 kings": 11, "2 kings": 12, "1 chronicles": 13, "2 chronicles": 14,
  "ezra": 15, "nehemiah": 16, "esther": 17, "job": 18, "psalms": 19,
  "proverbs": 20, "ecclesiastes": 21, "song of solomon": 22, "isaiah": 23,
  "jeremiah": 24, "lamentations": 25, "ezekiel": 26, "daniel": 27, "hosea": 28,
  "joel": 29, "amos": 30, "obadiah": 31, "jonah": 32, "micah": 33, "nahum": 34,
  "habakkuk": 35, "zephaniah": 36, "haggai": 37, "zechariah": 38, "malachi": 39,
  "matthew": 40, "mark": 41, "luke": 42, "john": 43, "acts": 44, "romans": 45,
  "1 corinthians": 46, "2 corinthians": 47, "galatians": 48, "ephesians": 49,
  "philippians": 50, "colossians": 51, "1 thessalonians": 52, "2 thessalonians": 53,
  "1 timothy": 54, "2 timothy": 55, "titus": 56, "philemon": 57, "hebrews": 58,
  "james": 59, "1 peter": 60, "2 peter": 61, "1 john": 62, "2 john": 63,
  "3 john": 64, "jude": 65, "revelation": 66,
};

const SLUG_TO_DISPLAY: Record<string, string> = {
  "genesis": "Gênesis", "exodus": "Êxodo", "leviticus": "Levítico", "numbers": "Números",
  "deuteronomy": "Deuteronômio", "joshua": "Josué", "judges": "Juízes", "ruth": "Rute",
  "1 samuel": "1 Samuel", "2 samuel": "2 Samuel", "1 kings": "1 Reis", "2 kings": "2 Reis",
  "1 chronicles": "1 Crônicas", "2 chronicles": "2 Crônicas", "ezra": "Esdras",
  "nehemiah": "Neemias", "esther": "Ester", "job": "Jó", "psalms": "Salmos",
  "proverbs": "Provérbios", "ecclesiastes": "Eclesiastes", "song of solomon": "Cânticos",
  "isaiah": "Isaías", "jeremiah": "Jeremias", "lamentations": "Lamentações",
  "ezekiel": "Ezequiel", "daniel": "Daniel", "hosea": "Oséias", "joel": "Joel",
  "amos": "Amós", "obadiah": "Obadias", "jonah": "Jonas", "micah": "Miquéias",
  "nahum": "Naum", "habakkuk": "Habacuque", "zephaniah": "Sofonias", "haggai": "Ageu",
  "zechariah": "Zacarias", "malachi": "Malaquias", "matthew": "Mateus", "mark": "Marcos",
  "luke": "Lucas", "john": "João", "acts": "Atos", "romans": "Romanos",
  "1 corinthians": "1 Coríntios", "2 corinthians": "2 Coríntios", "galatians": "Gálatas",
  "ephesians": "Efésios", "philippians": "Filipenses", "colossians": "Colossenses",
  "1 thessalonians": "1 Tessalonicenses", "2 thessalonians": "2 Tessalonicenses",
  "1 timothy": "1 Timóteo", "2 timothy": "2 Timóteo", "titus": "Tito",
  "philemon": "Filemom", "hebrews": "Hebreus", "james": "Tiago", "1 peter": "1 Pedro",
  "2 peter": "2 Pedro", "1 john": "1 João", "2 john": "2 João", "3 john": "3 João",
  "jude": "Judas", "revelation": "Apocalipse",
};

// Codes accepted by bolls.life
const BOLLS_CODES: Record<string, string> = {
  arc: "ARC09",
  acf: "ACF11",
  ara: "ARA",
  naa: "NAA",
  nvi: "NVIPT",
  ntlh: "NTLH",
  nvt: "NVT",
  kja: "KJA",
};

interface BollsVerse { verse: number; text?: string }

const fetchFromBolls = async (
  translation: string,
  bookSlug: string,
  chapter: number,
): Promise<{ reference: string; translation: string; verses: { verse: number; text: string }[] } | null> => {
  const code = BOLLS_CODES[translation];
  const bookId = SLUG_TO_BOOK_ID[bookSlug];
  if (!code || !bookId) return null;

  const url = `https://bolls.life/get-chapter/${code}/${bookId}/${chapter}/`;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "HolyInsightGuide/1.0" },
    });
  } finally {
    clearTimeout(to);
  }
  if (!res.ok) {
    console.error("bolls.life error:", res.status, url);
    return null;
  }
  const arr = (await res.json()) as BollsVerse[];
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const display = SLUG_TO_DISPLAY[bookSlug] || bookSlug;
  return {
    reference: `${display} ${chapter}`,
    translation: translation.toUpperCase(),
    verses: arr.map((v) => ({
      verse: v.verse,
      // Strip Strong / footnote markup that bolls sometimes embeds
      text: (v.text || "")
        .replace(/<S>.*?<\/S>/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    })),
  };
};

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

    let result: { reference: string; translation: string; verses: { verse: number; text: string }[] } | null = null;

    // Route Portuguese modern translations through bolls.life
    if (BOLLS_CODES[translation] && Number.isFinite(chapterNum) && chapterNum > 0) {
      try {
        result = await fetchFromBolls(translation, book, chapterNum);
      } catch (e) {
        console.error("bolls.life fetch error:", e);
        result = null;
      }
    }

    // Fallback to bible-api.com (legacy "almeida" + English versions)
    if (!result) {
      const legacyTranslation = BOLLS_CODES[translation] ? "almeida" : translation;
      const bookName = legacyTranslation === "almeida" ? (SLUG_TO_PT[book] || book) : book;
      const apiUrl = `https://bible-api.com/${encodeURIComponent(bookName)}+${encodeURIComponent(chapter)}?translation=${legacyTranslation}`;

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
      result = {
        reference: data.reference,
        translation: data.translation_name || legacyTranslation,
        verses: (data.verses || []).map((v: { verse: number; text?: string }) => ({
          verse: v.verse,
          text: (v.text || "").trim(),
        })),
      };
    }


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
