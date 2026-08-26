// ---- Pipeline stages (server only) ----
//
// Each stage takes a project, does one thing, and writes the project back. The
// HTTP routes are thin wrappers over these, which is what lets an agent drive
// the same pipeline the UI drives.

import { composeProject } from "./compose";
import { askJson, hasClaude } from "./claude";
import { mockAngles, mockScript } from "./mock";
import { generateAvatar, generateBroll } from "./providers";
import {
  RADAR_SCHEMA,
  RADAR_SYSTEM,
  SCRIPT_SCHEMA,
  SCRIPT_SYSTEM,
  buildRadarPrompt,
  buildScriptPrompt,
} from "./prompts";
import { analyseProject } from "./qa";
import { logged, newProjectId, writeAsset, writeComposition, writeProject } from "./store";
import type {
  Asset,
  MotionPreset,
  Project,
  Scene,
  Script,
  TopicAngle,
  VideoSettings,
} from "./types";
import { MOTION_ORDER } from "./motion";
import { frameFor, getWorkflow } from "./workflows";

// ---------- radar ----------

export async function runRadar(
  niche: string,
  keywords: string[],
  count = 5,
): Promise<{ angles: TopicAngle[]; source: "ai" | "mock"; note?: string }> {
  if (!hasClaude()) {
    return { angles: mockAngles(niche, count), source: "mock", note: "ANTHROPIC_API_KEY is not set." };
  }

  const result = await askJson<{ angles: Omit<TopicAngle, "id">[] }>({
    system: RADAR_SYSTEM,
    user: buildRadarPrompt(niche, keywords, count),
    schema: RADAR_SCHEMA,
    maxTokens: 6000,
  });

  if (!result.ok) {
    return { angles: mockAngles(niche, count), source: "mock", note: result.reason };
  }

  const angles = result.value.angles.slice(0, count).map((a, i) => ({
    ...a,
    id: `angle-${i + 1}`,
    heat: Math.max(0, Math.min(100, Math.round(a.heat))),
    keywords: Array.isArray(a.keywords) ? a.keywords : [],
  }));

  return { angles, source: "ai" };
}

// ---------- project creation ----------

export function draftProject(args: {
  name: string;
  settings: VideoSettings;
  angle?: TopicAngle;
}): Project {
  const now = new Date().toISOString();
  return {
    id: newProjectId(args.name),
    name: args.name,
    createdAt: now,
    updatedAt: now,
    stage: "brief",
    settings: args.settings,
    angle: args.angle,
    scriptApproved: false,
    assets: [],
    composed: false,
    log: [{ at: now, stage: "brief", message: `Project created from the ${args.settings.workflow} workflow.` }],
  };
}

// ---------- script ----------

function normaliseMotion(value: string, fallback: MotionPreset): MotionPreset {
  return (MOTION_ORDER as string[]).includes(value) ? (value as MotionPreset) : fallback;
}

/**
 * Scale scene durations so they hit the target runtime. The model gets the
 * relative pacing right far more often than the absolute arithmetic.
 */
function fitToTarget(scenes: Scene[], target: number): Scene[] {
  const sum = scenes.reduce((acc, s) => acc + Math.max(s.durationSeconds, 0.5), 0);
  if (sum <= 0) return scenes;
  const factor = target / sum;
  // Leave it alone if the model was already close — rescaling costs precision.
  if (Math.abs(factor - 1) < 0.08) return scenes;
  return scenes.map((s) => ({
    ...s,
    durationSeconds: Math.max(1.5, Math.round(s.durationSeconds * factor * 10) / 10),
  }));
}

