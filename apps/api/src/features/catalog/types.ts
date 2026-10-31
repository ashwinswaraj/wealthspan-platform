import type {
  FinanceAccount,
  FinanceEvent,
  FinanceInvestment,
  FinanceLoan,
  FinanceProject,
} from "@jobrio/types";

export type CatalogEntity = "projects" | "accounts" | "events" | "loans" | "investments";
export const CATALOG_ENTITIES: readonly CatalogEntity[] = [
  "projects",
  "accounts",
  "events",
  "loans",
  "investments",
];

export interface CatalogRecordMap {
  projects: FinanceProject;
  accounts: FinanceAccount;
  events: FinanceEvent;
  loans: FinanceLoan;
  investments: FinanceInvestment;
}
export type CatalogRecord<E extends CatalogEntity> = CatalogRecordMap[E];
/** A record before the database adds id and timestamps. */
export type NewRecord<E extends CatalogEntity> = Omit<
  CatalogRecord<E>,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

/** Live (not soft-deleted) rows only; every method is scoped to one user. */
export interface CatalogStore {
  list<E extends CatalogEntity>(entity: E, userId: string): Promise<CatalogRecord<E>[]>;
  get<E extends CatalogEntity>(
    entity: E,
    userId: string,
    id: string,
  ): Promise<CatalogRecord<E> | null>;
  insert<E extends CatalogEntity>(entity: E, row: NewRecord<E>): Promise<CatalogRecord<E>>;
  update<E extends CatalogEntity>(
    entity: E,
    userId: string,
    id: string,
    patch: Partial<NewRecord<E>>,
  ): Promise<CatalogRecord<E>>;
  softDelete(
    entity: CatalogEntity,
    userId: string,
    id: string,
    deletedAtIso: string,
  ): Promise<void>;
}

export class CatalogError extends Error {
  constructor(
    public code: "invalid" | "not_found" | "conflict",
    message: string,
    public status = 400,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
