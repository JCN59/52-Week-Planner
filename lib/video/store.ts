// ---- Project store (server only) ----
//
// One directory per project, laid out exactly the way the HyperFrames CLI wants
// it, so `npx hyperframes render .data/video-projects/<id>` works with no export
// step:
//
//   <project>/project.json   pipeline state
//   <project>/index.html     the composition
//   <project>/assets/…       B-roll, avatar, voice-over
//
// Set VIDEO_DATA_DIR to move the whole store somewhere else.

import { promises as fs } from "fs";
import path from "path";
import type { LogEntry, Project, ProjectSummary } from "./types";

export const STORE_ROOT =
  process.env.VIDEO_DATA_DIR ?? path.join(process.cwd(), ".data", "video-projects");

const ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;

export function newProjectId(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 36) || "video";
  const stamp = Date.now().toString(36).slice(-5);
  return `${base}-${stamp}`;
}

/** Throws on anything that could escape the store. */
export function projectDir(id: string): string {
  if (!ID_RE.test(id)) throw new Error(`Invalid project id: ${id}`);
  return path.join(STORE_ROOT, id);
}

export function assetsDir(id: string): string {
  return path.join(projectDir(id), "assets");
}

/** Resolve a project-relative path, refusing anything outside the project. */
export function resolveInProject(id: string, relative: string): string {
  const dir = projectDir(id);
  const full = path.resolve(dir, relative);
  const rel = path.relative(dir, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes project: ${relative}`);
  }
  return full;
}

export async function ensureProjectDirs(id: string): Promise<void> {
  await fs.mkdir(assetsDir(id), { recursive: true });
}

export async function readProject(id: string): Promise<Project | null> {
  try {
    const raw = await fs.readFile(path.join(projectDir(id), "project.json"), "utf8");
    return JSON.parse(raw) as Project;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeProject(project: Project): Promise<Project> {
  await ensureProjectDirs(project.id);
  const next: Project = { ...project, updatedAt: new Date().toISOString() };
  await fs.writeFile(
    path.join(projectDir(project.id), "project.json"),
    JSON.stringify(next, null, 2),
    "utf8",
  );
  return next;
}

export async function deleteProject(id: string): Promise<void> {
  await fs.rm(projectDir(id), { recursive: true, force: true });
}

export async function listProjects(): Promise<ProjectSummary[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(STORE_ROOT);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const projects: ProjectSummary[] = [];
  for (const id of entries) {
    if (!ID_RE.test(id)) continue;
    const project = await readProject(id).catch(() => null);
    if (!project) continue;
    projects.push({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      stage: project.stage,
      workflow: project.settings.workflow,
      aspect: project.settings.aspect,
      durationSeconds: project.settings.durationSeconds,
      sceneCount: project.script?.scenes.length ?? 0,
      composed: project.composed,
      title: project.script?.title,
    });
  }
  projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return projects;
}

export function logged(project: Project, entry: Omit<LogEntry, "at">): Project {
  const log = [...project.log, { ...entry, at: new Date().toISOString() }];
  return { ...project, log: log.slice(-80) };
}

export async function writeAsset(
  id: string,
  filename: string,
  data: Buffer | string,
): Promise<string> {
  await ensureProjectDirs(id);
  const full = resolveInProject(id, path.join("assets", filename));
  await fs.writeFile(full, data);
  return path.posix.join("assets", filename);
}

export async function writeComposition(id: string, html: string): Promise<void> {
  await ensureProjectDirs(id);
  await fs.writeFile(resolveInProject(id, "index.html"), html, "utf8");
}

export async function readComposition(id: string): Promise<string | null> {
  try {
    return await fs.readFile(resolveInProject(id, "index.html"), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
