import { useEffect, useRef, useState } from "react";
import type { ChatMsg } from "../hooks/useChat";
import { boldParts, stamp, toBlocks } from "../lib/format";

const act =
  "hover:text-zinc-800 dark:hover:text-zinc-200 transition active:scale-95 cursor-pointer";
const ico = "w-[20px] h-[20px] stroke-[1.8]";

function Rich({ text }: { text: string }) {
  const p =
    "text-[15.5px] sm:text-[16px] leading-[1.68] my-2.5 text-neutral-900 dark:text-neutral-100 font-normal";
  const inline = (s: string) =>
    boldParts(s).map((x, i) =>
      x.bold ? <strong key={i}>{x.text}</strong> : <span key={i}>{x.text}</span>,
    );
  return (
    <>
      {toBlocks(text).map((b, i) =>
        b.kind === "p" ? (
          <p key={i} className={`${p} whitespace-pre-wrap`}>
            {inline(b.text)}
          </p>
        ) : b.kind === "ul" ? (
          <ul key={i} className={`${p} list-disc pl-6 space-y-1`}>
            {b.items.map((t, j) => (
              <li key={j}>{inline(t)}</li>
            ))}
          </ul>
        ) : (
          <ol key={i} className={`${p} list-decimal pl-6 space-y-1`}>
            {b.items.map((t, j) => (
              <li key={j}>{inline(t)}</li>
            ))}
          </ol>
        ),
      )}
    </>
  );
}

function AiMark() {
  return (
    <svg
      className="w-5 h-5 overflow-visible text-neutral-900 dark:text-neutral-100"
      fill="none"
      viewBox="0 0 48 48"
    >
      <path
        d="M 8.90808 34.18384 L 15.68384 19.92423 Q 17.18384 15.92423 18.68384 19.92423 L 22.68384 26.68384 Q 24.18384 29.68384 25.68384 26.68384 L 29.31616 19.92423 Q 30.81616 15.92423 32.31616 19.92423 L 39.18384 33.81616"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 13.72423 34.36769 Q 24.36769 21.63231 34.36769 33.63231"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10.8" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** The conversation, in the original look: time stamp, grey user bubbles, "Wealthspan AI" replies with copy / read aloud / share / more. */
export function ChatThread({
  messages,
  pending,
  onRetry,
  onNewChat,
  onUpgrade,
}: {
  messages: ChatMsg[];
  pending: boolean;
  onRetry: () => void;
  onNewChat: () => void;
  onUpgrade: () => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [speaking, setSpeaking] = useState<string | null>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, pending]);
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const flash = (t: string) => {
    setNote(t);
    window.setTimeout(() => setNote(""), 1600);
  };
  const copy = async (m: ChatMsg) => {
    try {
      await navigator.clipboard.writeText(m.content);
      flash("Copied");
    } catch {
      flash("Could not copy");
    }
  };
  const share = async (m: ChatMsg) => {
    try {
      if (navigator.share) await navigator.share({ text: m.content });
      else await copy(m);
    } catch {
      /* the person closed the share sheet */
    }
  };
  const speak = (m: ChatMsg) => {
    const s = window.speechSynthesis;
    if (!s) return flash("Read aloud isn't supported here");
    if (speaking === m.id) {
      s.cancel();
      return setSpeaking(null);
    }
    s.cancel();
    const u = new SpeechSynthesisUtterance(m.content.replace(/\*\*/g, ""));
    u.onend = u.onerror = () => setSpeaking(null);
    setSpeaking(m.id);
    s.speak(u);
  };

  return (
    <div
      id="chatConversationSection"
      className="w-full flex-1 flex flex-col justify-between overflow-hidden relative"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar w-full max-w-full space-y-4 pr-1 scroll-smooth pt-[58px] sm:pt-[64px] pb-[76px] sm:pb-[82px]">
        <div className="w-full flex justify-center py-2.5 my-1 select-none">
          <span className="text-[12.5px] text-neutral-400 dark:text-neutral-500 font-normal">
            {stamp(messages[0].at)}
          </span>
        </div>
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={m.id} className="w-full flex justify-end items-center">
              <div className="max-w-[88%] sm:max-w-[80%] bg-[#f0f0f0] dark:bg-[#262626] text-[#0d0d0d] dark:text-[#f3f4f6] rounded-[22px] px-5 py-3 text-[15.5px] sm:text-[16px] leading-[1.55] font-normal break-words select-text">
                <p className="whitespace-pre-wrap select-text">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={m.id} className="w-full flex flex-col items-start pl-0 text-left">
              <div className="flex items-center gap-2 mb-2 select-none">
                <div className="w-5 h-5 flex items-center justify-center">
                  <AiMark />
                </div>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Wealthspan AI
                </span>
              </div>
              <div className="markdown-body w-full overflow-x-auto select-text">
                <Rich text={m.content} />
              </div>
              {m.upgrade ? (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="mt-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold cursor-pointer active:scale-95 transition"
                >
                  Try Go Free
                </button>
              ) : null}
              <div className="mt-3 select-none">
                <div className="flex items-center gap-5 pt-3 text-[#6c6f78] dark:text-neutral-400">
                  <button
                    type="button"
                    className={act}
                    title="Copy message"
                    aria-label="Copy message"
                    onClick={() => copy(m)}
                  >
                    <svg
                      className={ico}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={act}
                    title="Read aloud"
                    aria-label="Read aloud"
                    onClick={() => speak(m)}
                  >
                    <svg
                      className={ico}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      {speaking === m.id ? null : (
                        <>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </>
                      )}
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={act}
                    title="Share"
                    aria-label="Share"
                    onClick={() => share(m)}
                  >
                    <svg
                      className={ico}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      className={act}
                      title="More options"
                      aria-label="More options"
                      onClick={() => setMenu(menu === m.id ? null : m.id)}
                    >
                      <svg className={ico} fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {menu === m.id ? (
                      <div className="absolute bottom-full left-0 mb-2 w-44 rounded-2xl bg-white dark:bg-[#1a1d24] border border-gray-100 dark:border-[#2b303c] shadow-[0_12px_32px_rgba(0,0,0,0.16)] p-1.5 z-40 text-sm text-gray-900 dark:text-white">
                        {i === messages.length - 1 ? (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252a35] cursor-pointer"
                            onClick={() => {
                              setMenu(null);
                              onRetry();
                            }}
                          >
                            Retry
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252a35] cursor-pointer"
                          onClick={() => {
                            setMenu(null);
                            onNewChat();
                          }}
                        >
                          New chat
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {note && i === messages.length - 1 ? (
                    <span className="text-xs">{note}</span>
                  ) : null}
                </div>
              </div>
            </div>
          ),
        )}
        {pending ? (
          <div className="w-full flex flex-col items-start" aria-live="polite">
            <div className="flex items-center gap-2 mb-2 select-none">
              <AiMark />
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Wealthspan AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 py-3" aria-label="Thinking">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
                  style={{ animationDelay: `${d * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div ref={end} />
      </div>
    </div>
  );
}
