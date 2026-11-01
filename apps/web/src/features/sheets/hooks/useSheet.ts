import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { SHEETS, type SheetDef, type SheetOption, type SheetRef } from "@wealthspan/constants/sheets";
import { monthRange, recordDate, type CellValue, type SheetRecord } from "@wealthspan/utils/sheet";
import { api } from "@/services/api";

/** The API paths that change a row's status (they are not plain edits). */
const STATUS_PATH: Record<string, (id: string, value: string) => string | null> = {
  events: (id, v) => `/events/${id}/${v === "concluded" ? "conclude" : "reopen"}`,
  loans: (id, v) => `/loans/${id}/${v === "closed" ? "close" : "reopen"}`,
};

export interface SheetQuery {
  def: SheetDef;
  /** "all" or "2026-10". */
  month: string;
  /** Limits the sheet to one project (null = everything). */
  projectId: string | null;
}

const PAGE = 200;
const MAX_PAGES = 5;

/** Rows of one sheet. Transactions come page by page (the API pages by 200); the other kinds come whole. */
export const useSheetRows = ({ def, month, projectId }: SheetQuery) =>
  useQuery({
    queryKey: ["sheet", def.key, month, projectId],
    queryFn: async (): Promise<{ rows: SheetRecord[]; truncated: boolean }> => {
      if (def.source === "transactions") {
        const { from, to } = monthRange(month);
        const qs = (offset: number) => {
          const p = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
          if (from) p.set("from", from);
          if (to) p.set("to", to);
          if (projectId) p.set("projectId", projectId);
          if (def.fixed?.type) p.set("type", def.fixed.type);
          return `/transactions?${p}`;
        };
        const rows: SheetRecord[] = [];
        let total = Infinity;
        for (let i = 0; i < MAX_PAGES && rows.length < total; i++) {
          const r = await api<{ total: number; items: SheetRecord[] }>("finance", qs(rows.length));
          total = r.total;
          rows.push(...r.items);
          if (!r.items.length) break;
        }
        return { rows, truncated: rows.length < total };
      }
      const { items } = await api<{ items: SheetRecord[] }>("finance", `/${def.source}`);
      const { from, to } = monthRange(month);
      const rows = items.filter(
        (r) =>
          (!projectId || def.source === "accounts" || r.projectId === projectId) &&
          (!from || (recordDate(r) >= from && recordDate(r) <= (to as string))),
      );
      return { rows, truncated: false };
    },
  });

interface RefRecord extends SheetRecord {
  name?: string;
  lender?: string;
  archivedAt?: string | null;
  status?: string;
}

export interface Refs {
  labels: Record<SheetRef, Record<string, string>>;
  options: Record<SheetRef, SheetOption[]>;
  ready: boolean;
}

/** The user's own projects / accounts / events / loans, for the dropdown cells and to show names instead of ids. */
export const useRefs = (def: SheetDef): Refs => {
  const needed = useMemo(() => {
    const set = new Set<SheetRef>();
    for (const c of def.columns) if (c.ref) set.add(c.ref);
    return [...set];
  }, [def]);
  const results = useQueries({
    queries: needed.map((ref) => ({
      queryKey: [ref],
      queryFn: () => api<{ items: RefRecord[] }>("finance", `/${ref}`).then((r) => r.items),
    })),
  });
  return useMemo(() => {
    const labels = {
      projects: {},
      accounts: {},
      events: {},
      loans: {},
      investments: {},
    } as Refs["labels"];
    const options = {
      projects: [],
      accounts: [],
      events: [],
      loans: [],
      investments: [],
    } as Refs["options"];
    needed.forEach((ref, i) => {
      for (const r of results[i]?.data ?? []) {
        const label = String(r.name ?? r.lender ?? r.id);
        labels[ref][r.id] = label;
        const usable =
          !r.archivedAt &&
          (ref !== "events" || r.status !== "concluded") &&
          (ref !== "loans" || r.status !== "closed");
        if (usable) options[ref].push({ value: r.id, label });
      }
    });
    return { labels, options, ready: results.every((r) => !r.isLoading) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needed, ...results.map((r) => r.data)]);
};

const useRefresh = () => {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["sheet"] }),
      qc.invalidateQueries({ queryKey: ["summary"] }),
    ]);
};

const clean = (v: CellValue) => (v === "" ? null : v);

export const useSheetMutations = (def: SheetDef) => {
  const refresh = useRefresh();
  const update = useMutation({
    mutationFn: async (v: { id: string; key: string; value: CellValue }) => {
      const special = v.key === "status" ? STATUS_PATH[def.source]?.(v.id, String(v.value)) : null;
      if (special) return api("finance", special, { method: "POST" });
      return api("finance", `/${def.source}/${v.id}`, {
        method: "PATCH",
        body: { [v.key]: clean(v.value) },
      });
    },
    onSuccess: refresh,
  });
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api("finance", `/${def.source}`, { method: "POST", body }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api("finance", `/${def.source}/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });
  return { update, create, remove };
};

export const sheetDef = (key: keyof typeof SHEETS) => SHEETS[key];
