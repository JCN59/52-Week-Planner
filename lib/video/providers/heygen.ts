// ---- HeyGen avatar provider ----
//
// Submits an avatar video and polls video_status.get until it completes.
// Set HEYGEN_API_KEY, plus HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID (both are
// account-specific — list them from HeyGen's avatars/voices endpoints).

import type { AvatarRequest, GeneratedMedia } from "./types";
import { ProviderError } from "./types";

const GENERATE_URL = "https://api.heygen.com/v2/video/generate";
const STATUS_URL = "https://api.heygen.com/v1/video_status.get";

function deadlineMs(): number {
  const raw = Number(process.env.VIDEO_GEN_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 240_000;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function avatarHeygen(req: AvatarRequest): Promise<GeneratedMedia> {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new ProviderError("HEYGEN_API_KEY is not set", "heygen");

  const avatarId = process.env.HEYGEN_AVATAR_ID;
  const voiceId = req.voiceId || process.env.HEYGEN_VOICE_ID;
  if (!avatarId || !voiceId) {
    throw new ProviderError("HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID must both be set", "heygen");
  }

  const headers = { "X-Api-Key": key, "Content-Type": "application/json" };

  const submit = await fetch(GENERATE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      video_inputs: [
        {
          character: { type: "avatar", avatar_id: avatarId, avatar_style: "normal" },
          voice: { type: "text", input_text: req.script, voice_id: voiceId },
          background: { type: "color", value: "#101010" },
        },
      ],
      dimension: { width: req.frame.width, height: req.frame.height },
    }),
  });

  if (!submit.ok) {
    throw new ProviderError(
      `HeyGen generate failed (${submit.status}): ${await submit.text()}`,
      "heygen",
    );
  }

  const created = (await submit.json()) as { data?: { video_id?: string }; error?: unknown };
  const videoId = created.data?.video_id;
  if (!videoId) {
    throw new ProviderError(`HeyGen returned no video_id: ${JSON.stringify(created)}`, "heygen");
  }

  const stopAt = Date.now() + deadlineMs();
  let videoUrl: string | undefined;
  while (Date.now() < stopAt) {
    await sleep(5000);
    const poll = await fetch(`${STATUS_URL}?video_id=${encodeURIComponent(videoId)}`, { headers });
    if (!poll.ok) throw new ProviderError(`HeyGen status failed (${poll.status})`, "heygen");
    const body = (await poll.json()) as {
      data?: { status?: string; video_url?: string; error?: { message?: string } };
    };
    const status = body.data?.status;
    if (status === "completed") {
      videoUrl = body.data?.video_url;
      break;
    }
    if (status === "failed") {
      throw new ProviderError(
        `HeyGen render failed: ${body.data?.error?.message ?? "no reason given"}`,
        "heygen",
      );
    }
  }

  if (!videoUrl) {
    throw new ProviderError(
      `HeyGen did not finish within ${Math.round(deadlineMs() / 1000)}s`,
      "heygen",
    );
  }

  const media = await fetch(videoUrl);
  if (!media.ok) {
    throw new ProviderError(`downloading HeyGen output failed (${media.status})`, "heygen");
  }

  return {
    data: Buffer.from(await media.arrayBuffer()),
    extension: "mp4",
    mediaType: "video",
    provider: "heygen",
  };
}
