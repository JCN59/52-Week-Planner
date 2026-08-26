// Browser-side API client. Everything the Mission Control UI does goes through
// these, which are the same endpoints an agent would call.

import type { MotionReport, Project, ProjectSummary, TopicAngle, VideoSettings } from "./types";

export type Config = {
  workflows: {
    id: string;
    name: string;
    blurb: string;
    defaults: { durationSeconds: number; format: string; aspect: string; sceneCount: number };
    motionVocabulary: string[];
    accent: string;
    bg: string;
  }[];
  motions: { id: string; label: string; blurb: string }[];
  brollProviders: {
    id: string;
    label: string;
    blurb: string;
    requires: string[];
    models?: { id: string; label: string }[];
  }[];
  avatarProviders: { id: string; label: string; blurb: string; requires: string[] }[];
  availability: Record<string, boolean>;
  claude: { available: boolean; model: string };
};

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  config: () => call<Config>("/api/video/config"),

  radar: (niche: string, keywords: string[], count = 5) =>
    call<{ angles: TopicAngle[]; source: "ai" | "mock"; note?: string }>("/api/video/radar", {
      method: "POST",
      body: JSON.stringify({ niche, keywords, count }),
    }),

  listProjects: () => call<{ projects: ProjectSummary[] }>("/api/video/projects"),

  createProject: (input: { name: string; settings: VideoSettings; angle?: TopicAngle }) =>
    call<{ project: Project }>("/api/video/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getProject: (id: string) =>
    call<{ project: Project; commands: { render: string; preview: string } }>(
      `/api/video/projects/${id}`,
    ),

  patchProject: (id: string, patch: Record<string, unknown>) =>
    call<{ project: Project }>(`/api/video/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteProject: (id: string) =>
    call<{ deleted: string }>(`/api/video/projects/${id}`, { method: "DELETE" }),

  writeScript: (id: string) =>
    call<{ project: Project }>(`/api/video/projects/${id}/script`, { method: "POST" }),

  generateAssets: (id: string, force = false) =>
    call<{ project: Project }>(`/api/video/projects/${id}/assets`, {
      method: "POST",
      body: JSON.stringify({ force }),
    }),

  compose: (id: string) =>
    call<{ project: Project; command: string }>(`/api/video/projects/${id}/compose`, {
      method: "POST",
    }),

  qa: (id: string, opts: { autoCorrect?: boolean; useCli?: boolean } = {}) =>
    call<{ project: Project; report: MotionReport; changes: string[]; cli?: { available: boolean; command: string } }>(
      `/api/video/projects/${id}/qa`,
      { method: "POST", body: JSON.stringify(opts) },
    ),

  render: (id: string, opts: { fps?: number; quality?: string } = {}) =>
    call<{
      ok: boolean;
      command: string;
      stdout?: string;
      stderr?: string;
      hint?: string;
      project?: Project;
    }>(`/api/video/projects/${id}/render`, { method: "POST", body: JSON.stringify(opts) }),
};

export const previewUrl = (id: string, cacheKey: string) =>
  `/api/video/projects/${id}/preview?v=${encodeURIComponent(cacheKey)}`;

export const assetUrl = (id: string, file: string) => `/api/video/projects/${id}/${file}`;

export const outputUrl = (id: string) => `/api/video/projects/${id}/output`;
