import { useCallback, useRef, useState } from "react";
import { api, ApiError } from "@/services/api";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  /** An error shown in place of a reply: it is never sent back to the model. */
  failed?: boolean;
  /** The reply says a plan is needed: show the "Try Go Free" button. */
  upgrade?: boolean;
}

export const SORRY =
  "Sorry, I couldn't reach the Wealthspan assistant right now. Please check your connection and try again in a moment.";

let seq = 0;
const mk = (role: ChatMsg["role"], content: string, extra: Partial<ChatMsg> = {}): ChatMsg => ({
  id: `m${Date.now()}-${seq++}`,
  role,
  content,
  at: Date.now(),
  ...extra,
});

/** The conversation with the accountant: `POST /chat` on the chat function, which checks login, plan and daily limit. */
export function useChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);

  const run = useCallback(async (history: ChatMsg[]) => {
    busy.current = true;
    setPending(true);
    try {
      const r = await api<{ reply: string }>("chat", "/chat", {
        method: "POST",
        body: {
          messages: history
            .filter((m) => !m.failed)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages([
        ...history,
        mk("assistant", r.reply.trim() || "I have nothing to add to that. Could you rephrase?"),
      ]);
    } catch (e) {
      const err = e instanceof ApiError ? e : null;
      const text =
        err?.status === 401
          ? "Your session has ended. Please log in again."
          : err && [402, 429, 400].includes(err.status)
            ? err.message
            : SORRY;
      setMessages([
        ...history,
        mk("assistant", text, { failed: true, upgrade: err?.status === 402 }),
      ]);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || busy.current) return;
      void run([...messages, mk("user", t)]);
    },
    [messages, run],
  );

  /** Ask again after an error or for a new answer: drops the last reply. */
  const retry = useCallback(() => {
    if (busy.current) return;
    const last = messages[messages.length - 1];
    const history = last?.role === "assistant" ? messages.slice(0, -1) : messages;
    if (history.length) void run(history);
  }, [messages, run]);

  const reset = useCallback(() => setMessages([]), []);
  return { messages, pending, send, retry, reset };
}
