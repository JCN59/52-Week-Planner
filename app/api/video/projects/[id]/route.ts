import { NextRequest, NextResponse } from "next/server";
import { coerceSettings } from "@/lib/video/settings";
import { deleteProject, logged, readProject, writeProject } from "@/lib/video/store";
import { MOTION_ORDER } from "@/lib/video/motion";
import { renderCommandFor, previewCommandFor } from "@/lib/video/cli";
import type { MotionPreset, Project, Scene } from "@/lib/video/types";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({
    project,
    commands: {
      render: renderCommandFor(project.id),
      preview: previewCommandFor(project.id),
    },
  });
}

/** Merge scene edits from the UI, keeping ids and indexes authoritative. */
function mergeScenes(existing: Scene[], patch: unknown): Scene[] {
  if (!Array.isArray(patch)) return existing;
  const byId = new Map(existing.map((s) => [s.id, s]));

  const next = patch
    .map((raw, i) => {
      const p = raw as Record<string, unknown>;
      const id = typeof p.id === "string" ? p.id : `scene-${i + 1}`;
      const base = byId.get(id);
      if (!base) return null;
      const motion =
        typeof p.motion === "string" && (MOTION_ORDER as string[]).includes(p.motion)
          ? (p.motion as MotionPreset)
          : base.motion;
      return {
        ...base,
        index: i,
        label: typeof p.label === "string" ? p.label.slice(0, 60) : base.label,
        narration: typeof p.narration === "string" ? p.narration.slice(0, 2000) : base.narration,
        onScreenText:
          typeof p.onScreenText === "string" ? p.onScreenText.slice(0, 200) : base.onScreenText,
        brollPrompt:
          typeof p.brollPrompt === "string" ? p.brollPrompt.slice(0, 1000) : base.brollPrompt,
        motion,
        motionIntensity: Number.isFinite(Number(p.motionIntensity))
          ? Math.min(Math.max(Number(p.motionIntensity), 0.1), 2)
          : base.motionIntensity,
        durationSeconds: Number.isFinite(Number(p.durationSeconds))
          ? Math.min(Math.max(Number(p.durationSeconds), 1), 120)
          : base.durationSeconds,
      } satisfies Scene;
    })
    .filter((s): s is Scene => s !== null);

  return next.length ? next : existing;
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  let next: Project = { ...project };
  const notes: string[] = [];

  if (typeof body.name === "string" && body.name.trim()) {
    next.name = body.name.trim().slice(0, 120);
  }

  if (body.settings && typeof body.settings === "object") {
    next.settings = coerceSettings(body.settings as Record<string, unknown>, project.settings);
    // Aspect and workflow change the frame and the look, so the composition
    // on disk is stale until it is rebuilt.
    if (
      next.settings.aspect !== project.settings.aspect ||
      next.settings.workflow !== project.settings.workflow
    ) {
      next.composed = false;
      notes.push("Frame or workflow changed — recompose to pick it up.");
    }
    if (next.settings.brollProvider !== project.settings.brollProvider) {
      notes.push("B-roll provider changed — regenerate assets to use it.");
    }
  }

  if (next.script && Array.isArray(body.scenes)) {
    const scenes = mergeScenes(next.script.scenes, body.scenes);
    next.script = {
      ...next.script,
      scenes,
      totalSeconds: Math.round(scenes.reduce((a, s) => a + s.durationSeconds, 0) * 10) / 10,
    };
    next.composed = false;
    notes.push("Scenes edited.");
  }

  if (next.script && typeof body.title === "string" && body.title.trim()) {
    next.script = { ...next.script, title: body.title.trim().slice(0, 160) };
    next.composed = false;
  }

  if (typeof body.scriptApproved === "boolean") {
    next.scriptApproved = body.scriptApproved;
    notes.push(body.scriptApproved ? "Script approved." : "Approval withdrawn.");
  }

  if (notes.length) next = logged(next, { stage: next.stage, message: notes.join(" ") });

  return NextResponse.json({ project: await writeProject(next) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    await deleteProject(params.id);
    return NextResponse.json({ deleted: params.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
