import { useEffect, useRef, useState } from "react";
import { cn } from "@jobrio/utils/utils";

/* ============================================================
 * ChatConversation — the focused Jobrio chatting page
 * Header (participant + order context) → message timeline → composer.
 * Purely prop-driven: no fetching, no routing, no business actions.
 * Chat is communication only — operational commands are never executed here.
 * ============================================================ */

export type ChatMessageState = "sending" | "sent" | "delivered" | "read" | "failed";

export type ChatAttachment = {
  name: string;
  /** Human readable size, e.g. "2.4 MB" */
  size?: string;
  kind?: "image" | "document";
  downloadable?: boolean;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them" | "system";
  text: string;
  time: string;
  state?: ChatMessageState;
  attachment?: string | ChatAttachment;
  /** Day divider label rendered above this message, e.g. "TODAY" */
  daySeparator?: string;
};

export type ChatOrderContext = {
  id: string;
  service: string;
  status?: string;
  deadline?: string;
};

export interface ChatConversationProps {
  name: string;
  role?: string;
  online?: boolean;
  avatarSrc?: string;
  order?: ChatOrderContext;
  messages: ChatMessage[];
  /** "professional" / "client" — used in the composer placeholder + copy. */
  counterpartyLabel?: string;
  /** Composer disabled before assignment. */
  locked?: boolean;
  /** Composer disabled after completion. */
  readOnly?: boolean;
  onBack?: () => void;
  onSend?: (text: string) => void;
  onViewOrder?: () => void;
  onRetry?: (messageId: string) => void;
  className?: string;
}

const MORE_ITEMS = [
  "View Order",
  "View Professional",
  "Search Messages",
  "View Files",
  "Mute Notifications",
  "Report Conversation",
];

const EMOJIS = ["🙂", "👍", "🙏", "✅", "🎉", "📎", "🔥", "❤️", "😀", "😅", "🤝", "⏰"];

const normalizeAttachment = (a: ChatMessage["attachment"]): ChatAttachment | null => {
  if (!a) return null;
  if (typeof a === "string") return { name: a };
  return a;
};

const isImage = (a: ChatAttachment) =>
  a.kind === "image" || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(a.name);

const Receipt = ({ state }: { state?: ChatMessageState }) => {
  if (!state) return null;
  if (state === "sending")
    return <span className="material-symbols-outlined text-[13px]">schedule</span>;
  if (state === "failed")
    return <span className="material-symbols-outlined text-[13px] text-error">error</span>;
  if (state === "sent") return <span className="material-symbols-outlined text-[13px]">check</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="material-symbols-outlined text-[13px]">done_all</span>
      {state === "read" && <span className="text-[10px] font-semibold">Read</span>}
    </span>
  );
};

const AttachmentCard = ({ a, mine }: { a: ChatAttachment; mine: boolean }) => (
  <div
    className={cn(
      "mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5",
      mine ? "bg-on-primary/15" : "bg-surface-container-low",
    )}
  >
    <span className="material-symbols-outlined text-[20px] shrink-0">
      {isImage(a) ? "image" : "description"}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-bold">{a.name}</p>
      {a.size && <p className="text-[10px] opacity-70">{a.size}</p>}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        className={cn(
          "rounded-full px-2.5 py-1 text-[11px] font-bold",
          mine ? "bg-on-primary/20" : "bg-surface-container",
        )}
      >
        View
      </button>
      {(a.downloadable ?? !isImage(a)) && (
        <button
          type="button"
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            mine ? "bg-on-primary/20" : "bg-surface-container",
          )}
        >
          Download
        </button>
      )}
    </div>
  </div>
);

const SystemMessage = ({ m }: { m: ChatMessage }) => (
  <div className="flex items-center gap-3 py-1">
    <span className="h-px flex-1 bg-outline-variant/40" />
    <span className="text-[11px] font-semibold text-on-surface-variant text-center max-w-[70%]">
      {m.text}
    </span>
    <span className="h-px flex-1 bg-outline-variant/40" />
  </div>
);

const Bubble = ({
  m,
  name,
  onRetry,
}: {
  m: ChatMessage;
  name: string;
  onRetry?: (id: string) => void;
}) => {
  const mine = m.from === "me";
  const a = normalizeAttachment(m.attachment);
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%] flex flex-col gap-1", mine && "items-end")}>
        <span className="px-1 text-[10px] font-bold text-on-surface-variant">
          {mine ? "You" : name}
        </span>
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed rounded-2xl break-words min-w-0",
            mine
              ? "bg-primary text-on-primary rounded-br-md"
              : "bg-surface-container text-on-surface rounded-bl-md",
          )}
        >
          {m.text}
          {a && <AttachmentCard a={a} mine={mine} />}
        </div>
        <span className="flex items-center gap-1 px-1 text-[10px] text-outline">
          {m.time}
          {mine && <Receipt state={m.state} />}
          {mine && m.state === "failed" && (
            <button
              type="button"
              onClick={() => onRetry?.(m.id)}
              className="ml-1 font-bold text-error underline"
            >
              Retry
            </button>
          )}
        </span>
      </div>
    </div>
  );
};

