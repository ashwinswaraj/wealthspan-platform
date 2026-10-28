export interface Project {
  id: string;
  name: string;
  kind: "personal" | "business";
  archivedAt: string | null;
}

export interface NewProject {
  name: string;
  kind: Project["kind"];
}
