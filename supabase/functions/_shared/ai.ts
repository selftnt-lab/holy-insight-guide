// Helper unificado para chamar a API do Google Gemini a partir de Edge Functions.
// - Tratamento padronizado de 429/5xx
// - Fallback automático para modelo alternativo em erros 5xx (sobrecarga)
// - Mensagens de erro em português, prontas para repassar ao cliente
// - Traduz para o formato OpenAI-compatible (choices[0].message) que os callers já esperam,
//   assim extractJsonContent/extractToolCallArgs continuam funcionando sem mudança
//
// Não expor GOOGLE_AI_API_KEY ao cliente. Use sempre via Deno.env.

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

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_TOKENS = 4096;

function toGeminiContents(messages: CallAIOptions["messages"]) {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  return { system: system || undefined, contents };
}

// O schema de parâmetros do Gemini é um subconjunto do OpenAPI 3.0 e rejeita
// campos JSON Schema que ele não reconhece (ex: additionalProperties, $schema).
function sanitizeSchemaForGemini(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(sanitizeSchemaForGemini);
  if (schema && typeof schema === "object") {
    const { additionalProperties, $schema, ...rest } = schema as Record<string, unknown>;
    for (const key of Object.keys(rest)) {
      rest[key] = sanitizeSchemaForGemini(rest[key]);
    }
    return rest;
  }
  return schema;
}

function toGeminiTools(tools: CallAIOptions["tools"]) {
  if (!tools?.length) return undefined;
  return [
    {
      functionDeclarations: tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: sanitizeSchemaForGemini(t.function.parameters ?? { type: "object", properties: {} }),
      })),
    },
  ];
}

function toGeminiToolConfig(toolChoice: CallAIOptions["tool_choice"]) {
  if (!toolChoice) return undefined;
  return {
    functionCallingConfig: {
      mode: "ANY" as const,
      allowedFunctionNames: [toolChoice.function.name],
    },
  };
}

// Traduz o corpo JSON do Gemini para o formato
// { choices: [{ message: { content, tool_calls } }] } que os callers esperam.
function toOpenAIShapedResponse(geminiBody: {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; functionCall?: { name: string; args?: unknown } }> };
  }>;
}): Response {
  const parts = geminiBody?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p) => typeof p.text === "string")
    .map((p) => p.text ?? "")
    .join("");
  const functionCall = parts.find((p) => p.functionCall)?.functionCall;

  const message: Record<string, unknown> = { role: "assistant", content: text || null };
  if (functionCall) {
    message.tool_calls = [
      {
        id: `call_${crypto.randomUUID()}`,
        type: "function",
        function: { name: functionCall.name, arguments: JSON.stringify(functionCall.args ?? {}) },
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
    const { system, contents } = toGeminiContents(opts.messages);
    const body: Record<string, unknown> = {
      contents,
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const tools = toGeminiTools(opts.tools);
    if (tools) body.tools = tools;
    const toolConfig = toGeminiToolConfig(opts.tool_choice);
    if (toolConfig) body.toolConfig = toolConfig;

    return await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(t);
  }
}

export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
  if (!apiKey) {
    return { ok: false, status: 500, error: "GOOGLE_AI_API_KEY não configurada." };
  }

  const { model, fallbackModel, timeoutMs = 60_000 } = opts;

  let res: Response;
  try {
    res = await postOnce(apiKey, model, opts, timeoutMs);
  } catch (e) {
    console.error("Gemini network error:", e);
    return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
  }

  // Retry em 5xx (sobrecarga/indisponibilidade) com fallback
  if (!res.ok && [500, 502, 503, 504].includes(res.status) && fallbackModel) {
    console.warn(`AI primary failed (${res.status}); tentando fallback ${fallbackModel}`);
    try {
      res = await postOnce(apiKey, fallbackModel, opts, timeoutMs);
    } catch (e) {
      console.error("AI fallback network error:", e);
      return { ok: false, status: 503, error: "Falha de rede ao contatar a IA." };
    }
  }

  if (res.ok) {
    const geminiBody = await res.json().catch(() => null);
    if (!geminiBody) return { ok: false, status: 500, error: "Resposta inválida da IA." };
    return { ok: true, response: toOpenAIShapedResponse(geminiBody) };
  }

  if (res.status === 429) {
    return {
      ok: false,
      status: 429,
      error: "Muitas requisições. Tente novamente em alguns segundos.",
    };
  }

  const errBody = await res.text().catch(() => "");
  console.error("Gemini API error:", res.status, errBody);
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
