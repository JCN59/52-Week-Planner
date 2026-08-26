// ---- Prompts + response schemas for the two model-driven stages ----

import type { TopicAngle, VideoSettings } from "./types";
import { getWorkflow } from "./workflows";
import { MOTION_ORDER, MOTION_PRESETS } from "./motion";

export const RADAR_SYSTEM = `You are a content researcher who finds angles, not topics.

A topic is "AI video tools". An angle is "the editing, not the generation, is what still gives AI video away". Topics are commodities; angles are the reason someone clicks.

Rules:
- Every angle must be arguable. If nobody could disagree with it, it is an observation, not an angle.
- Ground each one in something specific and checkable: a shipped feature, a number, a behaviour change, a named tool.
- No hype adjectives ("insane", "game-changing", "revolutionary"). Say what happened instead.
- Titles are written the way a person would say them out loud, not the way SEO wants them.
- "heat" is your honest read of how much attention the topic has right now, 0-100. Do not give everything an 80.`;

export function buildRadarPrompt(niche: string, keywords: string[], count: number): string {
  const kw = keywords.filter(Boolean);
  return [
    `Niche: ${niche}`,
    kw.length ? `Keywords being monitored: ${kw.join(", ")}` : "",
    "",
    `Give me ${count} distinct angles. Each must attack the niche from a different direction — if two of them could headline the same video, replace one.`,
    "",
    "For each: the underlying topic, the specific angle, a spoken-aloud title, a first-line hook, why this is live right now, and the keywords it sits under.",
  ]
    .filter(Boolean)
    .join("\n");
}

export const RADAR_SCHEMA = {
  type: "object",
  properties: {
    angles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          angle: { type: "string" },
          title: { type: "string" },
          hook: { type: "string" },
          why: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          heat: { type: "number" },
        },
        required: ["topic", "angle", "title", "hook", "why", "keywords", "heat"],
        additionalProperties: false,
      },
    },
  },
  required: ["angles"],
  additionalProperties: false,
} as const;

export const SCRIPT_SYSTEM = `You write short video scripts that are cut to picture. You are writing for a renderer, not a reader, so every scene carries four things at once: what is said, what is on screen, what the B-roll shows, and how the camera moves.

Hard rules:
- Narration is spoken. Contractions, short sentences, no bullet-point voice, no "in this video we will".
- On-screen text is not the narration. It is the three-to-seven words a viewer would screenshot.
- B-roll prompts describe a *shot*: subject, setting, lens/framing, light. No text, no logos, no UI mockups, no words rendered in the image.
- Camera motion is chosen for meaning. Push in to press a claim, pull out to reveal context, arc to add energy to a static subject, static when the subject already moves.
- Do not repeat the same motion more than twice in a row.
- Scene durations must add up to roughly the target runtime, and each scene needs about 2.6 words of narration per second. A 6-second scene is ~15 words, not 40.`;

export function buildScriptPrompt(angle: TopicAngle, settings: VideoSettings): string {
  const workflow = getWorkflow(settings.workflow);
  const vocab = workflow.motionVocabulary
    .map((m) => `${m} (${MOTION_PRESETS[m].blurb})`)
    .join("; ");

  const formatNote =
    settings.format === "faceless"
      ? "There is no narrator. On-screen text carries the whole argument — write narration anyway as a caption track, but keep it identical in meaning to the on-screen text."
      : settings.format === "audio-only"
        ? "Voice-over only, no presenter on screen. The imagery has to do the work the presenter would have done."
        : "An AI presenter is on screen in the corner throughout. Narration is what they say.";

  return [
    `Topic: ${angle.topic}`,
    `Angle: ${angle.angle}`,
    `Working title: ${angle.title}`,
    `Hook to build from: ${angle.hook}`,
    "",
    `Workflow: ${workflow.name} — ${workflow.blurb}`,
    `Direction: ${workflow.direction}`,
    `Format: ${formatNote}`,
    `Aspect: ${settings.aspect}`,
    `Target runtime: ${settings.durationSeconds} seconds across about ${workflow.defaults.sceneCount} scenes.`,
    "",
    `Motion to draw from, in priority order: ${vocab}`,
    `Any of these is valid if it serves the scene: ${MOTION_ORDER.join(", ")}.`,
    "",
    "Return the title, the hook line, the scenes, and a closing call to action of at most twelve words.",
    "Each scene needs: a two-or-three-word label (Hook, The problem, Proof, Payoff...), the narration, the on-screen text, the B-roll prompt, the motion, and a duration in seconds.",
  ].join("\n");
}

export const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    hook: { type: "string" },
    cta: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          narration: { type: "string" },
          onScreenText: { type: "string" },
          brollPrompt: { type: "string" },
          motion: { type: "string", enum: MOTION_ORDER as unknown as string[] },
          durationSeconds: { type: "number" },
        },
        required: ["label", "narration", "onScreenText", "brollPrompt", "motion", "durationSeconds"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "hook", "cta", "scenes"],
  additionalProperties: false,
} as const;
