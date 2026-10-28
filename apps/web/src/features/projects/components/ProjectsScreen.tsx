import { useState } from "react";
import { Briefcase, FolderPlus, Home, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  SkeletonCard,
} from "@jobrio/ui/design-system";
import { ApiError } from "@/services/api";
import {
  useAddProject,
  useDeleteProject,
  useProjects,
  useRenameProject,
} from "../hooks/useProjects";
import type { Project } from "../lib/types";

const KIND_LABEL: Record<Project["kind"], string> = { personal: "Personal", business: "Business" };

/**
 * Projects = one "money space" each (Personal, or one per business / income source).
 * The 5 sections (Income, Expense, Debt, Savings, Festivals) open from a project (slice 2).
 */
export function ProjectsScreen({ onOpen }: { onOpen?: (p: Project) => void }) {
  const projects = useProjects();
  const add = useAddProject();
  const rename = useRenameProject();
  const del = useDeleteProject();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Project["kind"]>("business");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fail = (e: unknown) =>
    setError(e instanceof ApiError ? e.message : "Something went wrong.");

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    add.mutate({ name, kind }, { onSuccess: () => setName(""), onError: fail });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wealthspan"
        title="Projects"
        description="One project for each business or income source. Personal money gets its own."
      />

      <Card>
        <form onSubmit={submit} className="space-y-3">
          <label
            className="text-[10px] font-bold uppercase tracking-wider text-outline"
            htmlFor="project-name"
          >
            Project name
          </label>
          <Input
            id="project-name"
            value={name}
            maxLength={60}
            placeholder="e.g. Shop, Salary — ABC Ltd, Home"
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2">
            {(["business", "personal"] as const).map((k) => (
              <Button
                key={k}
                variant={kind === k ? "primary" : "outline"}
                onClick={() => setKind(k)}
              >
                {KIND_LABEL[k]}
              </Button>
            ))}
          </div>
          {error ? (
            <p role="alert" className="text-xs text-error">
              {error}
            </p>
          ) : null}
          <Button type="submit" block disabled={add.isPending || name.trim().length < 2}>
            <FolderPlus className="w-4 h-4 mr-2" /> Add project
          </Button>
        </form>
      </Card>

      {projects.isLoading ? <SkeletonCard /> : null}
      {projects.isError ? (
        <ErrorState title="Couldn't load projects" onRetry={() => projects.refetch()} />
      ) : null}
      {projects.data && projects.data.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Add your first project above to start tracking."
        />
      ) : null}

      <ul className="space-y-3">
        {projects.data?.map((p) => (
          <li key={p.id}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  {p.kind === "personal" ? (
                    <Home className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </span>
                {editing?.id === p.id ? (
                  <form
                    className="flex-1 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      rename.mutate(
                        { id: p.id, name: editing.name },
                        { onSuccess: () => setEditing(null), onError: fail },
                      );
                    }}
                  >
                    <Input
                      autoFocus
                      value={editing.name}
                      onChange={(e) => setEditing({ id: p.id, name: e.target.value })}
                    />
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 text-left min-w-0"
                      onClick={() => onOpen?.(p)}
                    >
                      <p className="font-bold text-on-surface truncate">{p.name}</p>
                      <p className="text-xs text-on-surface-variant">{KIND_LABEL[p.kind]}</p>
                    </button>
                    <Button
                      variant="ghost"
                      aria-label={`Rename ${p.name}`}
                      onClick={() => setEditing({ id: p.id, name: p.name })}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => setConfirmId(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              {confirmId === p.id ? (
                <div className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm">
                  <p className="text-on-surface-variant">
                    Delete “{p.name}”? You can't delete a project that still has entries — remove
                    those first.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={() =>
                        del.mutate(p.id, {
                          onSuccess: () => setConfirmId(null),
                          onError: (e) => {
                            fail(e);
                            setConfirmId(null);
                          },
                        })
                      }
                    >
                      Delete
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