export async function runScript(project: Project): Promise<Project> {
  const angle = project.angle;
  if (!angle) throw new Error("Pick a topic angle before writing the script");

  const workflow = getWorkflow(project.settings.workflow);
  let script: Script;
  let note: string | undefined;

  const result = hasClaude()
    ? await askJson<{
        title: string;
        hook: string;
        cta: string;
        scenes: {
          label: string;
          narration: string;
          onScreenText: string;
          brollPrompt: string;
          motion: string;
          durationSeconds: number;
        }[];
      }>({
        system: SCRIPT_SYSTEM,
        user: buildScriptPrompt(angle, project.settings),
        schema: SCRIPT_SCHEMA,
        maxTokens: 10000,
      })
    : ({ ok: false, reason: "ANTHROPIC_API_KEY is not set" } as const);

  if (result.ok && result.value.scenes?.length) {
    const scenes: Scene[] = result.value.scenes.map((s, i) => ({
      id: `scene-${i + 1}`,
      index: i,
      label: s.label,
      narration: s.narration,
      onScreenText: s.onScreenText,
      brollPrompt: s.brollPrompt,
      motion: normaliseMotion(
        s.motion,
        workflow.motionVocabulary[i % workflow.motionVocabulary.length],
      ),
      motionIntensity: 1,
      durationSeconds: Math.max(1.5, Number(s.durationSeconds) || 5),
    }));
    const fitted = fitToTarget(scenes, project.settings.durationSeconds);
    script = {
      title: result.value.title,
      hook: result.value.hook,
      cta: result.value.cta,
      scenes: fitted,
      totalSeconds: Math.round(fitted.reduce((a, s) => a + s.durationSeconds, 0) * 10) / 10,
      source: "ai",
      generatedAt: new Date().toISOString(),
    };
  } else {
    note = result.ok ? "The model returned no scenes." : result.reason;
    script = mockScript(angle, project.settings);
  }

  // A rewritten script invalidates everything downstream.
  const next: Project = logged(
    {
      ...project,
      script,
      scriptApproved: false,
      assets: [],
      composed: false,
      motionReport: undefined,
      renderedFile: undefined,
      stage: "script",
    },
    {
      stage: "script",
      message: note
        ? `Script drafted from the offline template (${note}).`
        : `Script drafted: ${script.scenes.length} scenes, ${script.totalSeconds}s.`,
    },
  );

  return writeProject(next);
}

// ---------- assets ----------

export async function runAssets(
  project: Project,
  opts: { force?: boolean } = {},
): Promise<Project> {
  const script = project.script;
  if (!script) throw new Error("Write a script before generating assets");

  const frame = frameFor(project.settings.aspect);
  const kept = opts.force ? [] : project.assets.filter((a) => a.status === "ready");
  const assets: Asset[] = [...kept];
  const notes: string[] = [];

  for (const scene of script.scenes) {
    if (assets.some((a) => a.ownerId === scene.id && a.kind === "broll")) continue;

    const media = await generateBroll(project.settings.brollProvider, {
      prompt: scene.brollPrompt,
      durationSeconds: scene.durationSeconds,
      aspect: project.settings.aspect,
      frame,
      model: project.settings.brollModel,
      seed: `${project.id}:${scene.id}`,
    });

    const file = await writeAsset(project.id, `${scene.id}.${media.extension}`, media.data);
    if (media.note) notes.push(media.note);

    assets.push({
      ownerId: scene.id,
      kind: "broll",
      provider: media.provider,
      status: "ready",
      file,
      mediaType: media.mediaType,
      durationSeconds: media.durationSeconds,
      prompt: scene.brollPrompt,
      note: media.note,
    });
  }

  if (project.settings.format === "avatar" && !assets.some((a) => a.kind === "avatar")) {
    const media = await generateAvatar(project.settings.avatarProvider, {
      script: script.scenes.map((s) => s.narration).join(" "),
      aspect: project.settings.aspect,
      frame,
      voiceId: project.settings.voiceId,
      seed: `${project.id}:avatar`,
    });
    const file = await writeAsset(project.id, `avatar.${media.extension}`, media.data);
    if (media.note) notes.push(media.note);
    assets.push({
      ownerId: "avatar",
      kind: "avatar",
      provider: media.provider,
      status: "ready",
      file,
      mediaType: media.mediaType,
      note: media.note,
    });
  }

  const unique = Array.from(new Set(notes));
  const next = logged(
    { ...project, assets, composed: false, stage: "assets" },
    {
      stage: "assets",
      message:
        `Generated ${assets.length} asset${assets.length === 1 ? "" : "s"}.` +
        (unique.length ? ` ${unique[0]}` : ""),
    },
  );

  return writeProject(next);
}

// ---------- compose ----------

export async function runCompose(project: Project): Promise<Project> {
  if (!project.script) throw new Error("Write a script before composing");

  const { html, totalSeconds } = composeProject(project);
  await writeComposition(project.id, html);

  const report = analyseProject(project);
  const errors = report.findings.filter((f) => f.level === "error").length;
  const warns = report.findings.filter((f) => f.level === "warn").length;

  const next = logged(
    { ...project, composed: true, motionReport: report, stage: "compose" },
    {
      stage: "compose",
      message: `Composition written — ${totalSeconds}s, ${errors} error${
        errors === 1 ? "" : "s"
      }, ${warns} warning${warns === 1 ? "" : "s"}.`,
    },
  );

  return writeProject(next);
}
