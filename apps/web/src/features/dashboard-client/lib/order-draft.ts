import {
  daysBetween,
  findCategory,
  findService,
  standardDeliveryDate,
  type RequirementField,
} from "./order-catalog";
import type { UploadedFileRef } from "./order-uploads.functions";
import { addOrderToRegistry, type OrderRow } from "@jobrio/constants";

/** Values captured by the dynamic service requirement form. */
export type RequirementValue = string | string[];

export interface OrderDraft {
  categoryId?: string;
  serviceId?: string;
  requirements: Record<string, RequirementValue>;
  projectDescription: string;
  deliverables: string[];
  customDeliverables: string[];
  referenceLinks: string[];
  files: UploadedFileRef[];
  additionalRequirements: string;
  deliveryMode: "standard" | "custom";
  requestedDate: string;
}

export const emptyDraft = (): OrderDraft => ({
  requirements: {},
  projectDescription: "",
  deliverables: [],
  customDeliverables: [],
  referenceLinks: [],
  files: [],
  additionalRequirements: "",
  deliveryMode: "standard",
  requestedDate: "",
});

export const isFieldFilled = (value: RequirementValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : !!value?.trim();

export const missingRequirementFields = (
  fields: RequirementField[],
  values: Record<string, RequirementValue>,
) => fields.filter((f) => f.required && !isFieldFilled(values[f.id]));

/** Timeline validation against the service SLA (step 8). */
export interface TimelineCheck {
  standardDate: string;
  requestedDate: string;
  requestedDays: number;
  slaDays: number;
  status: "standard" | "tight" | "not-possible" | "relaxed";
  message: string;
}

export const checkTimeline = (draft: OrderDraft): TimelineCheck | null => {
  const service = findService(draft.categoryId, draft.serviceId);
  if (!service) return null;
  const standardDate = standardDeliveryDate(service.slaDays);
  const requestedDate = draft.deliveryMode === "standard" ? standardDate : draft.requestedDate;
  if (!requestedDate) return null;
  const requestedDays = daysBetween(requestedDate);

  let status: TimelineCheck["status"] = "standard";
  let message = `Standard delivery for ${service.name} is ${service.slaDays} days.`;

  if (draft.deliveryMode === "custom") {
    if (requestedDays < Math.ceil(service.slaDays / 2)) {
      status = "not-possible";
      message = `Requested delivery: ${requestedDays} day${requestedDays === 1 ? "" : "s"}. Standard delivery: ${service.slaDays} days. This timeline is not possible — please choose a later date or continue and Jobrio will confirm feasibility.`;
    } else if (requestedDays < service.slaDays) {
      status = "tight";
      message = `Requested delivery: ${requestedDays} days. Standard delivery: ${service.slaDays} days. Rush handling may apply.`;
    } else {
      status = "relaxed";
      message = `Requested delivery: ${requestedDays} days — comfortably within the ${service.slaDays}-day standard SLA.`;
    }
  }

  return { standardDate, requestedDate, requestedDays, slaDays: service.slaDays, status, message };
};

/** Information the backend records automatically (step 14). */
export interface OrderSystemRecord {
  orderId: string;
  clientId: string;
  serviceId: string;
  categoryId: string;
  createdAt: string;
  orderSource: string;
  status: string;
  serviceVersion: string;
  pricingVersion: string;
  slaVersion: string;
  policyVersion: string;
  createdBy: string;
  lastUpdated: string;
  requirementCompletionStatus: "complete" | "incomplete";
}

export interface SubmittedOrder {
  system: OrderSystemRecord;
  draft: OrderDraft;
  categoryName: string;
  serviceName: string;
  timeline: TimelineCheck | null;
}

let orderSequence = 124;

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const clientEmailFor = (name: string) =>
  `${name.trim().toLowerCase().replace(/\s+/g, ".")}@client.jobrio.com`;

export const submitOrder = (
  draft: OrderDraft,
  client: { id: string; name: string },
): SubmittedOrder => {
  const category = findCategory(draft.categoryId);
  const service = findService(draft.categoryId, draft.serviceId);
  const now = new Date().toISOString();
  const orderId = `JBR-${String(orderSequence++).padStart(6, "0")}`;
  const timeline = checkTimeline(draft);
  const deadline =
    draft.deliveryMode === "custom" && draft.requestedDate
      ? draft.requestedDate
      : (timeline?.standardDate ?? "—");

  // Lands in the Super Admin Order Desk as "Pending Review" — the same
  // starting state as every other order — and drives the rest of the
  // order lifecycle from there (Awaiting Payment → Assigned → ...).
  const orderRow: OrderRow = {
    id: orderId,
    c: client.name,
    clientEmail: clientEmailFor(client.name),
    a: "Pending Quote",
    amountNum: 0,
    s: "pending",
    when: "Just now",
    service: service?.name ?? "",
    category: category?.name ?? "",
    deadline,
    createdAt: formatTimestamp(now),
    description: draft.projectDescription,
    files: draft.files.map((f) => f.name),
  };
  addOrderToRegistry(orderRow);

  return {
    system: {
      orderId,
      clientId: client.id,
      serviceId: service?.id ?? "",
      categoryId: category?.id ?? "",
      createdAt: now,
      orderSource: "Client Dashboard — Web",
      status: "Pending Review",
      serviceVersion: service?.serviceVersion ?? "v1",
      pricingVersion: service?.pricingVersion ?? "v1",
      slaVersion: service?.slaVersion ?? "v1",
      policyVersion: "v1",
      createdBy: client.name,
      lastUpdated: now,
      requirementCompletionStatus: "complete",
    },
    draft,
    categoryName: category?.name ?? "",
    serviceName: service?.name ?? "",
    timeline,
  };
};
