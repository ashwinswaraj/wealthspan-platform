/**
 * Projects, accounts, events, loans and investments — the things a transaction points at.
 * Same rules as transactions: owner comes from the login, every referenced id must be
 * the user's own, deletes are soft (30 days), every change is audited.
 */
import type { FinanceChangeSource } from "@jobrio/types";
import {
  validateAccountInput,
  validateEventInput,
  validateInvestmentInput,
  validateLoanInput,
  validateProjectInput,
  type FieldErrors,
} from "@jobrio/validation";
import { rupeesToPaise } from "@jobrio/utils/finance";
import type { FinanceStore } from "../finance/types";
import {
  CatalogError,
  type CatalogEntity,
  type CatalogRecord,
  type CatalogStore,
  type NewRecord,
} from "./types";

type In = Record<string, unknown>;
const t = (v: unknown) => (typeof v === "string" ? v.trim() || null : (v ?? null));
const has = (i: In, k: string) => k in i;
const paise = (v: unknown) =>
  v === null || v === undefined || v === "" ? null : rupeesToPaise(Number(v));
const numOrNull = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

/** Turns what the user typed (rupees, strings) into the stored shape. Only fields that were sent are returned. */
const toStored: { [E in CatalogEntity]: (i: In) => Partial<NewRecord<E>> } = {
  projects: (i) => ({
    ...(has(i, "name") && { name: String(t(i.name) ?? "") }),
    ...(has(i, "kind") && { kind: i.kind as never }),
  }),
  accounts: (i) => ({
    ...(has(i, "name") && { name: String(t(i.name) ?? "") }),
    ...(has(i, "kind") && { kind: i.kind as never }),
    ...(has(i, "openingBalance") && { openingBalancePaise: paise(i.openingBalance) ?? 0 }),
    ...(has(i, "creditLimit") && { creditLimitPaise: paise(i.creditLimit) }),
    ...(has(i, "defaultProjectId") && { defaultProjectId: t(i.defaultProjectId) as string | null }),
  }),
  events: (i) => ({
    ...(has(i, "projectId") && { projectId: String(t(i.projectId) ?? "") }),
    ...(has(i, "name") && { name: String(t(i.name) ?? "") }),
    ...(has(i, "budget") && { budgetPaise: paise(i.budget) }),
    ...(has(i, "startDate") && { startDate: t(i.startDate) as string | null }),
    ...(has(i, "endDate") && { endDate: t(i.endDate) as string | null }),
  }),
  loans: (i) => ({
    ...(has(i, "projectId") && { projectId: String(t(i.projectId) ?? "") }),
    ...(has(i, "lender") && { lender: String(t(i.lender) ?? "") }),
    ...(has(i, "principal") && { principalPaise: paise(i.principal) ?? 0 }),
    ...(has(i, "interestRatePct") && { interestRatePct: numOrNull(i.interestRatePct) }),
    ...(has(i, "emi") && { emiPaise: paise(i.emi) }),
    ...(has(i, "emiDayOfMonth") && { emiDayOfMonth: numOrNull(i.emiDayOfMonth) }),
    ...(has(i, "startDate") && { startDate: t(i.startDate) as string | null }),
    ...(has(i, "tenureMonths") && { tenureMonths: numOrNull(i.tenureMonths) }),
  }),
  investments: (i) => ({
    ...(has(i, "projectId") && { projectId: String(t(i.projectId) ?? "") }),
    ...(has(i, "name") && { name: String(t(i.name) ?? "") }),
    ...(has(i, "kind") && { kind: i.kind as never }),
    ...(has(i, "currentValue") && { currentValuePaise: paise(i.currentValue) }),
    ...(has(i, "folioNo") && { folioNo: t(i.folioNo) as string | null }),
  }),
};

const validators: { [E in CatalogEntity]: (i: In) => FieldErrors } = {
  projects: (i) => validateProjectInput(i as never),
  accounts: (i) => validateAccountInput(i as never),
  events: (i) => validateEventInput(i as never),
  loans: (i) => validateLoanInput(i as never),
  investments: (i) => validateInvestmentInput(i as never),
};

/** Which transaction column points at each entity (to stop deleting something still in use). */
const TX_REFS: Record<
  CatalogEntity,
  (
    | "projectId"
    | "accountId"
    | "fromAccountId"
    | "toAccountId"
    | "eventId"
    | "loanId"
    | "investmentId"
  )[]
