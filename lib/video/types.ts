// ---- Video Agent: the shape of a video project as it moves through the pipeline ----
//
// A project walks: brief -> script -> assets -> compose -> render.
// Every stage writes back into the same Project record on disk, so the UI and
// an agent driving the HTTP API see exactly the same state.

export type Aspect = "16:9" | "9:16" | "1:1";

/** How the finished video presents itself. */
export type VideoFormat =
  | "avatar" // AI presenter on screen, B-roll cut around them
  | "audio-only" // narration over B-roll, no presenter
  | "faceless"; // B-roll + on-screen text, no narration track

export type BrollProviderId = "placeholder" | "fal";
export type AvatarProviderId = "placeholder" | "heygen";

export type WorkflowId =
  | "explainer"
  | "slideshow"
  | "product-launch"
  | "cinematic"
  | "social-short";

export type VideoSettings = {
  workflow: WorkflowId;
  /** Target runtime. The script is written to fit this. */
  durationSeconds: number;
  format: VideoFormat;
  aspect: Aspect;
  brollProvider: BrollProviderId;
  avatarProvider: AvatarProviderId;
  /** Free-text model hint passed to the B-roll provider (e.g. a fal model id). */
  brollModel?: string;
  /** Provider-side voice id for narration. */
  voiceId?: string;
};

/** A trending topic + a specific angle on it. The "radar" stage output. */
export type TopicAngle = {
  id: string;
  topic: string;
  angle: string;
  title: string;
  hook: string;
  why: string;
  keywords: string[];
  /** 0-100 subjective "how hot is this right now". */
  heat: number;
};

/**
 * A named camera move. Each preset compiles to real keyframes (see motion.ts),
 * which in turn compile to a seek-safe GSAP timeline in the composition.
 */
export type MotionPreset =
  | "static"
  | "push-in"
  | "pull-out"
  | "pan-left"
  | "pan-right"
  | "arc-left"
  | "arc-right"
  | "rise"
  | "drift-down";

export type Scene = {
  id: string;
  index: number;
  label: string;
  /** What the narrator says over this scene. */
  narration: string;
  /** The words burned onto the frame. */
  onScreenText: string;
  /** The generation prompt for this scene's B-roll. */
  brollPrompt: string;
  motion: MotionPreset;
  /** 0.5 = half the preset's travel, 2 = double it. */
  motionIntensity: number;
  durationSeconds: number;
};

export type Script = {
  title: string;
  hook: string;
  scenes: Scene[];
  cta: string;
  totalSeconds: number;
  source: "ai" | "mock";
  generatedAt: string;
};

export type AssetKind = "broll" | "avatar" | "voiceover";

export type Asset = {
  /** Scene id, or "avatar" / "voiceover" for the whole-video tracks. */
  ownerId: string;
  kind: AssetKind;
  provider: string;
  status: "ready" | "failed";
  /** Path relative to the project directory, e.g. "assets/scene-1.svg". */
  file: string;
  mediaType: "image" | "video" | "audio";
  durationSeconds?: number;
  prompt?: string;
  note?: string;
};

export type PipelineStage = "brief" | "script" | "assets" | "compose" | "render";

/** One finding from the motion QA pass. */
export type MotionFinding = {
  level: "error" | "warn" | "info";
  sceneId?: string;
  message: string;
  /** What to change to fix it. Rendered as a one-click action when possible. */
  fix?: string;
};

export type MotionReport = {
  source: "static" | "hyperframes-cli";
  checkedAt: string;
  findings: MotionFinding[];
  /** Every keyframe the composition actually contains, for display. */
  tracks: MotionTrackSummary[];
};

export type MotionTrackSummary = {
  sceneId: string;
  target: string;
  property: string;
  keys: { t: number; value: number }[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stage: PipelineStage;
  settings: VideoSettings;
  angle?: TopicAngle;
  script?: Script;
  scriptApproved: boolean;
  assets: Asset[];
  /** Set once index.html has been written into the project directory. */
  composed: boolean;
  motionReport?: MotionReport;
  renderedFile?: string;
  log: LogEntry[];
};

export type LogEntry = {
  at: string;
  stage: PipelineStage | "radar" | "qa";
  message: string;
};

/** Trimmed-down project record for the workspace list. */
export type ProjectSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stage: PipelineStage;
  workflow: WorkflowId;
  aspect: Aspect;
  durationSeconds: number;
  sceneCount: number;
  composed: boolean;
  title?: string;
};
