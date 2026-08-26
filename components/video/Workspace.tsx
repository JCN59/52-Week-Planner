"use client";

import type { ProjectSummary } from "@/lib/video/types";
import { Badge, Button, Empty, Panel } from "./ui";

const STAGE_TONE = {
  brief: "slate",
  script: "sky",
  assets: "sky",
  compose: "emerald",
  render: "emerald",
} as const;

/** Everything made previously, newest first. */
export default function Workspace({
  projects,
  currentId,
  onOpen,
  onDelete,
  onNew,
}: {
  projects: ProjectSummary[];
  currentId?: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <Panel
      title="Workspace"
      subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
      right={
        <Button variant="ghost" onClick={onNew}>
          New
        </Button>
      }
    >
      {projects.length === 0 && <Empty>Nothing here yet.</Empty>}
      <ul className="space-y-1.5">
        {projects.map((p) => (
          <li key={p.id}>
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                p.id === currentId
                  ? "border-sky-400/60 bg-sky-500/10"
                  : "border-white/10 bg-slate-950/40 hover:border-white/25"
              }`}
            >
              <button onClick={() => onOpen(p.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-medium text-slate-100">{p.title ?? p.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  <span>{p.workflow}</span>
                  <span>·</span>
                  <span>{p.aspect}</span>
                  <span>·</span>
                  <span>{p.durationSeconds}s</span>
                  {p.sceneCount > 0 && (
                    <>
                      <span>·</span>
                      <span>{p.sceneCount} scenes</span>
                    </>
                  )}
                </p>
              </button>
              <Badge tone={STAGE_TONE[p.stage]}>{p.stage}</Badge>
              <Button
                variant="danger"
                onClick={() => onDelete(p.id)}
                title="Delete this project and its assets"
              >
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
