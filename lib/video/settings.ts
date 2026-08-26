// Coerce untrusted request bodies into a valid VideoSettings, falling back to
// the chosen workflow's defaults for anything missing or out of range.

import { getWorkflow } from "./workflows";
import type { VideoSettings } from "./types";

const ASPECTS = ["16:9", "9:16", "1:1"] as const;
const FORMATS = ["avatar", "audio-only", "faceless"] as const;

export function coerceSettings(
  input: Record<string, unknown>,
  base?: VideoSettings,
): VideoSettings {
  const workflow = getWorkflow(String(input.workflow ?? base?.workflow ?? ""));
  const d = workflow.defaults;

  const aspect = ASPECTS.includes(input.aspect as never)
    ? (input.aspect as VideoSettings["aspect"])
    : (base?.aspect ?? d.aspect);
  const format = FORMATS.includes(input.format as never)
    ? (input.format as VideoSettings["format"])
    : (base?.format ?? d.format);
  const duration = Math.min(
    Math.max(Number(input.durationSeconds) || base?.durationSeconds || d.durationSeconds, 10),
    600,
  );

  const broll = input.brollProvider ?? base?.brollProvider;
  const avatar = input.avatarProvider ?? base?.avatarProvider;

  return {
    workflow: workflow.id,
    durationSeconds: duration,
    format,
    aspect,
    brollProvider: broll === "fal" ? "fal" : "placeholder",
    avatarProvider: avatar === "heygen" ? "heygen" : "placeholder",
    brollModel:
      typeof input.brollModel === "string" && input.brollModel.trim()
        ? input.brollModel.trim()
        : base?.brollModel,
    voiceId:
      typeof input.voiceId === "string" && input.voiceId.trim()
        ? input.voiceId.trim()
        : base?.voiceId,
  };
}
