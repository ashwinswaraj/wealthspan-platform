import { useMemo, useState } from "react";
import { cn } from "@jobrio/utils/utils";
import { AuditListPage, type AuditListTab, type AuditSortOption } from "./AuditListPage";
import { ChatConversation, type ChatMessage } from "./ChatConversation";

/* ============================================================
 * MessagesInbox — shared messaging page (thread list + chat page)
 * Used by both the client dashboard and the professional (active)
 * dashboard. Purely prop-driven: no data fetching, no routing.
 * ============================================================ */

export type { ChatMessage, ChatAttachment, ChatMessageState } from "./ChatConversation";

export type MessageThread = {
  id: string;
  /** Counterparty name */
  name: string;
  /** Sub-label, e.g. role or company */
  meta?: string;
  orderTitle?: string;
  last: string;
  time: string;
  unread: number;
  status?: string;
  /** Order deadline shown in the chat context banner */
  deadline?: string;
  online?: boolean;
  /** Composer hidden until a professional is assigned */
  locked?: boolean;
  /** Order completed — conversation is read-only */
  readOnly?: boolean;
  messages: ChatMessage[];
};

const TABS: AuditListTab[] = [
  { key: "all", label: "All", icon: "forum" },
  { key: "unread", label: "Unread", icon: "mark_email_unread" },
  { key: "read", label: "Read", icon: "drafts" },
];

const SORT_OPTIONS: AuditSortOption[] = [
  { key: "recent", label: "Recent" },
  { key: "oldest", label: "Oldest" },
  { key: "unread", label: "Most unread" },
  { key: "name", label: "Name A–Z" },
];

const ThreadRow = ({
  t,
  active,
  onClick,
}: {
  t: MessageThread;
  active: boolean;
  onClick: () => void;
}) => (
  <li>
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 flex items-center gap-3 transition-colors",
        active ? "lg:bg-primary/5" : "hover:bg-surface-container-low",
      )}
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
        {t.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-background truncate">{t.name}</span>
          <span className="text-[10px] text-on-surface-variant shrink-0">{t.id}</span>
        </div>
        <div className="text-xs text-on-surface-variant truncate">{t.last}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-on-surface-variant">{t.time}</span>
        {t.unread > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
            {t.unread}
          </span>
        )}
      </div>
    </button>
  </li>
);

export interface MessagesInboxProps {
  title?: string;
  description?: string;
  threads: MessageThread[];
  /** Label used in the composer placeholder, e.g. "professional" / "client". */
  counterpartyLabel?: string;
}

export const MessagesInbox = ({
  title = "Messages",
  description = "One chat per order — stay in sync end to end.",
  threads,
  counterpartyLabel = "chat",
}: MessagesInboxProps) => {
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.id ?? null);
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const [mobileChat, setMobileChat] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = threads
      .filter((t) => (tab === "all" ? true : tab === "unread" ? t.unread > 0 : t.unread === 0))
      .filter((t) =>
        !q
          ? true
          : [t.id, t.name, t.meta, t.orderTitle, t.last]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q)),
      );
    if (sort === "oldest") rows = [...rows].reverse();
    if (sort === "name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "unread") rows = [...rows].sort((a, b) => b.unread - a.unread);
    return rows;
  }, [threads, tab, sort, query]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const messages = active ? [...active.messages, ...(sent[active.id] ?? [])] : [];

  const openThread = (id: string) => {
    setActiveId(id);
    setMobileChat(true);
  };

  const send = (text: string) => {
    if (!active) return;
    setSent((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] ?? []),
        {
          id: `${active.id}-${Date.now()}`,
          from: "me",
          text,
          state: "sent",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  return (
    <AuditListPage
      title={title}
      description={description}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      sortOptions={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={setSort}
      count={list.length}
      isEmpty={list.length === 0}
      emptyMessage="No chats found."
      search={{
        query,
        onSearch: setQuery,
        placeholder: "Search by Order ID · Name · Message…",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Thread list */}
        <div
          className={cn(
            "lg:col-span-5 xl:col-span-4 bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden",
            mobileChat && "hidden lg:block",
          )}
        >
          <ul className="divide-y divide-outline-variant/20 max-h-[70vh] overflow-y-auto">
            {list.map((t) => (
              <ThreadRow
                key={t.id}
                t={t}
                active={t.id === activeId}
                onClick={() => openThread(t.id)}
              />
            ))}
          </ul>
        </div>

        {/* Chat pane */}
        <div
          className={cn(
            "lg:col-span-7 xl:col-span-8 bg-surface-container-low flex flex-col overflow-hidden lg:rounded-3xl lg:border lg:border-outline-variant/30 lg:min-h-[70vh] lg:static lg:z-auto",
            mobileChat
              ? "fixed inset-0 z-50 bg-surface lg:bg-surface-container-low"
              : "hidden lg:flex rounded-3xl border border-outline-variant/30 min-h-[60vh]",
          )}
        >
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-10 text-center">
              <span className="material-symbols-outlined text-[32px] text-outline">forum</span>
              <p className="text-sm text-on-surface-variant">
                Select a conversation to start messaging.
              </p>
            </div>
          ) : (
            <ChatConversation
              key={active.id}
              name={active.name}
              role={active.meta}
              online={active.online}
              order={{
                id: active.id,
                service: active.orderTitle ?? "Order",
                status: active.status,
                deadline: active.deadline,
              }}
              messages={messages}
              counterpartyLabel={counterpartyLabel}
              locked={active.locked}
              readOnly={active.readOnly}
              onBack={() => setMobileChat(false)}
              onSend={send}
            />
          )}
        </div>
      </div>
    </AuditListPage>
  );
};

export default MessagesInbox;
