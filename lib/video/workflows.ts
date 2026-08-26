// ---- Creation workflows ----
//
// A workflow is a named starting point: it sets the defaults for the brief, the
// look the composition is generated in, and the motion vocabulary the scripting
// pass is told to draw from. Adding a workflow is a matter of adding an entry
// here — nothing else in the pipeline is workflow-aware.

import type { Aspect, MotionPreset, VideoFormat, WorkflowId } from "./types";

export type Theme = {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  scrim: string;
  titleFont: string;
  bodyFont: string;
  /** Lower-third corner radius, px at 1080p. */
  radius: number;
  /** 0 = no letterbox bars, 1 = cinematic 2.39:1 crop. */
  letterbox: number;
  grain: number;
};

export type Workflow = {
  id: WorkflowId;
  name: string;
  blurb: string;
  defaults: {
    durationSeconds: number;
    format: VideoFormat;
    aspect: Aspect;
    sceneCount: number;
  };
  /** Motion the script writer is told to pick from, in priority order. */
  motionVocabulary: MotionPreset[];
  theme: Theme;
  /** Extra direction handed to the scripting model. */
  direction: string;
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "explainer",
    name: "Explainer",
    blurb: "Claim, evidence, payoff. The default for teaching something in a minute.",
    defaults: { durationSeconds: 60, format: "avatar", aspect: "16:9", sceneCount: 4 },
    motionVocabulary: ["push-in", "arc-left", "pull-out", "pan-right"],
    theme: {
      bg: "#0b1120",
      ink: "#f8fafc",
      muted: "#94a3b8",
      accent: "#38bdf8",
      accentInk: "#04121d",
      scrim: "linear-gradient(180deg, rgba(2,6,23,0) 42%, rgba(2,6,23,0.86) 100%)",
      titleFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      bodyFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      radius: 18,
      letterbox: 0,
      grain: 0.04,
    },
    direction:
      "Teach one idea. Open on the sharpest version of the claim, spend the middle proving it with something concrete, close on what the viewer should now do differently.",
  },
  {
    id: "social-short",
    name: "Social short",
    blurb: "Vertical, fast cuts, text-forward. Built to survive a thumb.",
    defaults: { durationSeconds: 30, format: "avatar", aspect: "9:16", sceneCount: 4 },
    motionVocabulary: ["push-in", "rise", "arc-right", "pan-left"],
    theme: {
      bg: "#0a0a0a",
      ink: "#ffffff",
      muted: "#a3a3a3",
      accent: "#facc15",
      accentInk: "#1c1400",
      scrim: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 100%)",
      titleFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      bodyFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      radius: 14,
      letterbox: 0,
      grain: 0.05,
    },
    direction:
      "Every scene must earn the next three seconds. Front-load the hook, keep sentences under twelve words, and put the payoff before the halfway mark.",
  },
  {
    id: "slideshow",
    name: "Slideshow",
    blurb: "One point per card. Calm motion, heavy typography, no presenter.",
    defaults: { durationSeconds: 45, format: "faceless", aspect: "16:9", sceneCount: 5 },
    motionVocabulary: ["drift-down", "push-in", "static", "pan-right"],
    theme: {
      bg: "#faf7f0",
      ink: "#141414",
      muted: "#57534e",
      accent: "#b45309",
      accentInk: "#fffbeb",
      scrim: "linear-gradient(180deg, rgba(250,247,240,0) 45%, rgba(250,247,240,0.92) 100%)",
      titleFont: '"Georgia", "Times New Roman", serif',
      bodyFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      radius: 10,
      letterbox: 0,
      grain: 0.07,
    },
    direction:
      "Write it like a deck read aloud. One idea per card, no transitions in the copy, and let the on-screen text carry the argument rather than the narration.",
  },
  {
    id: "product-launch",
    name: "Product launch",
    blurb: "Problem, product, proof, price. Ends on a call to action.",
    defaults: { durationSeconds: 50, format: "avatar", aspect: "16:9", sceneCount: 4 },
    motionVocabulary: ["rise", "push-in", "arc-right", "pull-out"],
    theme: {
      bg: "#0f0a1e",
      ink: "#f5f3ff",
      muted: "#a5b4fc",
      accent: "#a855f7",
      accentInk: "#faf5ff",
      scrim: "linear-gradient(180deg, rgba(15,10,30,0) 40%, rgba(15,10,30,0.9) 100%)",
      titleFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      bodyFont: '"Inter", "Helvetica Neue", Arial, sans-serif',
      radius: 20,
      letterbox: 0,
      grain: 0.03,
    },
    direction:
      "Name the problem in the first line and the product in the second. Prove it with one specific number or behaviour, then close with a single unambiguous next step.",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    blurb: "Wide bars, long takes, sparse text. Mood over information density.",
    defaults: { durationSeconds: 40, format: "audio-only", aspect: "16:9", sceneCount: 4 },
    motionVocabulary: ["arc-left", "arc-right", "drift-down", "pull-out"],
    theme: {
      bg: "#050505",
      ink: "#f4f1ea",
      muted: "#8a8378",
      accent: "#d4a373",
      accentInk: "#1a1206",
      scrim: "linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0) 35%, rgba(5,5,5,0.75) 100%)",
      titleFont: '"Georgia", "Times New Roman", serif',
      bodyFont: '"Georgia", "Times New Roman", serif',
      radius: 0,
      letterbox: 1,
      grain: 0.09,
    },
    direction:
      "Fewer words, longer holds. Narration should read as voice-over, not explanation — imagery carries the meaning and the text only punctuates it.",
  },
];

export function getWorkflow(id: WorkflowId | string | undefined): Workflow {
  return WORKFLOWS.find((w) => w.id === id) ?? WORKFLOWS[0];
}

export const FRAME_SIZES: Record<Aspect, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
};

export function frameFor(aspect: Aspect): { width: number; height: number } {
  return FRAME_SIZES[aspect] ?? FRAME_SIZES["16:9"];
}
