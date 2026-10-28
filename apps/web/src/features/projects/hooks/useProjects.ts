import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { NewProject, Project } from "../lib/types";

const KEY = ["projects"] as const;

export const useProjects = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => api<{ items: Project[] }>("finance", "/projects").then((r) => r.items),
  });

export const useAddProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: NewProject) =>
      api<Project>("finance", "/projects", { method: "POST", body: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useRenameProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; name: string }) =>
      api<Project>("finance", `/projects/${v.id}`, { method: "PATCH", body: { name: v.name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ deleted: true }>("finance", `/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