export const ChatConversation = ({
  name,
  role,
  online,
  avatarSrc,
  order,
  messages,
  counterpartyLabel = "chat",
  locked = false,
  readOnly = false,
  onBack,
  onSend,
  onViewOrder,
  onRetry,
  className,
}: ChatConversationProps) => {
  const [draft, setDraft] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    // +2px for the top/bottom border so an empty textarea matches the
    // height it settles at once a single line of text is typed.
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [draft, locked, readOnly]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend?.(text);
    setDraft("");
  };

  return (
    <div className={cn("flex flex-col min-h-0 flex-1", className)}>
      {/* Participant header */}
      <div className="px-4 sm:px-6 py-3 border-b border-outline-variant/20 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden h-9 w-9 rounded-full hover:bg-surface-container flex items-center justify-center shrink-0"
            aria-label="Back to conversations"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.slice(0, 1)
            )}
          </div>
          {online && (
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-success border-2 border-surface-container-low" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-on-background truncate">{name}</p>
          <p className="text-[11px] text-on-surface-variant truncate">
            {[role, order && `${order.id} • ${order.service}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        {online && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-success shrink-0">
            <span className="h-2 w-2 rounded-full bg-success" /> Online
          </span>
        )}
        <div className="relative shrink-0">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="h-9 w-9 rounded-full hover:bg-surface-container flex items-center justify-center"
            aria-label="More options"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          {moreOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 top-11 z-20 w-52 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-1.5 shadow-lg">
                {MORE_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMoreOpen(false);
                      if (item === "View Order") onViewOrder?.();
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order context banner */}
      {order && (
        <div className="px-4 sm:px-6 py-2.5 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-x-3 min-w-0">
          <span className="text-xs font-bold text-on-background shrink-0">{order.id}</span>
          <span className="text-xs text-on-surface-variant truncate min-w-0">{order.service}</span>
          {order.deadline && (
            <span className="text-[11px] text-on-surface-variant shrink-0">
              Deadline: {order.deadline}
            </span>
          )}
          {order.status && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {order.status}
            </span>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="space-y-4">
            {m.daySeparator && (
              <div className="flex justify-center">
                <span className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-bold tracking-wide text-on-surface-variant">
                  {m.daySeparator}
                </span>
              </div>
            )}
            {m.from === "system" ? (
              <SystemMessage m={m} />
            ) : (
              <Bubble m={m} name={name} onRetry={onRetry} />
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer / locked states */}
      {locked ? (
        <div className="border-t border-outline-variant/20 p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-[28px] text-outline">chat_bubble</span>
          <p className="text-sm font-bold text-on-background">Messaging Unavailable</p>
          <p className="text-xs text-on-surface-variant">
            A professional will be assigned to your order before messaging becomes available.
          </p>
          <button
            onClick={onViewOrder}
            className="mt-1 rounded-full bg-surface-container px-4 py-2 text-xs font-bold text-on-surface"
          >
            View Order
          </button>
        </div>
      ) : readOnly ? (
        <div className="border-t border-outline-variant/20 p-5 space-y-1">
          <p className="flex items-center gap-2 text-sm font-bold text-on-background">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            This conversation is read-only
          </p>
          <p className="text-xs text-on-surface-variant">
            This order has been completed. New messages are no longer available. Your conversation
            remains available according to Jobrio&apos;s retention policy.
          </p>
        </div>
      ) : (
        <div className="border-t border-outline-variant/20 p-3 sm:p-4">
          <div className="relative flex items-center gap-2">
            <input ref={fileRef} type="file" className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="h-10 w-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 self-center"
              aria-label="Attach a file"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={`Message your ${counterpartyLabel}…`}
              className="w-full resize-none overflow-y-auto max-h-32 min-h-11 rounded-2xl bg-transparent border border-outline-variant px-4 py-2.5 text-sm leading-5 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30"
            />
            <button
              onClick={submit}
              className="h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 self-center transition-opacity hover:opacity-90"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
            {emojiOpen && (
              <div className="absolute bottom-14 left-12 z-20 grid grid-cols-6 gap-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-2 shadow-lg">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setDraft((d) => d + e);
                      setEmojiOpen(false);
                    }}
                    className="h-8 w-8 rounded-lg text-base hover:bg-surface-container"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatConversation;
