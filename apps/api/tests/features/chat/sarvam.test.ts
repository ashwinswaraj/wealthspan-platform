import { describe, expect, it } from "vitest";
import { AiError, createSarvamClient } from "../../../src/features/chat";

const ok = (body: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("sarvam adapter", () => {
  it("refuses without a key", async () => {
    await expect(
      createSarvamClient({ apiKey: undefined }).chat({ messages: [] }),
    ).rejects.toMatchObject({ code: "no_key" });
  });
  it("parses text and tool calls, sends key in header", async () => {
    let seen: RequestInit | undefined;
    const f = (async (_u: string, init: RequestInit) => {
      seen = init;
      return new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: "tool_calls",
              message: {
                content: null,
                tool_calls: [
                  { id: "1", type: "function", function: { name: "get_summary", arguments: "{}" } },
                ],
              },
            },
          ],
        }),
      );
    }) as unknown as typeof fetch;
    const r = await createSarvamClient({ apiKey: "k", fetchImpl: f }).chat({
      messages: [{ role: "user", content: "hi" }],
    });
    expect(r.toolCalls[0].function.name).toBe("get_summary");
    expect((seen!.headers as Record<string, string>)["api-subscription-key"]).toBe("k");
  });
  it("maps 429 and bad shapes", async () => {
    await expect(
      createSarvamClient({ apiKey: "k", fetchImpl: ok({}, 429) }).chat({ messages: [] }),
    ).rejects.toMatchObject({ status: 429 });
    await expect(
      createSarvamClient({ apiKey: "k", fetchImpl: ok({}) }).chat({ messages: [] }),
    ).rejects.toBeInstanceOf(AiError);
  });
  it("times out", async () => {
    const slow = ((_u: string, init: RequestInit) =>
      new Promise((_r, rej) =>
        init.signal!.addEventListener("abort", () =>
          rej(Object.assign(new Error("a"), { name: "AbortError" })),
        ),
      )) as unknown as typeof fetch;
    await expect(
      createSarvamClient({ apiKey: "k", fetchImpl: slow, timeoutMs: 10 }).chat({ messages: [] }),
    ).rejects.toMatchObject({ code: "timeout" });
  });
});
