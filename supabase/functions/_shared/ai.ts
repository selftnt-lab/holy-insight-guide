// Helper unificado para chamar a API da Anthropic (Claude) a partir de Edge Functions.
// - Tratamento padronizado de 429/5xx
// - Fallback automático para modelo alternativo em erros 5xx/529 (sobrecarga)
// - Mensagens de erro em português, prontas para repassar ao cliente
// - Traduz para o formato OpenAI-compatible (choices[0].message) que os callers já esperam,
//   assim extractJsonContent/extractToolCallArgs continuam funcionando sem mudança
//
// Não expor ANTHROPIC_API_KEY ao cliente. Use sempre via Deno.env.

export interface CallAIOptions {
  model: string;
  fallbackModel?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  // Definições de tool no formato OpenAI (type: "function", function: {name, description, parameters})
  tools?: Array<{ type: "function"; function: { name: string; description?: string; parameters?: unknown } }>;
  tool_choice?: { type: "function"; function: { name: string } };
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

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 4096;

function toAnthropicMessages(messages: CallAIOptions["messages"]) {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const rest = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));
  return { system: system || undefined, messages: rest };
}

function toAnthropicTools(tools: CallAIOptions["tools"]) {
  if (!tools?.length) return undefined;
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters ?? { type: "object", properties: {} },
  }));
}

function toAnthropicToolChoice(toolChoice: CallAIOptions["tool_choice"]) {
  if (!toolChoice) return undefined;
  return { type: "tool" as const, name: toolChoice.function.name };
}

// Traduz o corpo JSON da Anthropic Messages API para o formato
// { choices: [{ message: { content, tool_calls } }] } que os callers esperam.
function toOpenAIShapedResponse(anthropicBody: {
  content?: Array<{ type: string; text?: string; id?: string; name?: string; input?: unknown }>;
}): Response {
  const blocks = anthropicBody?.content ?? [];
  const text = blocks
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  const toolUse = blocks.find((b) => b.type === "tool_use");

  const message: Record<string, unknown> = { role: "assistant", content: text || null };
  if (toolUse) {
    message.tool_calls = [
      {
        id: toolUse.id,
        type: "function",
        function: { name: toolUse.name, arguments: JSON.stringify(toolUse.input ?? {}) },
      },
    ];
  }

  return new Response(JSON.stringify({ choices: [{ message }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function postOnce(apiKey: string, model: string, opts: CallAIOptions, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { system, messages } = toAnthropicMessages(opts.messages);
    const body: Record<string, unknown> = { model, max_tokens: MAX_TOKENS, messages };
    if (system) body.system = system;
    const tools = toAnthropicTools(opts.tools);
    if (tools) body.tools = tools;
    const toolChoice = toAnthropicToolChoice(opts.tool_choice);
    if (toolChoice) body.tool_choice = toolChoice;

    return await fetch(ANTHROPIC_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(t);
  }
}

export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return { ok: false, status: 500, error: "ANTHROPIC_API_KEY não configurada." };
  }

  const { model, fallbackModel, timeoutMs = 60_000 } = opts;

  let res: Response;
  try {
    res = await postOnce(apiKey, model, opts, timeoutMs);
  } catch (e) {
    console.error("Anthropic network error:", e);
    return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
  }

  // Retry em 5xx/529 (sobrecarga) com fallback
  if (!res.ok && [500, 502, 503, 504, 529].includes(res.status) && fallbackModel) {
    console.warn(`AI primary failed (${res.status}); tentando fallback ${fallbackModel}`);
    try {
      res = await postOnce(apiKey, fallbackModel, opts, timeoutMs);
    } catch (e) {
      console.error("AI fallback network error:", e);
      return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
    }
  }

  if (res.ok) {
    const anthropicBody = await res.json().catch(() => null);
    if (!anthropicBody) return { ok: false, status: 500, error: "Resposta inválida da IA." };
    return { ok: true, response: toOpenAIShapedResponse(anthropicBody) };
  }

  if (res.status === 429) {
    return {
      ok: false,
      status: 429,
      error: "Muitas requisições. Tente novamente em alguns segundos.",
    };
  }

  const errBody = await res.text().catch(() => "");
  console.error("Anthropic API error:", res.status, errBody);
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
