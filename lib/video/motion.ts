// ---- Keyframes ----
//
// Every camera move in a composition is a list of keyframes, not a hand-written
// GSAP call. Presets are authored here in *normalized* units (t: 0..1 through the
// scene, values as a fraction of the frame), then compiled to absolute seconds and
// pixels for a specific scene + canvas. That indirection is what makes the motion
// inspectable: the UI and the QA pass read the same keyframe list the renderer runs.
//
// Arc motion falls out of the same model. There is no motion-path plugin involved:
// a scene's camera is three nested wrappers (x, y, scale) and an arc is simply a
// linear x track paired with an eased, bowed y track. Only x/y/scale/opacity are
// ever animated, which are the properties HyperFrames documents as seek-safe.

import type { MotionPreset, Scene } from "./types";

export type Axis = "x" | "y" | "scale" | "opacity";

export type NormalizedKey = {
  /** Position through the scene, 0 = scene start, 1 = scene end. */
  t: number;
  /** x/y: fraction of frame width/height. scale/opacity: absolute. */
  v: number;
  ease?: string;
};

export type NormalizedTrack = {
  axis: Axis;
  keys: NormalizedKey[];
};

export type CompiledKey = {
  /** Absolute seconds on the master timeline. */
  t: number;
  /** Pixels for x/y, absolute for scale/opacity. */
  v: number;
  ease: string;
};

export type CompiledTrack = {
  /** CSS selector of the element this track drives. */
  selector: string;
  axis: Axis;
  keys: CompiledKey[];
};

/**
 * How much bigger than the frame each camera layer is rendered. The travel
 * budget below (max 0.07) stays inside half of this, so a move never exposes
 * an edge of the media.
 */
export const OVERSCAN = 0.18;

export const MOTION_PRESETS: Record<
  MotionPreset,
  { label: string; blurb: string; tracks: NormalizedTrack[] }
> = {
  static: {
    label: "Static",
    blurb: "Locked off. Let the subject move instead of the camera.",
    tracks: [{ axis: "scale", keys: [{ t: 0, v: 1.04 }, { t: 1, v: 1.04 }] }],
  },
  "push-in": {
    label: "Push in",
    blurb: "Slow zoom toward the subject — builds attention on a claim.",
    tracks: [
      { axis: "scale", keys: [{ t: 0, v: 1.0, ease: "none" }, { t: 1, v: 1.14, ease: "none" }] },
    ],
  },
  "pull-out": {
    label: "Pull out",
    blurb: "Reveals context. Good for a scene that widens the argument.",
    tracks: [
      { axis: "scale", keys: [{ t: 0, v: 1.16, ease: "none" }, { t: 1, v: 1.0, ease: "none" }] },
    ],
  },
  "pan-left": {
    label: "Pan left",
    blurb: "Lateral drift left across an oversized frame.",
    tracks: [
      { axis: "x", keys: [{ t: 0, v: 0.06, ease: "none" }, { t: 1, v: -0.06, ease: "none" }] },
      { axis: "scale", keys: [{ t: 0, v: 1.1 }, { t: 1, v: 1.1 }] },
    ],
  },
  "pan-right": {
    label: "Pan right",
    blurb: "Lateral drift right across an oversized frame.",
    tracks: [
      { axis: "x", keys: [{ t: 0, v: -0.06, ease: "none" }, { t: 1, v: 0.06, ease: "none" }] },
      { axis: "scale", keys: [{ t: 0, v: 1.1 }, { t: 1, v: 1.1 }] },
    ],
  },
  "arc-left": {
    label: "Arc left",
    blurb: "Curved move: linear x, bowed y. Reads as a camera swinging around.",
    tracks: [
      { axis: "x", keys: [{ t: 0, v: 0.07, ease: "none" }, { t: 1, v: -0.07, ease: "none" }] },
      {
        axis: "y",
        keys: [
          { t: 0, v: 0.03, ease: "power1.inOut" },
          { t: 0.5, v: -0.035, ease: "power1.inOut" },
          { t: 1, v: 0.03, ease: "power1.inOut" },
        ],
      },
      { axis: "scale", keys: [{ t: 0, v: 1.11 }, { t: 1, v: 1.11 }] },
    ],
  },
  "arc-right": {
    label: "Arc right",
    blurb: "Mirror of arc left — swings the other way.",
    tracks: [
      { axis: "x", keys: [{ t: 0, v: -0.07, ease: "none" }, { t: 1, v: 0.07, ease: "none" }] },
      {
        axis: "y",
        keys: [
          { t: 0, v: 0.03, ease: "power1.inOut" },
          { t: 0.5, v: -0.035, ease: "power1.inOut" },
          { t: 1, v: 0.03, ease: "power1.inOut" },
        ],
      },
      { axis: "scale", keys: [{ t: 0, v: 1.11 }, { t: 1, v: 1.11 }] },
    ],
  },
  rise: {
    label: "Rise",
    blurb: "Lifts up and settles. Pairs well with a hook line.",
    tracks: [
      { axis: "y", keys: [{ t: 0, v: 0.06, ease: "power1.out" }, { t: 1, v: -0.02, ease: "power1.out" }] },
      { axis: "scale", keys: [{ t: 0, v: 1.14, ease: "power1.out" }, { t: 1, v: 1.05, ease: "power1.out" }] },
    ],
  },
  "drift-down": {
    label: "Drift down",
    blurb: "Sinks slowly. Useful under a closing line.",
    tracks: [
      { axis: "y", keys: [{ t: 0, v: -0.05, ease: "none" }, { t: 1, v: 0.03, ease: "none" }] },
      { axis: "scale", keys: [{ t: 0, v: 1.06, ease: "none" }, { t: 1, v: 1.13, ease: "none" }] },
    ],
  },
};