> = {
  projects: ["projectId"],
  accounts: ["accountId", "fromAccountId", "toAccountId"],
  events: ["eventId"],
  loans: ["loanId"],
  investments: ["investmentId"],
};

/** Per user, per kind. Lists are read in full, so this keeps every request small. */
export const MAX_PER_ENTITY = 500;

const LABEL: Record<CatalogEntity, string> = {
  projects: "Project",
  accounts: "Account",
  events: "Event",
  loans: "Loan",
  investments: "Investment",
};

export const createCatalogService = ({
  store,
  finance,
  now = () => new Date(),
}: {
  store: CatalogStore;
  finance: Pick<FinanceStore, "listTransactions" | "insertAudit">;
  now?: () => Date;
}) => {
  const SINGULAR = {
    projects: "project",
    accounts: "account",
    events: "event",
    loans: "loan",
    investments: "investment",
  } as const;
  const audit = (
    userId: string,
    source: FinanceChangeSource,
    action: string,
    entity: CatalogEntity,
    entityId: string,
    before: unknown,
    after: unknown,
  ) =>
    finance.insertAudit({
      userId,
      actor: source,
      action: `${action}_${SINGULAR[entity]}`,
      entity: SINGULAR[entity],
      entityId,
      before,
      after,
      createdAt: now().toISOString(),
      undoneAt: null,
    });

  const need = async <E extends CatalogEntity>(entity: E, userId: string, id: string) => {
    const r = await store.get(entity, userId, id);
    if (!r) throw new CatalogError("not_found", `${LABEL[entity]} not found.`, 404);
    return r;
  };

  /** projectId (and an account's default project) must be one of the user's own live projects. */
  const checkRefs = async (entity: CatalogEntity, userId: string, stored: In) => {
    const projectId = entity === "accounts" ? stored.defaultProjectId : stored.projectId;
    if (
      typeof projectId === "string" &&
      projectId &&
      !(await store.get("projects", userId, projectId))
    )
      throw new CatalogError("invalid", "That project doesn't exist.", 400, {
        [entity === "accounts" ? "defaultProjectId" : "projectId"]: "Choose one of your projects.",
      } as Record<string, string>);
  };

  const fail = (f: FieldErrors): never => {
    throw new CatalogError(
      "invalid",
      Object.values(f)[0] ?? "Invalid entry.",
      400,
      f as Record<string, string>,
    );
  };

  return {
    list: <E extends CatalogEntity>(entity: E, userId: string) => store.list(entity, userId),

    async create<E extends CatalogEntity>(
      entity: E,
      userId: string,
      input: In,
      source: FinanceChangeSource = "manual",
    ): Promise<CatalogRecord<E>> {
      const errors = validators[entity](input);
      if (Object.keys(errors).length) fail(errors);
      const stored = toStored[entity](input) as In;
      await checkRefs(entity, userId, stored);
      if ((await store.list(entity, userId)).length >= MAX_PER_ENTITY)
        throw new CatalogError(
          "conflict",
          `You can keep up to ${MAX_PER_ENTITY} ${entity}. Delete some first.`,
          429,
        );
      const base: In = { userId, createdBy: source, ...stored };
      if (entity === "projects") base.archivedAt = null;
      if (entity === "accounts")
        Object.assign(base, {
          archivedAt: null,
          defaultProjectId: stored.defaultProjectId ?? null,
          creditLimitPaise: stored.creditLimitPaise ?? null,
          openingBalancePaise: stored.openingBalancePaise ?? 0,
        });
      if (entity === "events")
        Object.assign(base, {
          status: "open",
          concludedAt: null,
          budgetPaise: stored.budgetPaise ?? null,
          startDate: stored.startDate ?? null,
          endDate: stored.endDate ?? null,
        });
      if (entity === "loans")
        Object.assign(base, {
          status: "active",
          interestRatePct: stored.interestRatePct ?? null,
          emiPaise: stored.emiPaise ?? null,
          emiDayOfMonth: stored.emiDayOfMonth ?? null,
          startDate: stored.startDate ?? null,
          tenureMonths: stored.tenureMonths ?? null,
        });
      if (entity === "investments")
        Object.assign(base, {
          currentValuePaise: stored.currentValuePaise ?? null,
          folioNo: stored.folioNo ?? null,
        });
      const row = await store.insert(entity, base as never);
      await audit(userId, source, "create", entity, row.id, null, row);
      return row;
    },

    async update<E extends CatalogEntity>(
      entity: E,
      userId: string,
      id: string,
      patch: In,
      source: FinanceChangeSource = "manual",
    ): Promise<CatalogRecord<E>> {
      const before = await need(entity, userId, id);
      // validate the merged result so a partial edit can't leave the record invalid
      const merged = { ...recordAsInput(entity, before as never), ...patch };
      const errors = validators[entity](merged);
      if (Object.keys(errors).length) fail(errors);
      const stored = toStored[entity](patch) as In;
      await checkRefs(entity, userId, stored);
      const row = await store.update(entity, userId, id, stored as never);
      await audit(userId, source, "update", entity, id, before, row);
      return row;
    },

    async remove(
      entity: CatalogEntity,
      userId: string,
      id: string,
      source: FinanceChangeSource = "manual",
    ): Promise<void> {
      const before = await need(entity, userId, id);
      const txs = await finance.listTransactions(userId);
      const used = txs.filter((x) => TX_REFS[entity].some((k) => x[k] === id)).length;
      if (used)
        throw new CatalogError(
          "conflict",
          `${LABEL[entity]} has ${used} entr${used === 1 ? "y" : "ies"}. Delete or move them first.`,
          409,
        );
      if (entity === "projects") {
        for (const other of ["events", "loans", "investments"] as const) {
          if (
            (await store.list(other, userId)).some(
              (r) => (r as { projectId: string }).projectId === id,
            )
          )
            throw new CatalogError(
              "conflict",
              `Project still has ${other}. Delete them first.`,
              409,
            );
        }
      }
      await store.softDelete(entity, userId, id, now().toISOString());
      await audit(userId, source, "delete", entity, id, before, null);
    },

    /** Festival / function finished: its spending now counts as normal expense. */
    async setEventStatus(
      userId: string,
      id: string,
      status: "open" | "concluded",
      source: FinanceChangeSource = "manual",
    ) {
      const before = await need("events", userId, id);
      if (before.status === status)
        throw new CatalogError("conflict", `Event is already ${status}.`, 409);
      const row = await store.update("events", userId, id, {
        status,
        concludedAt: status === "concluded" ? now().toISOString() : null,
      });
      await audit(
        userId,
        source,
        status === "concluded" ? "conclude" : "reopen",
        "events",
        id,
        before,
        row,
      );
      return row;
    },

    async setLoanStatus(
      userId: string,
      id: string,
      status: "active" | "closed",
      source: FinanceChangeSource = "manual",
    ) {
      const before = await need("loans", userId, id);
      const row = await store.update("loans", userId, id, { status });
      await audit(userId, source, "update", "loans", id, before, row);
      return row;
    },

    async archive(
      entity: "projects" | "accounts",
      userId: string,
      id: string,
      archived: boolean,
      source: FinanceChangeSource = "manual",
    ) {
      const before = await need(entity, userId, id);
      const row = await store.update(entity, userId, id, {
        archivedAt: archived ? now().toISOString() : null,
      } as never);
      await audit(userId, source, "update", entity, id, before, row);
      return row;
    },
  };
};

/** Stored record → the rupee-based input shape the validators expect. */
function recordAsInput(entity: CatalogEntity, r: Record<string, unknown>): In {
  const r2 = (p: unknown) => (p === null || p === undefined ? null : Number(p) / 100);
  switch (entity) {
    case "projects":
      return { name: r.name, kind: r.kind };
    case "accounts":
      return {
        name: r.name,
        kind: r.kind,
        openingBalance: r2(r.openingBalancePaise),
        creditLimit: r2(r.creditLimitPaise),
      };
    case "events":
      return {
        projectId: r.projectId,
        name: r.name,
        budget: r2(r.budgetPaise),
        startDate: r.startDate,
        endDate: r.endDate,
      };
    case "loans":
      return {
        projectId: r.projectId,
        lender: r.lender,
        principal: r2(r.principalPaise),
        interestRatePct: r.interestRatePct,
        emi: r2(r.emiPaise),
        emiDayOfMonth: r.emiDayOfMonth,
        tenureMonths: r.tenureMonths,
      };
    case "investments":
      return {
        projectId: r.projectId,
        name: r.name,
        kind: r.kind,
        currentValue: r2(r.currentValuePaise),
      };
  }
}

export type CatalogService = ReturnType<typeof createCatalogService>;
