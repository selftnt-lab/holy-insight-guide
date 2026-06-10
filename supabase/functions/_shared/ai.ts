// Helper unificado para chamar o Lovable AI Gateway a partir de Edge Functions.
// - Tratamento padronizado de 429/402/5xx
// - Fallback automático para modelo "lite" em erros 5xx
// - Mensagens de erro em português, prontas para repassar ao cliente
//
// Não expor LOVABLE_API_KEY ao cliente. Use sempre via Deno.env.

export interface CallAIOptions {
  model: string;
  fallbackModel?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  // OpenAI-compatible options
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  stream?: boolean;
  // Tempo máximo de espera por chamada (ms)
  timeoutMs?: number;
}

export interface CallAISuccess {
  ok: true;
  response: Response;
}
export interface CallAIError {
  ok: false;
  status: number;
  error: string;
}
export type CallAIResult = CallAISuccess | CallAIError;

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function postOnce(
  apiKey: string,
  model: string,
  body: Omit<CallAIOptions, "model" | "fallbackModel" | "timeoutMs">,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(GATEWAY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, ...body }),
    });
  } finally {
    clearTimeout(t);
  }
}

export async function callLovableAI(opts: CallAIOptions): Promise<CallAIResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return { ok: false, status: 500, error: "LOVABLE_API_KEY não configurada." };
  }

  const { model, fallbackModel, timeoutMs = 60_000, ...rest } = opts;

  let res: Response;
  try {
    res = await postOnce(apiKey, model, rest, timeoutMs);
  } catch (e) {
    console.error("AI gateway network error:", e);
    return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
  }

  // Retry em 5xx com fallback
  if (!res.ok && [500, 502, 503, 504].includes(res.status) && fallbackModel) {
    console.warn(`AI primary failed (${res.status}); tentando fallback ${fallbackModel}`);
    try {
      res = await postOnce(apiKey, fallbackModel, rest, timeoutMs);
    } catch (e) {
      console.error("AI fallback network error:", e);
      return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
    }
  }

  if (res.ok) return { ok: true, response: res };

  if (res.status === 429) {
    return {
      ok: false,
      status: 429,
      error: "Muitas requisições. Tente novamente em alguns segundos.",
    };
  }
  if (res.status === 402) {
    return {
      ok: false,
      status: 402,
      error: "Créditos de IA esgotados. Solicite ao administrador adicionar fundos.",
    };
  }

  const body = await res.text().catch(() => "");
  console.error("AI gateway error:", res.status, body);
  return {
    ok: false,
    status: 500,
    error: `Erro no serviço de IA (${res.status}).`,
  };
}

export function jsonResponse(
  payload: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Extrai JSON do conteúdo de uma resposta no formato chat.completions.
export function extractJsonContent<T = unknown>(aiBody: any): T {
  const raw = aiBody?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw) as T;
  } catch {
    const m = String(raw).match(/\{[\s\S]*\}/);
    return (m ? JSON.parse(m[0]) : {}) as T;
  }
}

// Extrai argumentos de tool call.
export function extractToolCallArgs<T = unknown>(aiBody: any): T | null {
  const tc = aiBody?.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc?.function?.arguments) return null;
  try {
    return JSON.parse(tc.function.arguments) as T;
  } catch {
    return null;
  }
}
