// Helper para gerar embeddings via Google AI Studio (Gemini) direto — sem passar
// pelo AI Gateway. Mesma família de modelo (gemini-embedding-001) usada
// antes, então a dimensão do vetor (3072) permanece compatível com o schema
// existente (kb_chunks.embedding halfvec(3072)).

const EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export async function embedText(
  text: string,
  taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" = "RETRIEVAL_QUERY",
): Promise<number[] | null> {
  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
  if (!apiKey) return null;

  try {
    const res = await fetch(`${EMBED_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType,
      }),
    });
    if (!res.ok) {
      console.error("embedText error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = await res.json();
    return json?.embedding?.values ?? null;
  } catch (e) {
    console.error("embedText network error:", e);
    return null;
  }
}
