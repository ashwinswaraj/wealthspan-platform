import { useState } from "react";
import { cn } from "@jobrio/utils/utils";
import { toast } from "sonner";
import { Button } from "@jobrio/ui/design-system";
import { SectionHeader, Card } from "@/components/dashboard/shared";

export interface TrialTask {
  id: string;
  number: number;
  title: string;
  category: string;
  status: "not-started" | "in-progress" | "submitted" | "approved" | "revision";
  difficulty: "Easy" | "Intermediate" | "Advanced";
  estimatedHours: number;
  deadline: string;
  reward: string;
  brief: string;
  objectives: string[];
  requirements: string[];
  deliverables: string[];
  evaluation: { label: string; weight: number }[];
  timeline: { label: string; date: string; done: boolean }[];
  resources: { label: string; type: string }[];
}

const STATUS_MAP: Record<TrialTask["status"], { label: string; cls: string; icon: string }> = {
  "not-started": { label: "Not started", cls: "bg-slate-100 text-slate-600", icon: "schedule" },
  "in-progress": {
    label: "In progress",
    cls: "bg-primary-container/10 text-primary-container",
    icon: "autorenew",
  },
  submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-700", icon: "outbox" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700", icon: "verified" },
  revision: { label: "Revision requested", cls: "bg-rose-50 text-rose-700", icon: "edit_note" },
};

const StatusBadge = ({ status }: { status: TrialTask["status"] }) => {
  const c = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
        c.cls,
      )}
    >
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {c.icon}
      </span>
      {c.label}
    </span>
  );
};

const StatTile = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4">
    <span className="material-symbols-outlined text-primary-container mb-2 block">{icon}</span>
    <p className="text-[11px] uppercase tracking-wider text-outline font-bold">{label}</p>
    <p className="text-base font-extrabold font-headline text-on-surface mt-1">{value}</p>
  </div>
);

