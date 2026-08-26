// ---- Motion QA ----
//
// The point of compiling motion to keyframes is that the motion can then be
// *read back*. This pass inspects the keyframes the composition actually
// contains — not the intent behind them — and reports what would look wrong on
// screen: a camera move that overshoots its overscan and exposes an edge, an arc
// too short to read as an arc, four identical pushes in a row, narration nobody
// can say in the time allotted.
//
// It runs with no external dependency. `npx hyperframes keyframes --json` gives
// a second, renderer-side opinion when the CLI is installed (see cli.ts); the
// two are merged for display.

import type { MotionFinding, MotionReport, MotionTrackSummary, Project, Scene } from "./types";
import { composeProject } from "./compose";
import { compileSceneMotion, OVERSCAN } from "./motion";
import { frameFor } from "./workflows";

/** Words per second a narrator can comfortably hit. */
const WPS_MIN = 1.9;
const WPS_MAX = 3.4;

export function analyseProject(project: Project): MotionReport {
  const findings: MotionFinding[] = [];
  const tracks: MotionTrackSummary[] = [];
  const script = project.script;

  if (!script || script.scenes.length === 0) {
    return {
      source: "static",
      checkedAt: new Date().toISOString(),
      findings: [{ level: "error", message: "No script to analyse yet." }],
      tracks: [],
    };
  }

  const frame = frameFor(project.settings.aspect);
  const { tracks: compiled, sceneStarts, totalSeconds } = composeProject(project);

  // Budget: a camera layer is OVERSCAN bigger than the frame, so it can travel
  // half of that in either direction before an edge shows.
  const budgetX = (frame.width * OVERSCAN) / 2;
  const budgetY = (frame.height * OVERSCAN) / 2;

  const sceneById = new Map(script.scenes.map((s) => [s.id, s]));

  // A track usually breaches its budget on several keys at once. Collect the
  // worst breach per scene+axis so the report says each thing once.
  const overshoot = new Map<string, { scene: Scene; axis: string; worst: number; budget: number }>();
  const belowOne = new Set<string>();

  for (const track of compiled) {
    const sceneId = track.selector.replace(/^#/, "").replace(/-cam-[xyz]$|-text$/, "");
    const scene = sceneById.get(sceneId);
    tracks.push({
      sceneId,
      target: track.selector,
      property: track.axis,
      keys: track.keys.map((k) => ({ t: k.t, value: k.v })),
    });
    if (!scene) continue;

    const start = sceneStarts[scene.id] ?? 0;
    const end = start + scene.durationSeconds;

    for (const key of track.keys) {
      // Text tracks intentionally run 0.4s past the caption's hold, but never
      // past the scene itself.
      if (key.t < start - 0.001 || key.t > end + 0.001) {
        findings.push({
          level: "error",
          sceneId: scene.id,
          message: `A ${track.axis} keyframe at ${key.t.toFixed(2)}s falls outside scene ${
            scene.index + 1
          } (${start.toFixed(2)}s–${end.toFixed(2)}s). It will never play.`,
          fix: "Shorten the keyframe or lengthen the scene.",
        });
      }
      if (track.axis === "x" || track.axis === "y") {
        const budget = track.axis === "x" ? budgetX : budgetY;
        if (Math.abs(key.v) > budget + 0.5) {
          const mapKey = `${scene.id}:${track.axis}`;
          const prior = overshoot.get(mapKey);
          if (!prior || Math.abs(key.v) > prior.worst) {
            overshoot.set(mapKey, { scene, axis: track.axis, worst: Math.abs(key.v), budget });
          }
        }
      }
      if (track.axis === "scale" && key.v < 1) belowOne.add(scene.id);
    }
  }

  for (const { scene, axis, worst, budget } of overshoot.values()) {
    // The safe intensity is absolute, not a further multiplier: the current
    // travel scales linearly with it, so budget/worst is the fraction to keep.
    const safe = Math.max(0.1, Math.round(scene.motionIntensity * (budget / worst) * 100) / 100);
    findings.push({
      level: "warn",
      sceneId: scene.id,
      message:
        axis === "x"
          ? `Scene ${scene.index + 1} pans ${worst.toFixed(0)}px horizontally but only ${budget.toFixed(
              0,
            )}px of overscan exists — the frame edge will show.`
          : `Scene ${scene.index + 1} tilts ${worst.toFixed(0)}px vertically, past the ${budget.toFixed(
              0,
            )}px overscan budget.`,
      fix: `Drop this scene's travel from ${scene.motionIntensity}× to ${safe}×.`,
    });
  }

  for (const sceneId of belowOne) {
    const scene = sceneById.get(sceneId);
    findings.push({
      level: "error",
      sceneId,
      message: `Scene ${(scene?.index ?? 0) + 1} scales below 1×, which pulls the media inside the frame and shows the background.`,
      fix: "Keep every scale keyframe at 1.0 or above.",
    });
  }

  // ---- Scene-level readability ----
  let run = { motion: "", count: 0 };
  for (const scene of script.scenes) {
    const words = scene.narration.trim().split(/\s+/).filter(Boolean).length;
    const wps = words / Math.max(scene.durationSeconds, 0.1);

    if (project.settings.format !== "faceless" && words > 0) {
      if (wps > WPS_MAX) {
        findings.push({
          level: "warn",
          sceneId: scene.id,
          message: `Scene ${scene.index + 1} asks for ${words} words in ${scene.durationSeconds.toFixed(
            1,
          )}s (${wps.toFixed(1)} words/sec) — faster than a narrator can land it.`,
          fix: `Give the scene about ${(words / 2.6).toFixed(1)}s, or cut ~${Math.ceil(
            words - scene.durationSeconds * 2.6,
          )} words.`,
        });
      } else if (wps < WPS_MIN && words > 3) {
        findings.push({
          level: "info",
          sceneId: scene.id,
          message: `Scene ${scene.index + 1} runs ${scene.durationSeconds.toFixed(
            1,
          )}s for only ${words} words — there will be dead air.`,
          fix: "Trim the scene or add a line.",
        });
      }
    }

    if (scene.onScreenText.length > 90) {
      findings.push({
        level: "warn",
        sceneId: scene.id,
        message: `Scene ${scene.index + 1}'s on-screen text is ${scene.onScreenText.length} characters. Past ~90 it stops being readable at a glance.`,
        fix: "Cut it to a single line.",
      });
    }

    if (scene.motion.startsWith("arc") && scene.durationSeconds < 2.5) {
      findings.push({
        level: "warn",
        sceneId: scene.id,
        message: `Scene ${scene.index + 1} is ${scene.durationSeconds.toFixed(
          1,
        )}s — too short for an arc to read as curved motion.`,
        fix: "Use push-in for scenes under 2.5s, or lengthen the scene.",
      });
    }

    if (scene.motion === run.motion) {
      run.count += 1;
      if (run.count === 3) {
        findings.push({
          level: "warn",
          sceneId: scene.id,
          message: `Three scenes in a row use "${scene.motion}". The cut stops registering as a cut.`,
          fix: "Alternate direction — follow a push-in with an arc or a pull-out.",
        });
      }
    } else {
      run = { motion: scene.motion, count: 1 };
    }

    const hasBroll = project.assets.some(
      (a) => a.ownerId === scene.id && a.kind === "broll" && a.status === "ready",
    );
    if (!hasBroll) {
      findings.push({
        level: "error",
        sceneId: scene.id,
        message: `Scene ${scene.index + 1} has no B-roll — it will render as an empty card.`,
        fix: "Run the asset stage for this scene.",
      });
    }
  }

  // ---- Whole-video ----
  const target = project.settings.durationSeconds;
  const drift = Math.abs(totalSeconds - target) / target;
  if (drift > 0.2) {
    findings.push({
      level: "info",
      message: `The cut runs ${totalSeconds.toFixed(1)}s against a ${target}s target (${Math.round(
        drift * 100,
      )}% off).`,
      fix: totalSeconds > target ? "Trim a scene." : "Add a scene or hold the existing ones longer.",
    });
  }

  const order: Record<MotionFinding["level"], number> = { error: 0, warn: 1, info: 2 };
  findings.sort((a, b) => order[a.level] - order[b.level]);

  return { source: "static", checkedAt: new Date().toISOString(), findings, tracks };
}

/**
 * Apply the fixes this pass can make on its own: break up repeated moves and
 * dial back any camera that overshoots its overscan. Returns the corrected
 * scenes — the caller decides whether to save them.
 */
export function autoCorrect(project: Project): { scenes: Scene[]; changes: string[] } {
  const script = project.script;
  if (!script) return { scenes: [], changes: [] };

  const frame = frameFor(project.settings.aspect);
  const changes: string[] = [];
  const alternatives = ["push-in", "arc-left", "pull-out", "arc-right", "pan-left", "rise"] as const;

  const scenes = script.scenes.map((scene) => ({ ...scene }));

  // Break monotony: no motion three times running.
  for (let i = 2; i < scenes.length; i += 1) {
    if (scenes[i].motion === scenes[i - 1].motion && scenes[i - 1].motion === scenes[i - 2].motion) {
      const next = alternatives.find((m) => m !== scenes[i].motion) ?? "arc-left";
      changes.push(`Scene ${i + 1}: ${scenes[i].motion} → ${next} (three identical moves in a row).`);
      scenes[i].motion = next;
    }
  }

  // Pull back anything that overshoots the overscan budget.
  const budgetX = (frame.width * OVERSCAN) / 2;
  const budgetY = (frame.height * OVERSCAN) / 2;
  for (const scene of scenes) {
    const compiled = compileSceneMotion(scene, 0, frame);
    let worst = 1;
    for (const track of compiled) {
      const budget = track.axis === "x" ? budgetX : track.axis === "y" ? budgetY : Infinity;
      for (const key of track.keys) {
        if (Math.abs(key.v) > budget) worst = Math.max(worst, Math.abs(key.v) / budget);
      }
    }
    if (worst > 1.001) {
      const next = Math.round((scene.motionIntensity / worst) * 100) / 100;
      changes.push(
        `Scene ${scene.index + 1}: intensity ${scene.motionIntensity}× → ${next}× (camera was travelling past the overscan).`,
      );
      scene.motionIntensity = next;
    }
    if (scene.motion.startsWith("arc") && scene.durationSeconds < 2.5) {
      changes.push(`Scene ${scene.index + 1}: ${scene.motion} → push-in (too short to read as an arc).`);
      scene.motion = "push-in";
    }
  }

  return { scenes, changes };
}