export const MOTION_ORDER: MotionPreset[] = [
  "push-in",
  "pull-out",
  "arc-left",
  "arc-right",
  "pan-left",
  "pan-right",
  "rise",
  "drift-down",
  "static",
];

const AXIS_SELECTOR: Record<Axis, (sceneId: string) => string> = {
  x: (id) => `#${id}-cam-x`,
  y: (id) => `#${id}-cam-y`,
  scale: (id) => `#${id}-cam-z`,
  opacity: (id) => `#${id}-text`,
};

function round(n: number, places = 3): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/**
 * Turn a scene's preset into absolute keyframes on the master timeline.
 * `intensity` scales travel only — timing and easing are untouched, so a
 * dialled-down move keeps its character.
 */
export function compileSceneMotion(
  scene: Scene,
  sceneStart: number,
  frame: { width: number; height: number },
): CompiledTrack[] {
  const preset = MOTION_PRESETS[scene.motion] ?? MOTION_PRESETS.static;
  const intensity = Number.isFinite(scene.motionIntensity) ? scene.motionIntensity : 1;
  const dur = scene.durationSeconds;

  return preset.tracks.map((track) => {
    const selector = AXIS_SELECTOR[track.axis](scene.id);
    const keys = track.keys.map((key) => {
      let value: number;
      if (track.axis === "x") value = key.v * frame.width * intensity;
      else if (track.axis === "y") value = key.v * frame.height * intensity;
      else if (track.axis === "scale") value = 1 + (key.v - 1) * intensity;
      else value = key.v;
      return {
        t: round(sceneStart + key.t * dur),
        v: round(value, 4),
        ease: key.ease ?? "none",
      };
    });
    return { selector, axis: track.axis, keys };
  });
}

/**
 * Title / lower-third animation. Kept separate from the camera because it is
 * driven by readability (a fixed 0.5s in, 0.4s out) rather than by the preset.
 */
export function compileTextMotion(scene: Scene, sceneStart: number): CompiledTrack[] {
  const dur = scene.durationSeconds;
  const sceneEnd = sceneStart + dur;
  const inAt = sceneStart + 0.15;
  const inEnd = inAt + 0.5;
  // Fade out half a second before the cut, but never before the caption has
  // finished arriving, and never past the scene itself — a keyframe outside the
  // clip window is a keyframe that never plays.
  const outAt = Math.min(Math.max(inEnd + 0.1, sceneEnd - 0.5), sceneEnd);
  const outEnd = Math.min(sceneEnd, outAt + 0.4);
  const sel = `#${scene.id}-text`;
  return [
    {
      selector: sel,
      axis: "opacity",
      keys: [
        { t: round(sceneStart), v: 0, ease: "none" },
        { t: round(inAt), v: 0, ease: "power2.out" },
        { t: round(Math.min(inEnd, sceneEnd)), v: 1, ease: "power2.out" },
        { t: round(outAt), v: 1, ease: "power2.in" },
        { t: round(outEnd), v: 0, ease: "power2.in" },
      ],
    },
    {
      selector: sel,
      axis: "y",
      keys: [
        { t: round(inAt), v: 28, ease: "power3.out" },
        { t: round(Math.min(inAt + 0.6, sceneEnd)), v: 0, ease: "power3.out" },
      ],
    },
  ];
}
