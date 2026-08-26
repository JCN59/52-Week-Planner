"use client";

import type { Project } from "@/lib/video/types";
import { Badge, Button, Empty, Panel } from "./ui";

const LEVEL_TONE = { error: "rose", warn: "amber", info: "slate" } as const;

/**
 * Motion QA. Reads back the keyframes the composition actually contains and
 * reports what would look wrong on screen — then, on request, fixes what it can
 * and recomposes, which is the self-correcting loop.
 */
export default function MotionQA({
  project,
  onCheck,
  changes,
  busy,
}: {
  project: Project;
  onCheck: (opts: { autoCorrect?: boolean; useCli?: boolean }) => void;
  changes: string[];
  busy: boolean;
}) {
  const report = project.motionReport;
  const findings = report?.findings ?? [];
  const errors = findings.filter((f) => f.level === "error").length;
  const warns = findings.filter((f) => f.level === "warn").length;

  // Group keyframes by scene so the strip reads as a timeline, not a table.
  const byScene = new Map<string, NonNullable<typeof report>["tracks"]>();
  for (const track of report?.tracks ?? []) {
    const list = byScene.get(track.sceneId) ?? [];
    list.push(track);
    byScene.set(track.sceneId, list);
  }

  const span = report?.tracks.reduce(
    (max, t) => Math.max(max, ...t.keys.map((k) => k.t)),
    0.001,
  ) ?? 1;

  return (
    <Panel
      title="Motion QA"
      subtitle="What the camera actually does, checked against what reads on screen."
      right={
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onCheck({})} busy={busy}>
            Check motion
          </Button>
          <Button variant="primary" onClick={() => onCheck({ autoCorrect: true })} busy={busy}>
            Fix &amp; recheck
          </Button>
          <Button
            variant="ghost"
            onClick={() => onCheck({ useCli: true })}
            busy={busy}
            title="Also runs `npx hyperframes keyframes --json` if the CLI is installed"
          >
            + CLI
          </Button>
        </div>
      }
    >
      {!report && <Empty>Run a check to see the motion in this cut.</Empty>}

      {report && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone={errors ? "rose" : "emerald"}>
              {errors} error{errors === 1 ? "" : "s"}
            </Badge>
            <Badge tone={warns ? "amber" : "slate"}>
              {warns} warning{warns === 1 ? "" : "s"}
            </Badge>
            <Badge tone="slate">{report.tracks.length} keyframe tracks</Badge>
            {report.source === "hyperframes-cli" && <Badge tone="sky">hyperframes CLI</Badge>}
          </div>

          {changes.length > 0 && (
            <ul className="mb-3 space-y-1 rounded-lg border border-sky-400/30 bg-sky-500/5 p-3">
              {changes.map((c) => (
                <li key={c} className="text-[11px] leading-snug text-sky-200">
                  {c}
                </li>
              ))}
            </ul>
          )}

          {findings.length === 0 ? (
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
              Nothing to flag. Every move stays inside its overscan and every scene reads.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {findings.map((f, i) => (
                <li
                  key={`${f.message}-${i}`}
                  className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <Badge tone={LEVEL_TONE[f.level]}>{f.level}</Badge>
                    <div className="min-w-0">
                      <p className="text-xs leading-snug text-slate-200">{f.message}</p>
                      {f.fix && <p className="mt-0.5 text-[11px] text-slate-500">{f.fix}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {byScene.size > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Keyframes</p>
              {Array.from(byScene.entries()).map(([sceneId, tracks]) => (
                <div key={sceneId} className="rounded-lg border border-white/10 bg-slate-950/40 p-2.5">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {sceneId}
                  </p>
                  <div className="space-y-1">
                    {tracks.map((track, ti) => (
                      <div key={`${track.target}-${track.property}-${ti}`} className="flex items-center gap-2">
                        <span className="w-14 shrink-0 font-mono text-[10px] text-slate-500">
                          {track.property}
                        </span>
                        <div className="relative h-4 flex-1 rounded bg-white/5">
                          {track.keys.map((key, ki) => (
                            <span
                              key={ki}
                              title={`${key.t.toFixed(2)}s → ${key.value}`}
                              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400"
                              style={{ left: `${Math.min(100, (key.t / span) * 100)}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
