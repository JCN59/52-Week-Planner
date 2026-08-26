"use client";

import { useState } from "react";
import type { Config } from "@/lib/video/client";
import type { TopicAngle, VideoSettings } from "@/lib/video/types";
import { Badge, Button, Field, Panel, Select, TextInput } from "./ui";

const FORMAT_LABELS: Record<string, string> = {
  avatar: "AI presenter on screen",
  "audio-only": "Voice-over, no presenter",
  faceless: "Faceless — text carries it",
};

/** The brief: workflow, runtime, format, and who generates the pixels. */
export default function BriefPanel({
  config,
  settings,
  onChange,
  angle,
  name,
  onName,
  onCreate,
  busy,
  locked,
  collapsible,
}: {
  config: Config;
  settings: VideoSettings;
  onChange: (next: VideoSettings) => void;
  angle?: TopicAngle;
  name: string;
  onName: (name: string) => void;
  onCreate?: () => void;
  busy?: boolean;
  locked?: boolean;
  /** Once a project exists the brief is reference material, so it folds away. */
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  const workflow = config.workflows.find((w) => w.id === settings.workflow) ?? config.workflows[0];
  const brollProvider = config.brollProviders.find((p) => p.id === settings.brollProvider);
  const set = (patch: Partial<VideoSettings>) => onChange({ ...settings, ...patch });

  return (
    <Panel
      title="Brief"
      subtitle={angle ? `Angle: ${angle.angle}` : "Pick an angle above, or write your own title."}
      right={
        onCreate ? (
          <Badge tone="slate">not saved yet</Badge>
        ) : collapsible ? (
          <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide" : `${workflow?.name} · ${settings.aspect} · ${settings.durationSeconds}s`}
          </Button>
        ) : undefined
      }
    >
      {!open ? null : (
      <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title">
            <TextInput value={name} onChange={onName} placeholder="What is this video called?" />
          </Field>
        </div>

        <Field label="Workflow" hint={workflow?.blurb}>
          <Select
            value={settings.workflow}
            onChange={(id) => {
              const wf = config.workflows.find((w) => w.id === id);
              if (!wf) return;
              set({
                workflow: id as VideoSettings["workflow"],
                durationSeconds: wf.defaults.durationSeconds,
                format: wf.defaults.format as VideoSettings["format"],
                aspect: wf.defaults.aspect as VideoSettings["aspect"],
              });
            }}
            options={config.workflows.map((w) => ({ value: w.id, label: w.name }))}
          />
        </Field>

        <Field label="Runtime" hint={`About ${workflow?.defaults.sceneCount ?? 4} scenes.`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={15}
              max={180}
              step={5}
              value={settings.durationSeconds}
              onChange={(e) => set({ durationSeconds: Number(e.target.value) })}
              className="h-1 w-full cursor-pointer appearance-none rounded bg-white/15 accent-sky-400"
            />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-300">
              {settings.durationSeconds}s
            </span>
          </div>
        </Field>

        <Field label="Format">
          <Select
            value={settings.format}
            onChange={(v) => set({ format: v as VideoSettings["format"] })}
            options={Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Field>

        <Field label="Aspect">
          <Select
            value={settings.aspect}
            onChange={(v) => set({ aspect: v as VideoSettings["aspect"] })}
            options={[
              { value: "16:9", label: "16:9 — landscape (1920×1080)" },
              { value: "9:16", label: "9:16 — vertical (1080×1920)" },
              { value: "1:1", label: "1:1 — square (1080×1080)" },
            ]}
          />
        </Field>

        <Field
          label="B-roll"
          hint={
            brollProvider?.requires.length && !config.availability[settings.brollProvider]
              ? `Needs ${brollProvider.requires.join(", ")} — falls back to placeholders without it.`
              : brollProvider?.blurb
          }
        >
          <Select
            value={settings.brollProvider}
            onChange={(v) => set({ brollProvider: v as VideoSettings["brollProvider"] })}
            options={config.brollProviders.map((p) => ({
              value: p.id,
              label: config.availability[p.id] ? p.label : `${p.label} (no key)`,
            }))}
          />
        </Field>

        {brollProvider?.models && settings.brollProvider !== "placeholder" && (
          <Field label="B-roll model" hint="Any fal video model id works here.">
            <Select
              value={settings.brollModel ?? brollProvider.models[0].id}
              onChange={(v) => set({ brollModel: v })}
              options={brollProvider.models.map((m) => ({ value: m.id, label: m.label }))}
            />
          </Field>
        )}

        {settings.format === "avatar" && (
          <Field
            label="Presenter"
            hint={
              config.availability[settings.avatarProvider]
                ? undefined
                : "Needs HEYGEN_API_KEY, HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID."
            }
          >
            <Select
              value={settings.avatarProvider}
              onChange={(v) => set({ avatarProvider: v as VideoSettings["avatarProvider"] })}
              options={config.avatarProviders.map((p) => ({
                value: p.id,
                label: config.availability[p.id] ? p.label : `${p.label} (no key)`,
              }))}
            />
          </Field>
        )}
      </div>

      {onCreate && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="primary" onClick={onCreate} busy={busy} disabled={locked}>
            Create project
          </Button>
        </div>
      )}
      </>
      )}
    </Panel>
  );
}
