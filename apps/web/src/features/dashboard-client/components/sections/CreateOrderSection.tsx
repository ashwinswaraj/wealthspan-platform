import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  FieldLabel,
  FieldHint,
  Badge,
  ButtonSpinner,
  OverlaySpinner,
} from "@jobrio/ui/design-system";
import { cn } from "@jobrio/utils/utils";
import { SectionHeader, Card } from "@/components/dashboard/shared";
import {
  ORDER_CATALOG,
  findCategory,
  findService,
  standardDeliveryDate,
  subscribeOrderCatalog,
  type RequirementField,
} from "@/features/dashboard-client/lib/order-catalog";
import {
  checkTimeline,
  emptyDraft,
  isFieldFilled,
  missingRequirementFields,
  submitOrder,
  type OrderDraft,
  type RequirementValue,
  type SubmittedOrder,
} from "@/features/dashboard-client/lib/order-draft";
import {
  uploadOrderFile,
  deleteOrderFile,
} from "@/features/dashboard-client/lib/order-uploads.functions";

/* ------------------------------------------------------------------ */
/* Wizard steps                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
  { index: 1, label: "Category" },
  { index: 2, label: "Service" },
  { index: 3, label: "Requirements" },
  { index: 4, label: "Project Description" },
  { index: 5, label: "Deliverables" },
  { index: 6, label: "References & Files" },
  { index: 7, label: "Additional Requirements" },
  { index: 8, label: "Delivery Requirement" },
  { index: 9, label: "Review Order" },
];

const CLIENT = { id: "CL-10294", name: "Aarav Mehta" };

const ErrorText = ({ children }: { children?: string | null }) =>
  children ? (
    <p
      className="mt-1.5 text-xs font-semibold text-[#b3261e] flex items-start gap-1.5"
      role="alert"
    >
      <span className="material-symbols-outlined text-[14px] leading-4">error</span>
      {children}
    </p>
  ) : null;

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left",
      active
        ? "bg-primary text-on-primary border-primary shadow-sm"
        : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/50",
    )}
  >
    {children}
  </button>
);

const CheckRow = ({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
}) => (
  <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low cursor-pointer hover:border-primary/50 transition-colors">
    <input
      type="checkbox"
      className="h-4 w-4 rounded accent-[color:var(--color-primary,#004AC6)]"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="text-sm text-on-surface">{children}</span>
  </label>
);

const SummaryRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-3 border-b border-outline-variant/30 last:border-0">
    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
      {label}
    </span>
    <div className="text-sm text-on-surface break-words">{children || "—"}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Dynamic requirement field                                           */
/* ------------------------------------------------------------------ */

const RequirementInput = ({
  field,
  value,
  error,
  onChange,
}: {
  field: RequirementField;
  value: RequirementValue | undefined;
  error?: string | null;
  onChange: (next: RequirementValue) => void;
}) => {
  const selected = Array.isArray(value) ? value : [];

  return (
    <div>
      <FieldLabel>{field.label}</FieldLabel>
      {field.type === "textarea" && (
        <Textarea
          rows={3}
          className="mt-1 resize-none"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {(field.type === "text" || field.type === "number") && (
        <Input
          type={field.type === "number" ? "number" : "text"}
          className="mt-1"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === "select" && (
        <Select
          className="mt-1"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      )}
      {field.type === "multiselect" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <Chip
              key={o}
              active={selected.includes(o)}
              onClick={() =>
                onChange(selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o])
              }
            >
              {o}
            </Chip>
          ))}
        </div>
      )}
      {field.hint && <FieldHint>{field.hint}</FieldHint>}
      <ErrorText>{error}</ErrorText>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Create Order wizard                                                 */
/* ------------------------------------------------------------------ */

