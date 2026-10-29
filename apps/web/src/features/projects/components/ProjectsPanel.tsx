import { useState } from "react";
import { ApiError } from "@/services/api";
import { useAddProject, useDeleteProject, useProjects } from "../hooks/useProjects";
import type { Project } from "../lib/types";

const FolderPlus = () => (
  <svg
    className="w-6 h-6 stroke-[2] text-neutral-900 dark:text-[#ececec] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 11h13.2a1.8 1.8 0 0 0 0-3.6h-4.8c-.7 0-1.4-.3-1.8-.9l-.6-.9A2 2 0 0 0 8.3 4.5H6.2A2.2 2.2 0 0 0 4 6.7V11z" />
    <path d="M4 11v6a3 3 0 0 0 3 3h4.8" />
    <path d="M17.2 14.2v5.6M14.4 17h5.6" />
  </svg>
);

/** "Project" card in the side drawer: add form + the user's projects. */
export function ProjectsPanel({ onSelect }: { onSelect: (p: Project) => void }) {
  const projects = useProjects();
  const add = useAddProject();
  const del = useDeleteProject();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Every project is a business/income space; "personal" is created by the first-run flow later.
    add.mutate(
      { name, kind: "business" },
      {
        onSuccess: (p) => {
          setName("");
          setFormOpen(false);
          onSelect(p);
        },
        onError: (err) => setError(err instanceof ApiError ? err.message : "Something went wrong."),
      },
    );
  };

  return (
    <div className="bg-white dark:bg-[#212121] rounded-2xl border border-neutral-200/80 dark:border-[#2f2f2f] shadow-sm overflow-hidden flex flex-col shrink-0">
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-[#2b2b2b] select-none">
        <div className="flex items-center gap-3.5">
          <FolderPlus />
          <div className="flex flex-col">
            <span className="text-[16px] sm:text-[16.5px] font-medium tracking-tight text-neutral-900 dark:text-[#ececec] leading-tight">
              Project
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label={formOpen ? "Close new project form" : "Add project"}
          title={formOpen ? "Close" : "Add new project"}
          onClick={() => {
            setFormOpen((v) => !v);
            setError(null);
          }}
          className="w-9 h-9 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer active:scale-95"
        >
          <div
            className="flex items-center justify-center text-neutral-900 dark:text-[#ececec] transform-gpu origin-center"
            style={{
              transform: `rotate(${formOpen ? 405 : 0}deg)`,
              transition: "transform 360ms cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
            }}
          >
            <svg
              className="w-6 h-6 stroke-[2]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </button>
      </div>

      {formOpen ? (
        <div className="overflow-hidden border-b border-neutral-100 dark:border-[#2b2b2b] bg-white dark:bg-[#212121] px-4 py-4 flex flex-col items-center">
          <form onSubmit={submit} className="w-full flex flex-col items-center">
            <div className="w-full relative mt-1 mb-2">
              <label
                htmlFor="drawerProjectNameInput"
                className={`absolute pointer-events-none transition-all duration-200 ease-out z-10 select-none px-1 bg-white dark:bg-[#212121] ${name ? "-top-2.5 left-4 text-xs font-semibold text-black dark:text-white" : "top-4 left-5 text-base text-gray-500"}`}
              >
                Project Name
              </label>
              <input
                id="drawerProjectNameInput"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full h-14 bg-white dark:bg-[#1a1a1a] rounded-[24px] px-5 text-gray-950 dark:text-white text-base font-normal focus:outline-none transition-all duration-200 border-2 border-neutral-300 focus:border-black dark:border-neutral-600 dark:focus:border-white"
              />
            </div>
            {error ? (
              <p role="alert" className="w-full px-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={add.isPending || name.trim().length < 2}
              className="w-56 h-12 py-3 bg-black dark:bg-white hover:bg-neutral-900 dark:hover:bg-neutral-100 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed active:scale-[0.98] rounded-full text-white dark:text-black font-bold text-sm shadow-sm transition-all text-center flex items-center justify-center mb-1 mt-2 cursor-pointer"
            >
              Add project
            </button>
          </form>
        </div>
      ) : null}

      {projects.data?.map((p) => (
        <div
          key={p.id}
          onClick={() => onSelect(p)}
          className={`px-4 py-3.5 cursor-pointer transition-all flex items-center justify-between border-b last:border-b-0 border-neutral-50 dark:border-[#2b2b2b] group active:scale-[0.98] select-none hover:bg-neutral-50/50 dark:hover:bg-[#282828] bg-white dark:bg-[#212121]`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[16px] sm:text-[16.5px] font-medium tracking-tight text-neutral-800 dark:text-[#ececec] group-hover:text-black dark:group-hover:text-white truncate">
              {p.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete “${p.name}”? Projects with entries can't be deleted.`))
                  del.mutate(p.id, {
                    onError: (err) =>
                      setError(err instanceof ApiError ? err.message : "Could not delete."),
                  });
              }}
              className="hidden sm:group-hover:flex p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <svg
              className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
