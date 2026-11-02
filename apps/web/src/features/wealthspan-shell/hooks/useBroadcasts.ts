import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: "ALL" | "FREE" | "GO" | "PRO";
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
}

const SEEN_KEY = "wealthspan:lastSeenBroadcast";
const readSeen = () => {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
};

/** Announcements from the admin for this user's plan, plus whether the newest one is still unread. */
export function useBroadcasts() {
  const q = useQuery({
    queryKey: ["broadcasts"],
    retry: false,
    refetchInterval: 5 * 60_000,
    queryFn: () =>
      api<{ broadcasts: Broadcast[] }>("finance", "/broadcasts").then((r) => r.broadcasts),
  });
  const [seen, setSeen] = useState(readSeen);
  const list = q.data ?? [];
  const markSeen = useCallback(() => {
    const newest = list[0]?.id;
    if (!newest) return;
    setSeen(newest);
    try {
      window.localStorage.setItem(SEEN_KEY, newest);
    } catch {
      /* private window: the dot just reappears next visit */
    }
  }, [list]);
  return { broadcasts: list, hasUnread: list.length > 0 && list[0].id !== seen, markSeen };
}