export const CreateOrderSection = () => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OrderDraft>(emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customDeliverable, setCustomDeliverable] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Catalog is shared with the Services Desk; re-render if a service is
  // created/updated there while this wizard is open.
  const [, forceCatalogTick] = useState(0);
  useEffect(() => subscribeOrderCatalog(() => forceCatalogTick((t) => t + 1)), []);

  const category = findCategory(draft.categoryId);
  const service = findService(draft.categoryId, draft.serviceId);
  const timeline = useMemo(() => checkTimeline(draft), [draft]);

  const patch = (next: Partial<OrderDraft>) => setDraft((d) => ({ ...d, ...next }));
  const setRequirement = (id: string, value: RequirementValue) => {
    setDraft((d) => ({ ...d, requirements: { ...d.requirements, [id]: value } }));
    setErrors((e) => {
      const { [id]: _removed, ...rest } = e;
      return rest;
    });
  };

  /* ----------------------------- validation ---------------------------- */

  const validateStep = (target: number): Record<string, string> => {
    const next: Record<string, string> = {};
    if (target === 1 && !draft.categoryId) next["category"] = "Please select a category.";
    if (target === 2 && !draft.serviceId) next["service"] = "Please select a service.";
    if (target === 3 && service) {
      for (const field of missingRequirementFields(service.requirements, draft.requirements)) {
        next[field.id] = `${field.label} is required.`;
      }
    }
    if (target === 4) {
      const text = draft.projectDescription.trim();
      if (!text) next["projectDescription"] = "Please tell us what you need.";
      else if (text.length < 30)
        next["projectDescription"] = "Please add at least 30 characters so we understand the work.";
      else if (text.length > 4000)
        next["projectDescription"] = "Please keep this under 4000 characters.";
    }
    if (target === 5 && draft.deliverables.length + draft.customDeliverables.length === 0)
      next["deliverables"] = "Select at least one deliverable.";
    if (target === 7 && draft.additionalRequirements.length > 2000)
      next["additionalRequirements"] = "Please keep this under 2000 characters.";
    if (target === 8) {
      if (draft.deliveryMode === "custom") {
        if (!draft.requestedDate) next["requestedDate"] = "Please choose a required delivery date.";
        else if (timeline && timeline.requestedDays < 1)
          next["requestedDate"] = "Delivery date must be in the future.";
      }
    }
    return next;
  };

  const goNext = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  /** Every step is validated before a final submit is allowed. */
  const missingSteps = useMemo(() => {
    const list: { index: number; label: string; issues: string[] }[] = [];
    for (const s of STEPS.slice(0, 8)) {
      const found = validateStep(s.index);
      if (Object.keys(found).length > 0) {
        list.push({ index: s.index, label: s.label, issues: Object.values(found) });
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, service, timeline]);

  /* ------------------------------- files ------------------------------- */

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        // Uploaded straight to the server — never held in browser storage.
        const ref = await uploadOrderFile({ data: form });
        setDraft((d) => ({ ...d, files: [...d.files, ref] }));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeFile = async (id: string) => {
    setDraft((d) => ({ ...d, files: d.files.filter((f) => f.id !== id) }));
    try {
      await deleteOrderFile({ data: { id } });
    } catch {
      /* the reference is already gone from the draft */
    }
  };

  const addLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    if (!/^https?:\/\/\S+\.\S+/.test(value)) {
      setErrors((e) => ({
        ...e,
        referenceLink: "Enter a valid URL starting with http:// or https://",
      }));
      return;
    }
    setErrors((e) => {
      const { referenceLink: _r, ...rest } = e;
      return rest;
    });
    patch({ referenceLinks: [...draft.referenceLinks, value] });
    setLinkInput("");
  };

  /* ------------------------------ submit ------------------------------- */

  const handleSubmit = async () => {
    if (missingSteps.length > 0 || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(submitOrder(draft, CLIENT));
    setSubmitting(false);
  };

  const startNewOrder = () => {
    setSubmitted(null);
    setDraft(emptyDraft());
    setErrors({});
    setStep(1);
  };

  /* --------------------------- confirmation ---------------------------- */

  if (submitted) {
    return (
      <div className="space-y-6 max-w-3xl">
        <SectionHeader
          title="Order created"
          subtitle="Your order has been sent to the Jobrio Order Desk for review."
        />
        <Card>
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-[32px] text-primary">check_circle</span>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold font-headline text-on-background">
                Order #{submitted.system.orderId}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Status: <Badge>{submitted.system.status}</Badge>
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant">
                {["Order Created", "Pending Review", "Order Desk"].map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-surface-container">{s}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-on-surface-variant mb-3">
            Order snapshot — shared with the Order Desk
          </h4>
          <SummaryRow label="Client">
            {CLIENT.name} · {submitted.system.clientId}
          </SummaryRow>
          <SummaryRow label="Order ID">{submitted.system.orderId}</SummaryRow>
          <SummaryRow label="Category">{submitted.categoryName}</SummaryRow>
          <SummaryRow label="Service">{submitted.serviceName}</SummaryRow>
          <SummaryRow label="Created">
            {new Date(submitted.system.createdAt).toLocaleString()}
          </SummaryRow>
          <SummaryRow label="Current status">{submitted.system.status}</SummaryRow>
          <SummaryRow label="Requested deadline">
            {submitted.timeline?.requestedDate} ({submitted.timeline?.requestedDays} days)
          </SummaryRow>
          <SummaryRow label="Service SLA">{submitted.timeline?.slaDays} days</SummaryRow>
          <SummaryRow label="Timeline status">{submitted.timeline?.status}</SummaryRow>
          <SummaryRow label="Versions">
            service {submitted.system.serviceVersion} · pricing {submitted.system.pricingVersion} ·
            SLA {submitted.system.slaVersion} · policy {submitted.system.policyVersion}
          </SummaryRow>
          <SummaryRow label="Requirement status">
            {submitted.system.requirementCompletionStatus}
          </SummaryRow>
          <SummaryRow label="Order source">{submitted.system.orderSource}</SummaryRow>
        </Card>

        <Card>
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-on-surface-variant mb-3">
            What happens next
          </h4>
          <ol className="space-y-2 text-sm text-on-surface-variant">
            {[
              "Order Desk reviews your order and may request more information.",
              "Once approved, Finance & Escrow creates your bill.",
              "After payment is received, the Assignment Engine matches and assigns a professional.",
              "QA Desk reviews delivery before it reaches you for final review.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  arrow_right
                </span>
                {t}
              </li>
            ))}
          </ol>
        </Card>

        <Button variant="primary" size="md" onClick={startNewOrder}>
          Create another order
        </Button>
      </div>
    );
  }

  /* ------------------------------ wizard ------------------------------- */

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Create & place order"
        subtitle="Choose a category, pick the service, and tell us exactly what you need."
      />

      <Card className="relative">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">
              Step {step} of {STEPS.length} · {STEPS[step - 1]?.label}
            </span>
            <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 1. Select Category */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Select category
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Pick the broad group your work belongs to.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ORDER_CATALOG.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    patch({
                      categoryId: c.id,
                      serviceId: undefined,
                      requirements: {},
                      deliverables: [],
                    })
                  }
                  className={cn(
                    "text-left p-4 rounded-2xl border transition-all",
                    draft.categoryId === c.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-outline-variant/40 bg-surface-container-low hover:border-primary/50",
                  )}
                >
                  <span className="material-symbols-outlined text-[22px] text-primary">
                    {c.icon}
                  </span>
                  <p className="font-bold text-on-background mt-1">{c.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{c.description}</p>
                </button>
              ))}
            </div>
            <ErrorText>{errors["category"]}</ErrorText>
          </div>
        )}

        {/* 2. Select Service */}
        {step === 2 && category && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Select service in {category.name}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              This is the actual work Jobrio will deliver.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    patch({
                      serviceId: s.id,
                      requirements: {},
                      deliverables: [...s.deliverables.slice(0, 3)],
                    })
                  }
                  className={cn(
                    "text-left p-4 rounded-2xl border transition-all",
                    draft.serviceId === s.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-outline-variant/40 bg-surface-container-low hover:border-primary/50",
                  )}
                >
                  <p className="font-bold text-on-background">{s.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Standard delivery: {s.slaDays} days
                  </p>
                </button>
              ))}
            </div>
            <ErrorText>{errors["service"]}</ErrorText>
          </div>
        )}

        {/* 3. Tell us about your project */}
        {step === 3 && service && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Tell us about your project
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-5">
              These questions are specific to {service.name}.
            </p>
            <div className="space-y-5">
              {service.requirements.map((f) => (
                <RequirementInput
                  key={f.id}
                  field={f}
                  value={draft.requirements[f.id]}
                  error={errors[f.id]}
                  onChange={(v) => setRequirement(f.id, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Project description */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              What do you need?
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Explain your requirement in normal language — structured questions can't capture
              everything.
            </p>
            <Textarea
              rows={7}
              className="resize-none"
              maxLength={4000}
              placeholder="Mujhe apne restaurant ke liye modern aur premium logo chahiye jo Instagram, website aur packaging par use ho sake."
              value={draft.projectDescription}
              onChange={(e) => patch({ projectDescription: e.target.value })}
            />
            <div className="flex justify-between items-start">
              <ErrorText>{errors["projectDescription"]}</ErrorText>
              <span className="text-xs text-on-surface-variant mt-1.5">
                {draft.projectDescription.length}/4000
              </span>
            </div>
          </div>
        )}

        {/* 5. Required deliverables */}
        {step === 5 && service && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Required deliverables
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Jobrio recommends these for {service.name}. Tick what you need.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.deliverables.map((d) => (
                <CheckRow
                  key={d}
                  checked={draft.deliverables.includes(d)}
                  onChange={(next) =>
                    patch({
                      deliverables: next
                        ? [...draft.deliverables, d]
                        : draft.deliverables.filter((x) => x !== d),
                    })
                  }
                >
                  {d}
                </CheckRow>
              ))}
            </div>

            <div className="mt-5">
              <FieldLabel>Add your own deliverable</FieldLabel>
              <div className="flex gap-2 mt-1">
                <Input
                  value={customDeliverable}
                  placeholder="e.g. Packaging mockups"
                  onChange={(e) => setCustomDeliverable(e.target.value)}
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    const value = customDeliverable.trim();
                    if (!value) return;
                    patch({ customDeliverables: [...draft.customDeliverables, value] });
                    setCustomDeliverable("");
                  }}
                >
                  Add
                </Button>
              </div>
              {draft.customDeliverables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {draft.customDeliverables.map((d) => (
                    <span
                      key={d}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface"
                    >
                      {d}
                      <button
                        type="button"
                        aria-label={`Remove ${d}`}
                        onClick={() =>
                          patch({
                            customDeliverables: draft.customDeliverables.filter((x) => x !== d),
                          })
                        }
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ErrorText>{errors["deliverables"]}</ErrorText>
          </div>
        )}

        {/* 6. References & files */}
        {step === 6 && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              References & files
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Share links and upload supporting material. Files are stored securely on Jobrio
              servers as soon as you add them.
            </p>

            <FieldLabel>Reference links</FieldLabel>
            <div className="flex gap-2 mt-1">
              <Input
                value={linkInput}
                placeholder="https://instagram.com/yourbrand"
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button variant="secondary" size="md" onClick={addLink}>
                Add link
              </Button>
            </div>
            <ErrorText>{errors["referenceLink"]}</ErrorText>
            {draft.referenceLinks.length > 0 && (
              <ul className="mt-3 space-y-2">
                {draft.referenceLinks.map((l) => (
                  <li
                    key={l}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40"
                  >
                    <span className="text-sm text-on-surface truncate">{l}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${l}`}
                      onClick={() =>
                        patch({ referenceLinks: draft.referenceLinks.filter((x) => x !== l) })
                      }
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        close
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <FieldLabel>Upload files</FieldLabel>
              <FieldHint>
                Images, PDFs, documents, brand assets or videos — up to 25 MB per file.
              </FieldHint>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                variant="secondary"
                size="md"
                className="mt-2"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <ButtonSpinner />
                    Uploading…
                  </span>
                ) : (
                  "Choose files"
                )}
              </Button>
              <ErrorText>{uploadError}</ErrorText>
              {draft.files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {draft.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40"
                    >
                      <span className="text-sm text-on-surface truncate">
                        {f.name}{" "}
                        <span className="text-xs text-on-surface-variant">
                          ({Math.max(1, Math.round(f.size / 1024))} KB)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => removeFile(f.id)}
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          delete
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 7. Additional requirements */}
        {step === 7 && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Anything else we should know?
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Optional — extra instructions not covered by the earlier fields.
            </p>
            <Textarea
              rows={6}
              className="resize-none"
              maxLength={2000}
              placeholder="Design professional hona chahiye aur bahut zyada colors use nahi karne hain."
              value={draft.additionalRequirements}
              onChange={(e) => patch({ additionalRequirements: e.target.value })}
            />
            <div className="flex justify-between items-start">
              <ErrorText>{errors["additionalRequirements"]}</ErrorText>
              <span className="text-xs text-on-surface-variant mt-1.5">
                {draft.additionalRequirements.length}/2000
              </span>
            </div>
          </div>
        )}

        {/* 8. Delivery requirement */}
        {step === 8 && service && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              When do you need this?
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              We validate your date against the {service.name} SLA of {service.slaDays} days.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => patch({ deliveryMode: "standard", requestedDate: "" })}
                className={cn(
                  "text-left p-4 rounded-2xl border transition-all",
                  draft.deliveryMode === "standard"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/40 bg-surface-container-low hover:border-primary/50",
                )}
              >
                <p className="font-bold text-on-background">Standard delivery</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {standardDeliveryDate(service.slaDays)} · {service.slaDays} days
                </p>
              </button>
              <button
                type="button"
                onClick={() => patch({ deliveryMode: "custom" })}
                className={cn(
                  "text-left p-4 rounded-2xl border transition-all",
                  draft.deliveryMode === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/40 bg-surface-container-low hover:border-primary/50",
                )}
              >
                <p className="font-bold text-on-background">Custom required date</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Pick the date you actually need this by.
                </p>
              </button>
            </div>

            {draft.deliveryMode === "custom" && (
              <div className="mt-4">
                <FieldLabel>Required delivery date</FieldLabel>
                <Input
                  type="date"
                  className="mt-1"
                  min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
                  value={draft.requestedDate}
                  onChange={(e) => patch({ requestedDate: e.target.value })}
                />
                <ErrorText>{errors["requestedDate"]}</ErrorText>
              </div>
            )}

            {timeline && (
              <div
                className={cn(
                  "mt-4 p-4 rounded-2xl text-sm border",
                  timeline.status === "not-possible"
                    ? "border-[#b3261e]/40 bg-[#b3261e]/5 text-[#b3261e]"
                    : timeline.status === "tight"
                      ? "border-tertiary/40 bg-tertiary/5 text-on-surface"
                      : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant",
                )}
              >
                {timeline.message}
              </div>
            )}
          </div>
        )}

        {/* 9. Review order */}
        {step === 9 && (
          <div>
            <h3 className="text-lg font-extrabold font-headline text-on-background">
              Review your order
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Check everything before it goes to the Order Desk.
            </p>

            {missingSteps.length > 0 && (
              <div className="mb-5 p-4 rounded-2xl border border-[#b3261e]/40 bg-[#b3261e]/5">
                <p className="text-sm font-bold text-[#b3261e]">
                  Some required information is still missing
                </p>
                <ul className="mt-2 space-y-1.5">
                  {missingSteps.map((m) => (
                    <li key={m.index} className="text-xs text-[#b3261e] flex items-center gap-2">
                      <button
                        type="button"
                        className="underline font-semibold"
                        onClick={() => setStep(m.index)}
                      >
                        Step {m.index} · {m.label}
                      </button>
                      <span>— {m.issues.join(" ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-outline-variant/40 p-4">
              <SummaryRow label="Category">{category?.name}</SummaryRow>
              <SummaryRow label="Service">{service?.name}</SummaryRow>
              <SummaryRow label="Requirements">
                <ul className="space-y-1">
                  {service?.requirements
                    .filter((f) => isFieldFilled(draft.requirements[f.id]))
                    .map((f) => (
                      <li key={f.id}>
                        <span className="text-on-surface-variant">{f.label}:</span>{" "}
                        {Array.isArray(draft.requirements[f.id])
                          ? (draft.requirements[f.id] as string[]).join(", ")
                          : (draft.requirements[f.id] as string)}
                      </li>
                    ))}
                </ul>
              </SummaryRow>
              <SummaryRow label="Project description">{draft.projectDescription}</SummaryRow>
              <SummaryRow label="Deliverables">
                {[...draft.deliverables, ...draft.customDeliverables].join(", ")}
              </SummaryRow>
              <SummaryRow label="References">{draft.referenceLinks.join(", ")}</SummaryRow>
              <SummaryRow label="Uploaded files">
                {draft.files.map((f) => f.name).join(", ")}
              </SummaryRow>
              <SummaryRow label="Delivery date">
                {timeline
                  ? `${timeline.requestedDate} (${timeline.requestedDays} days · SLA ${timeline.slaDays} days)`
                  : ""}
              </SummaryRow>
              <SummaryRow label="Additional requirements">
                {draft.additionalRequirements}
              </SummaryRow>
            </div>

            <p className="text-xs text-on-surface-variant mt-3">
              Order ID, client ID, versions, timestamps and status are recorded automatically by
              Jobrio.
            </p>
          </div>
        )}

        {/* Footer navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" size="md" onClick={goBack} disabled={step === 1 || submitting}>
            Back
          </Button>
          {step < STEPS.length ? (
            <Button variant="primary" size="md" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={missingSteps.length > 0 || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <ButtonSpinner />
                  Submitting order…
                </span>
              ) : (
                "Submit order"
              )}
            </Button>
          )}
        </div>

        <OverlaySpinner show={submitting} label="Creating your order…" />
      </Card>
    </div>
  );
};
