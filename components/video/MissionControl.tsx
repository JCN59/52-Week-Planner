"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Config } from "@/lib/video/client";
import type { Project, ProjectSummary, Scene, TopicAngle, VideoSettings } from "@/lib/video/types";
import AssetGrid from "./AssetGrid";
import BriefPanel from "./BriefPanel";
import MotionQA from "./MotionQA";
import PreviewStage from "./PreviewStage";
import RenderPanel from "./RenderPanel";
import ScriptReview from "./ScriptReview";
import TopicRadar from "./TopicRadar";
import Workspace from "./Workspace";
import { Badge, Panel } from "./ui";

const DEFAULT_SETTINGS: VideoSettings = {
  workflow: "explainer",
  durationSeconds: 60,
  format: "avatar",
  aspect: "16:9",
  brollProvider: "placeholder",
  avatarProvider: "placeholder",
};

const STEPS = [
  { id: "script", label: "Script" },
  { id: "assets", label: "Footage" },
  { id: "preview", label: "Preview" },
  { id: "motion", label: "Motion" },
  { id: "render", label: "Render" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function MissionControl() {
  const [config, setConfig] = useState<Config | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [commands, setCommands] = useState({ render: "", preview: "" });

  const [angle, setAngle] = useState<TopicAngle | undefined>();
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_SETTINGS);

  const [step, setStep] = useState<StepId>("script");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qaChanges, setQaChanges] = useState<string[]>([]);

  const refreshProjects = useCallback(async () => {
    const { projects: list } = await api.listProjects();
    setProjects(list);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setConfig(await api.config());
        await refreshProjects();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [refreshProjects]);

  /** Every mutating action funnels through here so busy/error handling is uniform. */
  const run = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      setBusy(key);
      setError(null);
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const openProject = useCallback(
    (id: string) =>
      run(`open:${id}`, async () => {
        const { project: loaded, commands: cmds } = await api.getProject(id);
        setProject(loaded);
        setCommands(cmds);
        setAngle(loaded.angle);
        setName(loaded.name);
        setSettings(loaded.settings);
        setQaChanges([]);
        setStep(
          loaded.stage === "brief"
            ? "script"
            : loaded.stage === "assets"
              ? "assets"
              : loaded.stage === "compose"
                ? "preview"
                : loaded.stage === "render"
                  ? "render"
                  : "script",
        );
      }),
    [run],
  );

  const newProject = useCallback(() => {
    setProject(null);
    setAngle(undefined);
    setName("");
    setSettings(DEFAULT_SETTINGS);
    setQaChanges([]);
    setError(null);
  }, []);

  const applyProject = useCallback(
    async (next: Project) => {
      setProject(next);
      await refreshProjects();
    },
    [refreshProjects],
  );

  const done = useMemo(() => {
    if (!project) return new Set<StepId>();
    const set = new Set<StepId>();
    if (project.script) set.add("script");
    if (project.assets.length > 0) set.add("assets");
    if (project.composed) {
      set.add("preview");
      if (project.motionReport) set.add("motion");
    }
    if (project.renderedFile) set.add("render");
    return set;
  }, [project]);

  if (!config) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-xs text-slate-400">
        {error ?? "Loading…"}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-4">
        {error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        {!project ? (
          <>
            <TopicRadar
              selected={angle}
              claudeAvailable={config.claude.available}
              onPick={(picked) => {
                setAngle(picked);
                if (!name.trim()) setName(picked.title);
              }}
            />
            <BriefPanel
              key="brief-new"
              config={config}
              settings={settings}
              onChange={setSettings}
              angle={angle}
              name={name}
              onName={setName}
              busy={busy === "create"}
              locked={!name.trim()}
              onCreate={() =>
                run("create", async () => {
                  const { project: created } = await api.createProject({
                    name: name.trim() || angle?.title || "Untitled video",
                    settings,
                    angle,
                  });
                  await applyProject(created);
                  setCommands({ render: "", preview: "" });
                  setStep("script");
                  const { commands: cmds } = await api.getProject(created.id);
                  setCommands(cmds);
                })
              }
            />
          </>
        ) : (
          <>
            <nav className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    step === s.id
                      ? "bg-sky-500 text-slate-950"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] ${
                      step === s.id ? "text-slate-950/60" : "text-slate-500"
                    }`}
                  >
                    {done.has(s.id) ? "✓" : i + 1}
                  </span>
                  {s.label}
                </button>
              ))}
            </nav>

            {/* Keyed by project so the collapse state resets per project, and so
                React does not reuse the unkeyed instance from the new-project
                branch (which would keep it expanded). */}
            <BriefPanel
              key={`brief-${project.id}`}
              collapsible
              config={config}
              settings={project.settings}
              angle={project.angle}
              name={project.name}
              onName={(value) => setProject({ ...project, name: value })}
              onChange={(next) =>
                run("settings", async () => {
                  const { project: saved } = await api.patchProject(project.id, {
                    settings: next,
                    name: project.name,
                  });
                  await applyProject(saved);
                  setSettings(saved.settings);
                })
              }
            />

            {step === "script" && (
              <ScriptReview
                project={project}
                config={config}
                busy={busy === "script" || busy === "scenes"}
                onWrite={() =>
                  run("script", async () => {
                    const { project: saved } = await api.writeScript(project.id);
                    await applyProject(saved);
                  })
                }
                onSaveScenes={(scenes: Scene[], title?: string) =>
                  run("scenes", async () => {
                    const { project: saved } = await api.patchProject(project.id, { scenes, title });
                    await applyProject(saved);
                  })
                }
                onApprove={(approved) =>
                  run("approve", async () => {
                    const { project: saved } = await api.patchProject(project.id, {
                      scriptApproved: approved,
                    });
                    await applyProject(saved);
                    if (approved) setStep("assets");
                  })
                }
              />
            )}

            {step === "assets" && (
              <AssetGrid
                project={project}
                busy={busy === "assets"}
                onGenerate={(force) =>
                  run("assets", async () => {
                    const { project: saved } = await api.generateAssets(project.id, force);
                    await applyProject(saved);
                  })
                }
              />
            )}

            {step === "preview" && (
              <PreviewStage
                project={project}
                busy={busy === "compose"}
                onCompose={() =>
                  run("compose", async () => {
                    const { project: saved, command } = await api.compose(project.id);
                    await applyProject(saved);
                    setCommands((c) => ({ ...c, render: command }));
                  })
                }
              />
            )}

            {step === "motion" && (
              <MotionQA
                project={project}
                changes={qaChanges}
                busy={busy === "qa"}
                onCheck={(opts) =>
                  run("qa", async () => {
                    const result = await api.qa(project.id, opts);
                    await applyProject(result.project);
                    setQaChanges(result.changes ?? []);
                  })
                }
              />
            )}

            {step === "render" && (
              <RenderPanel
                project={project}
                command={commands.render}
                onProject={(next) => void applyProject(next)}
              />
            )}
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4">
        <Workspace
          projects={projects}
          currentId={project?.id}
          onOpen={openProject}
          onNew={newProject}
          onDelete={(id) =>
            run(`delete:${id}`, async () => {
              await api.deleteProject(id);
              if (project?.id === id) newProject();
              await refreshProjects();
            })
          }
        />

        {project && (
          <Panel title="Activity" subtitle="What the pipeline has done to this project.">
            <ul className="space-y-1.5">
              {[...project.log].reverse().slice(0, 12).map((entry, i) => (
                <li key={`${entry.at}-${i}`} className="flex gap-2">
                  <Badge tone="slate">{entry.stage}</Badge>
                  <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-400">
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </aside>
    </div>
  );
}
