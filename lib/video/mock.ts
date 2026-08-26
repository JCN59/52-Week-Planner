// ---- Offline fallbacks ----
//
// With no ANTHROPIC_API_KEY the whole pipeline still runs end to end: these
// produce a structurally complete angle set and script so the composition,
// preview, motion QA, and render command can all be exercised. The content is
// generic on purpose — it is scaffolding, not writing.

import type { Scene, Script, TopicAngle, VideoSettings } from "./types";
import { getWorkflow } from "./workflows";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

const ANGLE_SHAPES: {
  angle: (n: string) => string;
  title: (n: string) => string;
  hook: (n: string) => string;
  why: (n: string) => string;
  heat: number;
}[] = [
  {
    angle: (n) => `The bottleneck in ${n} has moved from making things to assembling them.`,
    title: (n) => `${n} isn't the hard part any more`,
    hook: () => "Everyone solved the wrong half of this problem.",
    why: (n) => `Generation quality in ${n} plateaued; the workflow around it did not.`,
    heat: 78,
  },
  {
    angle: (n) => `Most ${n} advice assumes a team. The interesting version assumes one person.`,
    title: (n) => `What ${n} looks like with nobody to delegate to`,
    hook: () => "Cut the team out and the whole shape of the problem changes.",
    why: (n) => `Tooling for solo operators in ${n} caught up in the last few months.`,
    heat: 64,
  },
  {
    angle: (n) => `The thing that gives ${n} away is never the part people try to fix.`,
    title: (n) => `You can always tell — and it's not what you think`,
    hook: () => "It's not the quality. It's the timing.",
    why: (n) => `Audiences got fast at spotting ${n}, so the tells shifted.`,
    heat: 71,
  },
  {
    angle: (n) => `Doing ${n} well is now mostly a question of what you refuse to automate.`,
    title: (n) => `The one step in ${n} worth doing by hand`,
    hook: () => "Automate all of it and it stops working. Here's the part to keep.",
    why: () => "Fully-automated pipelines are hitting a visible quality ceiling.",
    heat: 59,
  },
  {
    angle: (n) => `${n} is cheap enough now that the constraint is taste, not budget.`,
    title: (n) => `When ${n} costs nothing, what's left?`,
    hook: () => "The price went to zero. That made the hard part harder.",
    why: () => "Per-unit costs dropped enough that volume stopped being a moat.",
    heat: 55,
  },
];

export function mockAngles(niche: string, count: number): TopicAngle[] {
  const n = niche.trim() || "AI video";
  return ANGLE_SHAPES.slice(0, count).map((shape, i) => ({
    id: `${slug(n)}-${i + 1}`,
    topic: n,
    angle: shape.angle(n),
    title: shape.title(n),
    hook: shape.hook(n),
    why: shape.why(n),
    keywords: [n, `${n} workflow`, `${n} tools`],
    heat: shape.heat,
  }));
}

const SCENE_SHAPES = [
  {
    label: "Hook",
    narration: (a: TopicAngle) => `${a.hook} Here's what actually changed.`,
    text: (a: TopicAngle) => a.hook,
    broll: (a: TopicAngle) =>
      `Wide establishing shot representing ${a.topic}, low-angle, hard side light, shallow depth of field, no text`,
  },
  {
    label: "The problem",
    narration: (a: TopicAngle) => `${a.angle} That's the part nobody budgets for.`,
    text: () => "The bottleneck moved",
    broll: (a: TopicAngle) =>
      `Close-up detail shot suggesting friction in ${a.topic}, tight framing, cool light, shallow focus, no text`,
  },
  {
    label: "Proof",
    narration: (a: TopicAngle) => `${a.why} You can watch it happen in real time.`,
    text: () => "Watch it happen",
    broll: (a: TopicAngle) =>
      `Medium shot of the process behind ${a.topic}, practical lighting, handheld feel, no text`,
  },
  {
    label: "Payoff",
    narration: () => "So the move is to stop optimising the loud part and fix the quiet one.",
    text: () => "Fix the quiet part",
    broll: (a: TopicAngle) =>
      `Resolved wide shot, warm light, calm composition, subject of ${a.topic} in frame, no text`,
  },
  {
    label: "Close",
    narration: () => "That's the whole idea. The rest is execution.",
    text: () => "The rest is execution",
    broll: () => `Slow abstract texture, warm rim light, soft focus, no text`,
  },
];

export function mockScript(angle: TopicAngle, settings: VideoSettings): Script {
  const workflow = getWorkflow(settings.workflow);
  const count = Math.min(Math.max(workflow.defaults.sceneCount, 3), SCENE_SHAPES.length);
  const per = Math.round((settings.durationSeconds / count) * 10) / 10;

  const scenes: Scene[] = SCENE_SHAPES.slice(0, count).map((shape, i) => ({
    id: `scene-${i + 1}`,
    index: i,
    label: shape.label,
    narration: shape.narration(angle),
    onScreenText: shape.text(angle),
    brollPrompt: shape.broll(angle),
    motion: workflow.motionVocabulary[i % workflow.motionVocabulary.length],
    motionIntensity: 1,
    durationSeconds: per,
  }));

  return {
    title: angle.title,
    hook: angle.hook,
    scenes,
    cta: "Full build in the description.",
    totalSeconds: Math.round(per * count * 10) / 10,
    source: "mock",
    generatedAt: new Date().toISOString(),
  };
}
