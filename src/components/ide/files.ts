import { projects } from "@/content/projects";
import { personalProjects } from "@/content/personal-projects";

export type FileKind = "md" | "ts" | "json" | "log" | "folder" | "ext" | "welcome" | "settings" | "task";

export interface IdeChild {
  id: string;
  name: string;
  kind: FileKind;
}

export interface IdeFile {
  /** Section id — also the anchor target */
  id: string;
  name: string;
  kind: FileKind;
  /** Path shown in the breadcrumbs */
  path: string[];
  /** Language shown in the status bar */
  language: string;
  children?: IdeChild[];
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const files: IdeFile[] = [
  { id: "top", name: "Welcome", kind: "welcome", path: ["portfolio", "Welcome"], language: "Welcome" },
  { id: "about", name: "Settings", kind: "settings", path: ["portfolio", "Settings", "About"], language: "Settings" },
  { id: "experience", name: "experience.log", kind: "log", path: ["portfolio", "experience.log"], language: "Git Log" },
  {
    id: "work",
    name: "war-stories",
    kind: "folder",
    path: ["portfolio", "war-stories"],
    language: "Markdown",
    children: projects.map((p) => ({ id: `work-${slugify(p.title)}`, name: `${slugify(p.title)}.md`, kind: "md" as const })),
  },
  {
    id: "projects",
    name: "projects",
    kind: "folder",
    path: ["portfolio", "projects"],
    language: "TypeScript",
    children: personalProjects.map((p) => ({ id: `project-${slugify(p.title)}`, name: slugify(p.title), kind: "ts" as const })),
  },
  { id: "automation", name: "automation", kind: "task", path: ["portfolio", "automation", "tasks.json"], language: "Tasks" },
  { id: "contact", name: "contact.json", kind: "json", path: ["portfolio", "contact.json"], language: "JSON" },
];
