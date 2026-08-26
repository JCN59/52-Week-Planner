import { NextResponse } from "next/server";
import { AVATAR_PROVIDERS, BROLL_PROVIDERS, providerAvailability } from "@/lib/video/providers";
import { MOTION_ORDER, MOTION_PRESETS } from "@/lib/video/motion";
import { WORKFLOWS } from "@/lib/video/workflows";
import { hasClaude, VIDEO_MODEL } from "@/lib/video/claude";

export const runtime = "nodejs";

/** Everything the Mission Control UI needs to render its controls. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    workflows: WORKFLOWS.map((w) => ({
      id: w.id,
      name: w.name,
      blurb: w.blurb,
      defaults: w.defaults,
      motionVocabulary: w.motionVocabulary,
      accent: w.theme.accent,
      bg: w.theme.bg,
    })),
    motions: MOTION_ORDER.map((id) => ({
      id,
      label: MOTION_PRESETS[id].label,
      blurb: MOTION_PRESETS[id].blurb,
    })),
    brollProviders: BROLL_PROVIDERS,
    avatarProviders: AVATAR_PROVIDERS,
    availability: providerAvailability(),
    claude: { available: hasClaude(), model: VIDEO_MODEL },
  });
}
