// ---- Provider registry ----
//
// One rule: a generation stage never fails the pipeline. If a provider is
// unconfigured or errors, the request falls back to the local placeholder and
// the reason is recorded on the asset, so the composition still previews and the
// UI can say exactly what went wrong.

import type { AvatarProviderId, BrollProviderId } from "../types";
import { brollFal } from "./fal";
import { avatarHeygen } from "./heygen";
import { avatarPlaceholder, brollPlaceholder } from "./placeholder";
import type { AvatarRequest, BrollRequest, GeneratedMedia } from "./types";

export type { AvatarRequest, BrollRequest, GeneratedMedia } from "./types";

export const BROLL_PROVIDERS: {
  id: BrollProviderId;
  label: string;
  blurb: string;
  requires: string[];
  models?: { id: string; label: string }[];
}[] = [
  {
    id: "placeholder",
    label: "Placeholder",
    blurb: "Local SVG cards. No key, no cost — the whole pipeline still runs.",
    requires: [],
  },
  {
    id: "fal",
    label: "fal.ai",
    blurb: "Text-to-video. The model id is free-form, so any fal video model works.",
    requires: ["FAL_KEY"],
    models: [
      { id: "fal-ai/minimax/hailuo-02/standard/text-to-video", label: "MiniMax Hailuo 02 (standard)" },
      { id: "fal-ai/minimax/hailuo-02/pro/text-to-video", label: "MiniMax Hailuo 02 (pro)" },
      { id: "fal-ai/minimax/video-01", label: "MiniMax Video 01" },
    ],
  },
];

export const AVATAR_PROVIDERS: {
  id: AvatarProviderId;
  label: string;
  blurb: string;
  requires: string[];
}[] = [
  {
    id: "placeholder",
    label: "Placeholder",
    blurb: "A static narrator card. Keeps the layout honest without a key.",
    requires: [],
  },
  {
    id: "heygen",
    label: "HeyGen",
    blurb: "Real AI presenter, lip-synced to the narration.",
    requires: ["HEYGEN_API_KEY", "HEYGEN_AVATAR_ID", "HEYGEN_VOICE_ID"],
  },
];

/** Which providers actually have their environment set, for the UI to show. */
export function providerAvailability(): Record<string, boolean> {
  return {
    placeholder: true,
    fal: Boolean(process.env.FAL_KEY),
    heygen: Boolean(
      process.env.HEYGEN_API_KEY && process.env.HEYGEN_AVATAR_ID && process.env.HEYGEN_VOICE_ID,
    ),
  };
}

export async function generateBroll(
  provider: BrollProviderId,
  req: BrollRequest,
): Promise<GeneratedMedia> {
  if (provider === "fal") {
    try {
      return await brollFal(req);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return { ...brollPlaceholder(req), note: `fal.ai fell back to a placeholder: ${reason}` };
    }
  }
  return brollPlaceholder(req);
}

export async function generateAvatar(
  provider: AvatarProviderId,
  req: AvatarRequest,
): Promise<GeneratedMedia> {
  if (provider === "heygen") {
    try {
      return await avatarHeygen(req);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return { ...avatarPlaceholder(req), note: `HeyGen fell back to a placeholder: ${reason}` };
    }
  }
  return avatarPlaceholder(req);
}