export const TrialTaskSection = ({
  task,
  completed = false,
  onComplete,
}: {
  task: TrialTask;
  completed?: boolean;
  onComplete?: () => void;
}) => {
  const [draftSaved, setDraftSaved] = useState(false);
  const doneCount = task.timeline.filter((t) => t.done).length;
  const progress = completed ? 100 : Math.round((doneCount / task.timeline.length) * 100);
  const effectiveStatus: TrialTask["status"] = completed ? "approved" : task.status;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Trial Task ${task.number}`}
        subtitle={task.title}
        action={<StatusBadge status={effectiveStatus} />}
      />

      <Card className="!p-0 overflow-hidden">
        <div
          className="px-6 py-8 sm:px-8 text-white"
          style={{ background: "linear-gradient(135deg, #004AC6 0%, #004AC6 100%)" }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider">
              {task.category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider">
              {task.difficulty}
            </span>
            <span className="text-[11px] font-semibold opacity-80">ID: {task.id}</span>
          </div>
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">
            {task.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base opacity-90 max-w-3xl leading-relaxed">
            {task.brief}
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-90 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile icon="schedule" label="Estimated" value={`${task.estimatedHours}h`} />
        <StatTile icon="event" label="Deadline" value={task.deadline} />
        <StatTile icon="paid" label="Reward" value={task.reward} />
        <StatTile
          icon="task_alt"
          label="Steps done"
          value={
            completed
              ? `${task.timeline.length}/${task.timeline.length}`
              : `${doneCount}/${task.timeline.length}`
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">
              Objectives
            </h3>
            <ul className="space-y-3">
              {task.objectives.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm text-on-surface-variant">
                  <span
                    className="material-symbols-outlined text-primary-container shrink-0"
                    style={{ fontSize: 20 }}
                  >
                    radio_button_checked
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">
              Requirements
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {task.requirements.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                >
                  <span
                    className="material-symbols-outlined text-emerald-600 shrink-0"
                    style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <p className="text-sm text-on-surface">{r}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">
              Deliverables
            </h3>
            <ol className="space-y-3 list-decimal list-inside">
              {task.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="text-sm text-on-surface-variant marker:text-primary-container marker:font-bold"
                >
                  {d}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">
              Evaluation criteria
            </h3>
            <div className="space-y-3">
              {task.evaluation.map((e) => (
                <div key={e.label}>
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-1">
                    <span>{e.label}</span>
                    <span>{e.weight}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${e.weight}%`,
                        background: "linear-gradient(135deg,#004AC6,#004AC6)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">Timeline</h3>
            <ol className="relative border-l border-outline-variant/40 ml-2 space-y-5">
              {task.timeline.map((t, i) => (
                <li key={i} className="ml-4">
                  <span
                    className={cn(
                      "absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 border-surface",
                      t.done ? "bg-primary-container" : "bg-surface-container",
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      t.done ? "text-on-surface" : "text-on-surface-variant",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="text-[11px] text-outline mt-0.5">{t.date}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-4">Resources</h3>
            <div className="space-y-2">
              {task.resources.map((r) => (
                <div
                  key={r.label}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 opacity-70"
                >
                  <span className="material-symbols-outlined text-primary-container">
                    {r.type === "doc" ? "description" : r.type === "video" ? "play_circle" : "link"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{r.label}</p>
                    <p className="text-[11px] text-outline uppercase tracking-wider">{r.type}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 18 }}>
                    open_in_new
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-headline font-extrabold text-lg text-on-surface mb-3">
              Submission
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              {completed
                ? "Great work! This trial is marked complete. The next trial is now unlocked."
                : "Upload your deliverables once every requirement is met. Reviewers respond within 48 hours."}
            </p>
            <Button
              type="button"
              variant="cta"
              size="lg"
              block
              onClick={onComplete}
              disabled={completed}
              className="py-3 rounded-xl"
            >
              {completed ? "Completed" : "Submit & Mark Complete"}
            </Button>
            <Button
              type="button"
              variant="ctaWhite"
              size="lg"
              block
              disabled={completed}
              className="py-3 rounded-xl mt-3"
              onClick={() => {
                localStorage.setItem(
                  `jobrio_trial_draft_${task.id}`,
                  JSON.stringify({ savedAt: new Date().toISOString(), taskId: task.id }),
                );
                setDraftSaved(true);
              }}
            >
              {draftSaved ? "Draft Saved" : "Save Draft"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const TRIAL_TASKS: Record<"trial-1" | "trial-2" | "trial-3", TrialTask> = {
  "trial-1": {
    id: "JB-TR-001",
    number: 1,
    title: "Landing Page Hero Section Redesign",
    category: "UI / UX Design",
    status: "in-progress",
    difficulty: "Easy",
    estimatedHours: 4,
    deadline: "May 15, 2026",
    reward: "₹60",
    brief:
      "Redesign the hero section of a SaaS landing page to improve clarity, visual hierarchy, and conversion. Demonstrate your ability to communicate value at a glance.",
    objectives: [
      "Communicate the product value proposition in under 5 seconds.",
      "Establish a clear visual hierarchy between headline, subhead, and CTA.",
      "Maintain brand consistency with provided color tokens.",
    ],
    requirements: [
      "Use the supplied brand palette and typography.",
      "Mobile-first responsive layout (≥360px).",
      "Single primary CTA, optional secondary action.",
      "Accessible contrast (WCAG AA).",
    ],
    deliverables: [
      "Figma file with desktop and mobile frames.",
      "Exported PNG previews at 2x.",
      "Short rationale (≤150 words) explaining your decisions.",
    ],
    evaluation: [
      { label: "Visual hierarchy", weight: 35 },
      { label: "Brand alignment", weight: 25 },
      { label: "Responsiveness", weight: 20 },
      { label: "Rationale clarity", weight: 20 },
    ],
    timeline: [
      { label: "Task assigned", date: "May 9, 2026", done: true },
      { label: "Brief reviewed", date: "May 10, 2026", done: true },
      { label: "Draft submitted", date: "May 12, 2026", done: false },
      { label: "Reviewer feedback", date: "May 14, 2026", done: false },
      { label: "Final approval", date: "May 15, 2026", done: false },
    ],
    resources: [
      { label: "Brand guidelines", type: "doc" },
      { label: "Reference layouts", type: "link" },
      { label: "Hero design walkthrough", type: "video" },
    ],
  },
  "trial-2": {
    id: "JB-TR-002",
    number: 2,
    title: "REST API for Order Tracking",
    category: "Backend Engineering",
    status: "not-started",
    difficulty: "Intermediate",
    estimatedHours: 8,
    deadline: "May 20, 2026",
    reward: "₹120",
    brief:
      "Design and implement a small REST API that powers the order-tracking widget on the client dashboard. Focus on clean contracts, validation, and error handling.",
    objectives: [
      "Expose endpoints to list, fetch, and update order status.",
      "Validate inputs with proper error responses.",
      "Document the API contract clearly for frontend consumers.",
    ],
    requirements: [
      "Use Node.js or Python with a typed schema validator.",
      "Idempotent PUT/PATCH operations.",
      "Pagination for list endpoint.",
      "OpenAPI 3.0 spec included.",
    ],
    deliverables: [
      "Source repository link with README.",
      "OpenAPI spec (YAML or JSON).",
      "Postman collection with sample requests.",
    ],
    evaluation: [
      { label: "API design", weight: 30 },
      { label: "Validation & errors", weight: 25 },
      { label: "Documentation", weight: 25 },
      { label: "Code quality", weight: 20 },
    ],
    timeline: [
      { label: "Task assigned", date: "May 10, 2026", done: true },
      { label: "Brief reviewed", date: "May 11, 2026", done: false },
      { label: "Implementation", date: "May 14, 2026", done: false },
      { label: "Submission", date: "May 18, 2026", done: false },
      { label: "Review & approval", date: "May 20, 2026", done: false },
    ],
    resources: [
      { label: "API style guide", type: "doc" },
      { label: "Sample data set", type: "link" },
      { label: "OpenAPI tutorial", type: "video" },
    ],
  },
  "trial-3": {
    id: "JB-TR-003",
    number: 3,
    title: "End-to-End Onboarding Flow",
    category: "Full-stack Build",
    status: "submitted",
    difficulty: "Advanced",
    estimatedHours: 14,
    deadline: "May 28, 2026",
    reward: "₹280",
    brief:
      "Ship a complete client onboarding flow — from signup through verified account — including frontend, backend, and persistence. This is the most representative trial of real Jobrio work.",
    objectives: [
      "Deliver a polished, accessible multi-step signup experience.",
      "Persist progress so users can resume where they left off.",
      "Handle email verification and basic identity checks.",
    ],
    requirements: [
      "TypeScript across frontend and backend.",
      "Form-level and field-level validation.",
      "Secure session handling with refresh.",
      "Unit tests for critical flows.",
    ],
    deliverables: [
      "Deployed preview URL.",
      "Source repository with setup instructions.",
      "Loom walkthrough (≤5 min) of the flow.",
    ],
    evaluation: [
      { label: "User experience", weight: 30 },
      { label: "Architecture", weight: 25 },
      { label: "Security & validation", weight: 25 },
      { label: "Test coverage", weight: 20 },
    ],
    timeline: [
      { label: "Task assigned", date: "May 5, 2026", done: true },
      { label: "Architecture plan", date: "May 6, 2026", done: true },
      { label: "Build complete", date: "May 9, 2026", done: true },
      { label: "Submitted for review", date: "May 10, 2026", done: true },
      { label: "Reviewer feedback", date: "May 12, 2026", done: false },
    ],
    resources: [
      { label: "Onboarding spec", type: "doc" },
      { label: "Design references", type: "link" },
      { label: "Architecture session", type: "video" },
    ],
  },
};
