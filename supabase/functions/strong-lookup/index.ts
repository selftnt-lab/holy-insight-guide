import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code")?.trim();
    const q = url.searchParams.get("q")?.trim();
    const limitParam = Number(url.searchParams.get("limit") || "50");
    const limit = Math.min(Math.max(limitParam, 1), 200);

    if (!code && !q) {
      return new Response(
        JSON.stringify({ error: "Informe ?code=Gxxxx ou ?q=palavra" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (code) {
      // Fetch dictionary entry
      const { data: entry } = await supabase
        .from("strong_entries")
        .select("*")
        .eq("strong_code", code)
        .maybeSingle();

      // Fetch all occurrences for this code
      const { data: occRows } = await supabase
        .from("verse_word_map")
        .select("book_slug, chapter, verse, word_index, word_pt, context_meaning")
        .eq("strong_code", code)
        .order("book_slug")
        .order("chapter")
        .order("verse")
        .limit(limit);

      const occurrences = occRows || [];

      // Frequency by book
      const freqByBook: Record<string, number> = {};
      for (const o of occurrences) {
        freqByBook[o.book_slug] = (freqByBook[o.book_slug] || 0) + 1;
      }

      return new Response(
        JSON.stringify({
          entry: entry || null,
          occurrences,
          total: occurrences.length,
          freq_by_book: freqByBook,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search by Portuguese word / definition
    const term = q!.toLowerCase();
    const { data: rows } = await supabase
      .from("verse_word_map")
      .select("book_slug, chapter, verse, word_index, word_pt, strong_code, context_meaning")
      .ilike("word_pt", `%${term}%`)
      .limit(limit);

    // Group by strong_code
    const grouped = new Map<
      string,
      { strong_code: string; count: number; samples: any[] }
    >();
    for (const r of rows || []) {
      if (!r.strong_code) continue;
      const g = grouped.get(r.strong_code) || {
        strong_code: r.strong_code,
        count: 0,
        samples: [],
      };
      g.count += 1;
      if (g.samples.length < 5) g.samples.push(r);
      grouped.set(r.strong_code, g);
    }

    const codes = Array.from(grouped.keys());
    let entries: any[] = [];
    if (codes.length) {
      const { data: ents } = await supabase
        .from("strong_entries")
        .select("*")
        .in("strong_code", codes);
      entries = ents || [];
    }

    const results = Array.from(grouped.values())
      .map((g) => ({
        ...g,
        entry: entries.find((e) => e.strong_code === g.strong_code) || null,
      }))
      .sort((a, b) => b.count - a.count);

    return new Response(
      JSON.stringify({ query: term, results, total: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("strong-lookup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
