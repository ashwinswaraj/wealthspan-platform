import { useEffect, useMemo, useRef, useState } from "react";
import type { SheetColumn, SheetDef, SheetOption } from "@wealthspan/constants/sheets";
import {
  buildInput,
  cellValue,
  columnTotals,
  filterRecords,
  missingRequired,
  parseCell,
  sortRecords,
  type CellValue,
  type SheetRecord,
} from "@wealthspan/utils/sheet";
import type { Refs } from "../hooks/useSheet";

const letter = (i: number) => String.fromCharCode(65 + (i % 26));
const NEW = "__new__";

const rupees = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export interface SheetGridProps {
  def: SheetDef;
  rows: SheetRecord[];
  refs: Refs;
  search: string;
  /** Values a new row starts with (today's date, the active project, …). */
  defaults: Record<string, CellValue>;
  /** Extra values sent with a new row (e.g. the project of a project sheet). */
  extra?: Record<string, string>;
  /** Columns hidden because the whole sheet is already scoped (e.g. Project). */
  hidden?: readonly string[];
  onUpdate: (id: string, key: string, value: CellValue) => Promise<void>;
  onCreate: (body: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (message: string | null) => void;
  truncated?: boolean;
}

/** An Excel-style grid: tap a cell to edit it, Enter/Tab to move, the last line is a new row. */
export function SheetGrid({
  def,
  rows,
  refs,
  search,
  defaults,
  extra,
  hidden = [],
  onUpdate,
  onCreate,
  onDelete,
  onError,
  truncated,
}: SheetGridProps) {
  const cols = useMemo(() => def.columns.filter((c) => !hidden.includes(c.key)), [def, hidden]);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: def.sortKey,
    dir: "desc",
  });
  const [editing, setEditing] = useState<{ row: string; key: string } | null>(null);
  const [draft, setDraft] = useState<Record<string, CellValue>>(defaults);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Defaults arrive after the lists load (first project / account): fill empty draft cells, never overwrite typing.
  const defaultsKey = JSON.stringify(defaults);
  useEffect(() => {
    setDraft((d) => {
      const next = { ...d };
      for (const [k, v] of Object.entries(defaults))
        if (next[k] === undefined || next[k] === null) next[k] = v;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsKey]);

  const label = (c: SheetColumn, r: SheetRecord): string => display(c, cellValue(c, r), refs);

  const visible = useMemo(() => {
    const col = cols.find((c) => c.key === sort.key);
    return sortRecords(filterRecords(rows, cols, search, label), col, sort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, search, sort, refs]);
  const totals = useMemo(() => columnTotals(cols, visible), [cols, visible]);
  const hasTotals = Object.keys(totals).length > 0 && visible.length > 0;

  const commitExisting = async (r: SheetRecord, c: SheetColumn, raw: string) => {
    setEditing(null);
    const parsed = parseCell(c, raw);
    if (!parsed.ok) return onError(parsed.error);
    if (parsed.value === cellValue(c, r)) return;
    onError(null);
    try {
      await onUpdate(r.id, c.key, parsed.value);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not save that change.");
    }
  };

  const commitDraft = (c: SheetColumn, raw: string) => {
    setEditing(null);
    const parsed = parseCell({ ...c, required: false }, raw);
    if (!parsed.ok) return onError(parsed.error);
    onError(null);
    setDraft((d) => ({ ...d, [c.key]: parsed.value }));
  };

  const draftCols = cols.filter((c) => c.key !== "status");
  const missing = missingRequired(def, draft, [...hidden, "status"]);
  const save = async () => {
    if (missing.length || saving) return;
    setSaving(true);
    onError(null);
    try {
      const values = { ...draft };
      delete values.status;
      await onCreate(buildInput(def, values, extra));
      setDraft({ ...defaults });
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not save this row.");
    } finally {
      setSaving(false);
    }
  };

  const move = (row: string, key: string, dir: 1 | -1) => {
    const list = row === NEW ? draftCols : cols;
    const i = list.findIndex((c) => c.key === key) + dir;
    if (i >= 0 && i < list.length) setEditing({ row, key: list[i].key });
  };

  const head = "bg-[#f1f3f4] border border-[#dadce0] text-[#5f6368]";
  return (
    <div className="w-full">
      <div
        role="grid"
        aria-label={`${def.title} sheet`}
        className="overflow-auto no-scrollbar border-y border-[#dadce0] bg-white"
        style={{ maxHeight: "calc(100dvh - 250px)" }}
      >
        <table className="border-collapse text-[13px] text-gray-900" style={{ minWidth: "100%" }}>
          <thead className="sticky top-0 z-20">
            <tr>
              <th className={`${head} sticky left-0 z-30 w-10 min-w-10 h-6`} />
              {cols.map((c, i) => (
                <th
                  key={c.key}
                  className={`${head} h-6 text-[10px] font-medium`}
                  style={{ minWidth: c.width }}
                >
                  {letter(i)}
                </th>
              ))}
            </tr>
            <tr>
              <th className={`${head} sticky left-0 z-30 w-10 min-w-10 h-9`} />
              {cols.map((c) => {
                const on = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className="bg-[#f8f9fa] border border-[#dadce0] p-0 text-left"
                    aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSort({ key: c.key, dir: on && sort.dir === "desc" ? "asc" : "desc" })
                      }
                      className={`w-full h-9 px-2 flex items-center gap-1 font-semibold text-[12px] cursor-pointer hover:bg-[#eef1f3] ${c.type === "money" ? "justify-end" : ""}`}
                    >
                      <span className="truncate">{c.label}</span>
                      {c.required ? <span className="text-red-500">*</span> : null}
                      <span className="text-[9px] text-[#5f6368]">
                        {on ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, n) => (
              <tr key={r.id} role="row">
                <th
                  scope="row"
                  className={`${head} sticky left-0 z-10 w-10 min-w-10 h-9 p-0 font-normal text-[11px]`}
                >
                  <button
                    type="button"
                    aria-label={`Delete row ${n + 1}`}
                    title="Delete row"
                    onClick={() => setConfirmId(r.id)}
                    className="w-full h-9 cursor-pointer hover:bg-red-50 hover:text-red-600"
                  >
                    {n + 1}
                  </button>
                </th>
                {cols.map((c) => (
                  <Cell
                    key={c.key}
                    col={c}
                    refs={refs}
                    value={cellValue(c, r)}
                    editing={editing?.row === r.id && editing.key === c.key}
                    onEdit={() => setEditing({ row: r.id, key: c.key })}
                    onCommit={(raw, step) => {
                      void commitExisting(r, c, raw);
                      if (step) move(r.id, c.key, step);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                ))}
              </tr>
            ))}
            <tr className="bg-[#f6fbff]">
              <th
                scope="row"
                className={`${head} sticky left-0 z-10 w-10 min-w-10 h-9 font-normal text-[15px] text-[#1a73e8]`}
                title="New row"
              >
                +
              </th>
              {cols.map((c) =>
                c.key === "status" ? (
                  <td key={c.key} className="border border-[#dadce0] px-2 text-gray-400">
                    {def.source === "loans" ? "Active" : "Open"}
                  </td>
                ) : (
                  <Cell
                    key={c.key}
                    col={c}
                    refs={refs}
                    value={draft[c.key] ?? null}
                    editing={editing?.row === NEW && editing.key === c.key}
                    placeholder={c.required ? "Required" : ""}
                    onEdit={() => setEditing({ row: NEW, key: c.key })}
                    onCommit={(raw, step) => {
                      commitDraft(c, raw);
                      if (step) move(NEW, c.key, step);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                ),
              )}
            </tr>
          </tbody>
          {hasTotals ? (
            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-[#f8f9fa] font-semibold">
                <th className={`${head} sticky left-0 z-30 w-10 min-w-10 h-9 text-[11px]`}>Σ</th>
                {cols.map((c, i) => (
                  <td
                    key={c.key}
                    className={`border border-[#dadce0] px-2 h-9 ${c.type === "money" ? "text-right" : ""}`}
                  >
                    {totals[c.key] !== undefined ? rupees(totals[c.key]) : i === 0 ? "Total" : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <div className="px-5 sm:px-6 pt-3 flex flex-col gap-2">
        {truncated ? (
          <p className="text-[11px] text-amber-700">
            Showing the latest {rows.length} rows. Pick a month to see older ones.
          </p>
        ) : null}
        {confirmId ? (
          <div
            role="alertdialog"
            className="flex items-center justify-between gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-xs text-red-800"
          >
            <span className="font-semibold">Delete this row?</span>
            <span className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-white border border-red-200 font-semibold cursor-pointer"
                onClick={() => setConfirmId(null)}
              >
                Keep
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-red-600 text-white font-semibold cursor-pointer"
                onClick={async () => {
                  const id = confirmId;
                  setConfirmId(null);
                  try {
                    await onDelete(id);
                  } catch (e) {
                    onError(e instanceof Error ? e.message : "Could not delete.");
                  }
                }}
              >
                Delete
              </button>
            </span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={save}
          disabled={missing.length > 0 || saving}
          className="w-full inline-flex items-center justify-center gap-2 bg-black enabled:hover:bg-neutral-900 enabled:active:scale-[0.98] disabled:opacity-40 transition-all text-white font-semibold text-xs py-3.5 px-6 rounded-full shadow-sm focus:outline-none cursor-pointer disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>{saving ? "Saving…" : def.addLabel}</span>
        </button>
        {missing.length > 0 ? (
          <p className="text-[11px] text-gray-500 text-center">
            Fill in the blue row: {missing.join(", ")}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function display(c: SheetColumn, v: CellValue, refs: Refs): string {
  if (v === null) return "";
  if (c.type === "money") return rupees(Number(v));
  if (c.type === "ref") return refs.labels[c.ref!][String(v)] ?? "—";
  if (c.type === "select") return c.options?.find((o) => o.value === v)?.label ?? String(v);
  return String(v);
}

function Cell({
  col,
  value,
  refs,
  editing,
  placeholder,
  onEdit,
  onCommit,
  onCancel,
}: {
  col: SheetColumn;
  value: CellValue;
  refs: Refs;
  editing: boolean;
  placeholder?: string;
  onEdit: () => void;
  onCommit: (raw: string, step?: 1 | -1) => void;
  onCancel: () => void;
}) {
  const align = col.type === "money" || col.type === "number" ? "text-right" : "text-left";
  if (!editing) {
    const text = display(col, value, refs);
    return (
      <td role="gridcell" className="border border-[#dadce0] p-0" style={{ minWidth: col.width }}>
        <button
          type="button"
          onClick={onEdit}
          className={`w-full h-9 px-2 ${align} truncate cursor-cell hover:bg-[#f1f7fe] focus:outline-2 focus:outline-[#1a73e8]`}
          title={text}
        >
          {text || <span className="text-gray-300">{placeholder ?? ""}</span>}
        </button>
      </td>
    );
  }
  const options: SheetOption[] =
    col.type === "ref" ? refs.options[col.ref!] : col.options ? [...col.options] : [];
  return (
    <td
      role="gridcell"
      className="border-2 border-[#1a73e8] p-0 bg-white"
      style={{ minWidth: col.width }}
    >
      <Editor
        col={col}
        initial={value}
        options={options}
        onCommit={onCommit}
        onCancel={onCancel}
        align={align}
      />
    </td>
  );
}

function Editor({
  col,
  initial,
  options,
  onCommit,
  onCancel,
  align,
}: {
  col: SheetColumn;
  initial: CellValue;
  options: SheetOption[];
  onCommit: (raw: string, step?: 1 | -1) => void;
  onCancel: () => void;
  align: string;
}) {
  const ref = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const done = useRef(false);
  useEffect(() => {
    ref.current?.focus();
    if (ref.current && "select" in ref.current && col.type !== "date") ref.current.select();
  }, [col.type]);
  const finish = (raw: string, step?: 1 | -1) => {
    if (done.current) return;
    done.current = true;
    onCommit(raw, step);
  };
  const keys = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Escape") {
      done.current = true;
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      finish(e.currentTarget.value);
    } else if (e.key === "Tab") {
      e.preventDefault();
      finish(e.currentTarget.value, e.shiftKey ? -1 : 1);
    }
  };
  const common = "w-full h-9 px-2 bg-white outline-none text-[13px] " + align;
  if (col.type === "select" || col.type === "ref") {
    return (
      <select
        ref={ref}
        defaultValue={initial === null ? "" : String(initial)}
        className={common}
        onKeyDown={keys}
        onChange={(e) => finish(e.target.value)}
        onBlur={(e) => finish(e.target.value)}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      ref={ref}
      type={col.type === "date" ? "date" : "text"}
      inputMode={col.type === "money" ? "decimal" : col.type === "number" ? "numeric" : undefined}
      defaultValue={initial === null ? "" : String(initial)}
      maxLength={col.type === "text" ? 500 : 20}
      className={common}
      onKeyDown={keys}
      onBlur={(e) => finish(e.target.value)}
    />
  );
}
