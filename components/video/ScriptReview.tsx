"use client";

import { useEffect, useState } from "react";
import type { Config } from "@/lib/video/client";
import type { Project, Scene } from "@/lib/video/types";
import { Badge, Button, Empty, Field, Panel, Select, TextArea, TextInput } from "./ui";

/**
 * The human-in-the-loop gate. The script is fully editable here — including the
 * per-scene camera move and how far it travels — and nothing downstream runs
 * until it is approved.
 */
export default function ScriptReview({
  project,
  config,
  onWrite,
  onSaveScenes,
  onApprove,
  busy,
}: {
  project: Project;
  config: Config;
  onWrite: () => void;
  onSaveScenes: (scenes: Scene[], title?: string) => void;
  onApprove: (approved: boolean) => void;
  busy: boolean;
}) {
  const script = project.script;
  const [draft, setDraft] = useState<Scene[]>(script?.scenes ?? []);
  const [title, setTitle] = useState(script?.title ?? "");

  useEffect(() => {
    setDraft(script?.scenes ?? []);
    setTitle(script?.title ?? "");
  }, [script]);

  if (!script) {
    return (
      <Panel title="Script" subtitle="Research, then a script cut to picture.">
        <Empty>Nothing written yet.</Empty>
        <div className="mt-3 flex justify-end">
          <Button variant="primary" onClick={onWrite} busy={busy}>
            Write the script
          </Button>
        </div>
      </Panel>
    );
  }

  const dirty =
    title !== script.title || JSON.stringify(draft) !== JSON.stringify(script.scenes);
  const total = Math.round(draft.reduce((a, s) => a + s.durationSeconds, 0) * 10) / 10;

  const patch = (index: number, patchValue: Partial<Scene>) =>
    setDraft((prev) => prev.map((s, i) => (i === index ? { ...s, ...patchValue } : s)));

  return (
    <Panel
      title="Script"
      subtitle={`${draft.length} scenes · ${total}s against a ${project.settings.durationSeconds}s target`}
      right={
        <div className="flex items-center gap-2">
          <Badge tone={script.source === "ai" ? "sky" : "amber"}>
            {script.source === "ai" ? "written by Claude" : "offline template"}
          </Badge>
          {project.scriptApproved && <Badge tone="emerald">approved</Badge>}
        </div>
      }
    >
      <Field label="Title">
        <TextInput value={title} onChange={setTitle} />
      </Field>

      <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-xs italic text-slate-300">
        {script.hook}
      </p>

      <div className="mt-4 space-y-3">
        {draft.map((scene, i) => (
          <div key={scene.id} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                {String(i + 1).padStart(2, "0")} · {scene.label}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={120}
                  step={0.5}
                  value={scene.durationSeconds}
                  onChange={(e) => patch(i, { durationSeconds: Number(e.target.value) })}
                  className="w-16 rounded border border-white/10 bg-slate-950/60 px-2 py-1 text-right font-mono text-[11px] text-slate-200 outline-none focus:border-sky-400/60"
                />
                <span className="text-[11px] text-slate-500">sec</span>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Narration">
                <TextArea
                  value={scene.narration}
                  onChange={(v) => patch(i, { narration: v })}
                  rows={3}
                />
              </Field>
              <Field label="On-screen text">
                <TextArea
                  value={scene.onScreenText}
                  onChange={(v) => patch(i, { onScreenText: v })}
                  rows={3}
                />
              </Field>
              <Field label="B-roll prompt">
                <TextArea
                  value={scene.brollPrompt}
                  onChange={(v) => patch(i, { brollPrompt: v })}
                  rows={3}
                />
              </Field>
              <div className="space-y-3">
                <Field
                  label="Camera move"
                  hint={config.motions.find((m) => m.id === scene.motion)?.blurb}
                >
                  <Select
                    value={scene.motion}
                    onChange={(v) => patch(i, { motion: v as Scene["motion"] })}
                    options={config.motions.map((m) => ({ value: m.id, label: m.label }))}
                  />
                </Field>
                <Field label={`Travel · ${scene.motionIntensity.toFixed(2)}×`}>
                  <input
                    type="range"
                    min={0.2}
                    max={2}
                    step={0.05}
                    value={scene.motionIntensity}
                    onChange={(e) => patch(i, { motionIntensity: Number(e.target.value) })}
                    className="h-1 w-full cursor-pointer appearance-none rounded bg-white/15 accent-sky-400"
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
        <Button variant="ghost" onClick={onWrite} busy={busy} title="Discards assets and starts over">
          Rewrite from scratch
        </Button>
        <Button onClick={() => onSaveScenes(draft, title)} disabled={!dirty} busy={busy}>
          {dirty ? "Save edits" : "Saved"}
        </Button>
        <Button
          variant={project.scriptApproved ? "default" : "primary"}
          onClick={() => onApprove(!project.scriptApproved)}
          disabled={dirty}
          title={dirty ? "Save your edits first" : undefined}
        >
          {project.scriptApproved ? "Withdraw approval" : "Approve script"}
        </Button>
      </div>
    </Panel>
  );
}
