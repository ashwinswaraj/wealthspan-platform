/**
 * Sarvam adapter — the ONLY place that knows Sarvam's HTTP shape.
 * Swapping the AI provider later means changing just this file.
 * The key comes from the function's env var SARVAM_API_KEY; never log it.
 */
export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ToolDef {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export interface ChatResult {
  content: string | null;
  toolCalls: ToolCall[];
  finishReason: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export class AiError extends Error {
  constructor(
    public code: "no_key" | "timeout" | "provider" | "bad_response",
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

export interface SarvamOptions {
  apiKey: string | undefined;
  model?: string;
  /** Catalyst functions die at 30 s, so stay below it. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

export function createSarvamClient(opts: SarvamOptions) {
  const doFetch = opts.fetchImpl ?? fetch;
  const url = (opts.baseUrl ?? "https://api.sarvam.ai") + "/v1/chat/completions";

  return {
    async chat(input: {
      messages: ChatMessage[];
      tools?: ToolDef[];
      maxTokens?: number;
      reasoning?: "low" | "high" | "max";
    }): Promise<ChatResult> {
      if (!opts.apiKey) throw new AiError("no_key", "AI key is not configured.", 500);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 24000);
      try {
        const res = await doFetch(url, {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "content-type": "application/json",
            "api-subscription-key": opts.apiKey,
            authorization: `Bearer ${opts.apiKey}`,
          },
          body: JSON.stringify({
            model: opts.model ?? "sarvam-105b",
            messages: input.messages,
            max_tokens: input.maxTokens ?? 1024,
            ...(input.reasoning ? { reasoning_effort: input.reasoning } : {}),
            ...(input.tools?.length ? { tools: input.tools, tool_choice: "auto" } : {}),
          }),
        });
        if (!res.ok) {
          const detail = (await res.text().catch(() => ""))
            .replace(/sk_[A-Za-z0-9_]+/g, "[key]")
            .slice(0, 200);
          throw new AiError(
            "provider",
            `AI provider returned ${res.status}. ${detail}`.trim(),
            res.status === 429 ? 429 : 502,
          );
        }
        const data = (await res.json()) as {
          choices?: {
            finish_reason?: string;
            message?: { content?: string | null; tool_calls?: ToolCall[] };
          }[];
          usage?: ChatResult["usage"];
        };
        const choice = data.choices?.[0];
        if (!choice?.message)
          throw new AiError("bad_response", "AI provider sent an unexpected reply.");
        return {
          content: choice.message.content ?? null,
          toolCalls: choice.message.tool_calls ?? [],
          finishReason: choice.finish_reason ?? "stop",
          usage: data.usage,
        };
      } catch (e) {
        if (e instanceof AiError) throw e;
        if ((e as { name?: string })?.name === "AbortError")
          throw new AiError("timeout", "AI took too long. Try again.", 504);
        throw new AiError("provider", "Could not reach the AI provider.");
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
